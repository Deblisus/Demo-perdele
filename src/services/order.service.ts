import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils/currency";
import type {
  CheckoutFormData,
  OrderStatus,
  PaymentStatus,
} from "@/lib/validation";
import { calculateShippingCost } from "./shipping.service";
import { calculateItemTotal, roundPrice } from "@/lib/utils/currency";

// ── Types ────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  checkout: CheckoutFormData;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  awbNumber: string | null;
  createdAt: Date;
}

// ── Service ──────────────────────────────────────────────────────────

/**
 * Create a new order from checkout form data.
 *
 * 1. Calculate subtotal from line items
 * 2. Determine shipping cost (free above threshold)
 * 3. Persist order + items to database
 * 4. Return order with generated orderNumber
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<OrderSummary> {
  const { checkout } = input;
  const { billing, shipping, items, paymentMethod, sameAsShipping } = checkout;

  // Calculate pricing
  const subtotal = roundPrice(
    items.reduce(
      (sum, item) =>
        sum +
        calculateItemTotal({
          pricePerUnit: item.pricePerUnit,
          quantity: item.quantity,
          pricingUnit: item.pricingUnit,
          tailoringPricePerUnit: item.tailoringPricePerUnit,
        }),
      0
    )
  );

  const shippingCost = calculateShippingCost(subtotal);
  const total = roundPrice(subtotal + shippingCost);

  // Resolve shipping address
  const ship = sameAsShipping
    ? {
        shippingFirstName: billing.firstName,
        shippingLastName: billing.lastName,
        shippingPhone: billing.phone,
        shippingAddress: billing.address,
        shippingCity: billing.city,
        shippingCounty: billing.county,
        shippingZipCode: billing.zipCode ?? null,
      }
    : {
        shippingFirstName: shipping.firstName,
        shippingLastName: shipping.lastName,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingCounty: shipping.county,
        shippingZipCode: shipping.zipCode ?? null,
      };

  // Generate order number (based on existing count)
  const orderCount = await db.order.count();
  const orderNumber = generateOrderNumber(orderCount + 1);

  // Generate unique Netopia order ID (max 64 chars)
  const netopiaOrderId = `${orderNumber}-${Date.now()}`;

  // Persist to DB
  const order = await db.order.create({
    data: {
      orderNumber,
      status: "PENDING",
      paymentMethod,
      paymentStatus: "PENDING",
      subtotal,
      shippingCost,
      total,
      netopiaOrderId,

      // Billing
      billingFirstName: billing.firstName,
      billingLastName: billing.lastName,
      billingEmail: billing.email,
      billingPhone: billing.phone,
      billingAddress: billing.address,
      billingCity: billing.city,
      billingCounty: billing.county,
      billingZipCode: billing.zipCode ?? null,

      // Shipping
      ...ship,

      // Customer (guest checkout — always create new)
      customer: {
        create: {
          email: billing.email,
          phone: billing.phone,
          firstName: billing.firstName,
          lastName: billing.lastName,
        },
      },

      // Line items
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.pricePerUnit,
          totalPrice: calculateItemTotal({
            pricePerUnit: item.pricePerUnit,
            quantity: item.quantity,
            pricingUnit: item.pricingUnit,
            tailoringPricePerUnit: item.tailoringPricePerUnit,
          }),
          widthMeters:
            item.pricingUnit === "ml" ? item.quantity : null,
          heightCm: item.heightCm ?? null,
          tailoringType: item.tailoringType ?? "none",
          tailoringCost: item.tailoringPricePerUnit ?? 0,
        })),
      },

      // Status history
      statusHistory: {
        create: {
          status: "PENDING",
          note: "Comandă creată",
        },
      },
    },
  });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    paymentStatus: order.paymentStatus as PaymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    awbNumber: order.awbNumber,
    createdAt: order.createdAt,
  };
}

/**
 * Update an order's status with audit trail.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<void> {
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: note ?? null,
      },
    }),
  ]);
}

/**
 * Update payment status after Netopia IPN callback.
 */
export async function updatePaymentStatus(
  netopiaOrderId: string,
  data: {
    paymentStatus: PaymentStatus;
    netopiaNtpId?: string;
    netopiaStatus?: number;
    paidAt?: Date;
  }
): Promise<OrderSummary | null> {
  const order = await db.order.findUnique({
    where: { netopiaOrderId },
  });

  if (!order) return null;

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: data.paymentStatus,
      netopiaNtpId: data.netopiaNtpId ?? order.netopiaNtpId,
      netopiaStatus: data.netopiaStatus ?? order.netopiaStatus,
      paidAt: data.paidAt ?? order.paidAt,
      status:
        data.paymentStatus === "PAID"
          ? "PAID"
          : data.paymentStatus === "FAILED"
            ? "CANCELLED"
            : order.status,
    },
  });

  // Record status change in history
  if (data.paymentStatus === "PAID" || data.paymentStatus === "FAILED") {
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: data.paymentStatus === "PAID" ? "PAID" : "CANCELLED",
        note:
          data.paymentStatus === "PAID"
            ? `Plată confirmată (Netopia ntpID: ${data.netopiaNtpId})`
            : `Plată eșuată (Netopia status: ${data.netopiaStatus})`,
      },
    });
  }

  return {
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status as OrderStatus,
    paymentStatus: updated.paymentStatus as PaymentStatus,
    subtotal: updated.subtotal,
    shippingCost: updated.shippingCost,
    total: updated.total,
    awbNumber: updated.awbNumber,
    createdAt: updated.createdAt,
  };
}

/**
 * Find an order by its ID.
 */
export async function findOrderById(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}

/**
 * Find an order by its human-readable order number.
 */
export async function findOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}

/**
 * Store AWB details on an order after Fan Courier generation.
 */
export async function updateOrderAwb(
  orderId: string,
  data: {
    awbNumber: string;
    awbCost?: number;
  }
): Promise<void> {
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: {
        awbNumber: data.awbNumber,
        awbCost: data.awbCost ?? null,
        shippingStatus: "AWB_GENERATED",
        shippedAt: new Date(),
        status: "SHIPPED",
      },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId,
        status: "SHIPPED",
        note: `AWB generat: ${data.awbNumber}`,
      },
    }),
  ]);
}
