import type { CheckoutFormData } from "@/lib/validation";
import { netopiaClient } from "@/lib/integrations/netopia";
import {
  fanCourierClient,
  formatAwbErrors,
  normalizeAddressFieldMax,
} from "@/lib/integrations/fan-courier";
import { createOrder, updateOrderAwb, findOrderById } from "./order.service";
import {
  sendOrderConfirmation,
  sendShippingNotification,
} from "@/lib/email/client";

// ── Types ────────────────────────────────────────────────────────────

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  paymentUrl: string;
}

// ── Checkout orchestration ───────────────────────────────────────────

/**
 * Process a checkout submission:
 * 1. Create the order in the database
 * 2. Initiate payment with Netopia
 * 3. Return the payment redirect URL to the client
 *
 * Post-payment processing (AWB generation, emails) happens asynchronously
 * in the IPN webhook handler after payment confirmation.
 */
export async function processCheckout(
  formData: CheckoutFormData
): Promise<CheckoutResult> {
  // 1. Persist the order
  const order = await createOrder({ checkout: formData });

  // 2. Initiate Netopia payment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const paymentResult = await netopiaClient.startPayment({
    orderId: order.orderNumber,
    amount: order.total,
    currency: "RON",
    description: `Comandă ${order.orderNumber}`,
    billing: {
      firstName: formData.billing.firstName,
      lastName: formData.billing.lastName,
      email: formData.billing.email,
      phone: formData.billing.phone,
      city: formData.billing.city,
      country: "Romania",
      address: formData.billing.address,
      postalCode: formData.billing.zipCode,
    },
    shipping: {
      firstName: formData.sameAsShipping
        ? formData.billing.firstName
        : formData.shipping.firstName,
      lastName: formData.sameAsShipping
        ? formData.billing.lastName
        : formData.shipping.lastName,
      email: formData.billing.email,
      phone: formData.sameAsShipping
        ? formData.billing.phone
        : formData.shipping.phone,
      city: formData.sameAsShipping
        ? formData.billing.city
        : formData.shipping.city,
      country: "Romania",
      address: formData.sameAsShipping
        ? formData.billing.address
        : formData.shipping.address,
      postalCode: formData.sameAsShipping
        ? formData.billing.zipCode
        : formData.shipping.zipCode,
    },
    notifyUrl: `${appUrl}/api/webhooks/netopia`,
    redirectUrl: `${appUrl}/checkout/success?orderNumber=${order.orderNumber}`,
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentUrl: paymentResult.paymentUrl,
  };
}

/**
 * Generate and store a Fan Courier AWB for a paid order.
 *
 * Called asynchronously after payment confirmation (from IPN handler).
 * Errors here should NOT block the payment flow.
 */
export async function generateAwbForOrder(orderId: string): Promise<{
  awbNumber: string;
  success: boolean;
  error?: string;
}> {
  const order = await findOrderById(orderId);

  if (!order) {
    return { awbNumber: "", success: false, error: "Order not found" };
  }

  try {
    const awbResult = await fanCourierClient.createAwb({
      service: "Standard",
      recipient: {
        // Fan Courier's nomenclator is diacritic-free and it rejects, rather
        // than trims, over-long values — normalize to the documented limits.
        name: normalizeAddressFieldMax(
          `${order.shippingFirstName} ${order.shippingLastName}`,
          50
        ),
        phone: order.shippingPhone,
        email: order.billingEmail,
        county: normalizeAddressFieldMax(order.shippingCounty, 50),
        city: normalizeAddressFieldMax(order.shippingCity, 50),
        street: normalizeAddressFieldMax(order.shippingAddress, 255),
        zipCode: order.shippingZipCode
          ? normalizeAddressFieldMax(order.shippingZipCode, 6)
          : undefined,
      },
      parcels: 1,
      envelopes: 0,
      weight: 1.5, // Default weight for curtain packages
      content: `Comanda ${order.orderNumber}`.slice(0, 255),
      payment: "expeditor",
      dimensions: { length: 40, height: 10, width: 30 },
      // No extra options: availability is per service *and* per contract
      // (GET /reports/service-options?service=Standard), and an unavailable
      // code fails the whole shipment. Recipient notification is handled by
      // our own sendShippingNotification email below.
    });

    // AWB response wraps in response[] array. Validation failures come back as
    // HTTP 200 with awbNumber: null and a field -> messages map in `errors`.
    const firstResult = awbResult.response[0];
    if (!firstResult?.awbNumber) {
      throw new Error(
        formatAwbErrors(firstResult?.errors) ?? "No AWB number returned"
      );
    }

    const awbNumber = firstResult.awbNumber;

    // Store AWB on the order
    await updateOrderAwb(orderId, {
      awbNumber,
      awbCost: firstResult.tariff ?? undefined,
    });

    // Email the AWB to the customer. Awaited rather than fired-and-forgotten:
    // this whole function is already called detached from the request, so an
    // un-awaited promise can be torn down before the send completes.
    // sendShippingNotification handles its own errors, so this cannot mask a
    // successfully created AWB.
    await sendShippingNotification({
      to: order.billingEmail,
      orderNumber: order.orderNumber,
      awbNumber,
      trackingUrl: `https://www.fancourier.ro/awb-tracking/?awb=${awbNumber}`,
    });

    return { awbNumber, success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AWB generation error";
    console.error(`[Checkout] AWB generation failed for order ${orderId}:`, message);
    return { awbNumber: "", success: false, error: message };
  }
}
