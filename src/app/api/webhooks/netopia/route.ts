import { verifyIpn } from "@/lib/integrations/netopia/ipn";
import { updatePaymentStatus, findOrderByNumber } from "@/services/order.service";
import { generateAwbForOrder } from "@/services/checkout.service";
import type { PaymentStatus } from "@/lib/validation";

const SUCCESS_XML = `<?xml version="1.0" encoding="utf-8" ?><crc error_type="0" error_code="0">OK</crc>`;
const ERROR_XML = `<?xml version="1.0" encoding="utf-8" ?><crc error_type="1" error_code="1">ERROR</crc>`;

const xmlResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "application/xml" },
  });

export async function POST(req: Request) {
  try {
    // CRITICAL: Read raw body as text before any JSON parsing
    const rawBody = await req.text();

    const token = req.headers.get("verification-token");
    if (!token) {
      console.error("[Netopia IPN] Missing verification-token header");
      return xmlResponse(ERROR_XML, 400);
    }

    // Verify JWT + body hash → returns parsed & validated payload
    let payload;
    try {
      payload = verifyIpn(rawBody, token);
    } catch (verifyError) {
      console.error("[Netopia IPN] Verification failed:", verifyError);
      return xmlResponse(ERROR_XML, 401);
    }

    const { ntpID, orderID, status: netopiaStatus } = payload;
    console.log(
      `[Netopia IPN] Received: orderID=${orderID}, ntpID=${ntpID}, status=${netopiaStatus}`
    );

    // Map Netopia status codes to our PaymentStatus
    let paymentStatus: PaymentStatus = "PROCESSING";
    if (netopiaStatus === 3 || netopiaStatus === 5) {
      paymentStatus = "PAID";
    } else if (netopiaStatus === 12) {
      paymentStatus = "FAILED";
    }

    // Find the order by the Netopia orderID (which is our orderNumber)
    const order = await findOrderByNumber(orderID);
    if (!order) {
      // Still return OK to Netopia so it doesn't retry for a non-existent order
      console.warn(`[Netopia IPN] Order not found: ${orderID}`);
      return xmlResponse(SUCCESS_XML);
    }

    // Idempotency: if already PAID, just acknowledge
    if (order.paymentStatus === "PAID" && paymentStatus === "PAID") {
      console.log(`[Netopia IPN] Order ${orderID} already PAID, acknowledging`);
      return xmlResponse(SUCCESS_XML);
    }

    // Update payment status using the netopiaOrderId stored on the order
    await updatePaymentStatus(order.netopiaOrderId!, {
      paymentStatus,
      netopiaNtpId: ntpID,
      netopiaStatus,
      paidAt: paymentStatus === "PAID" ? new Date() : undefined,
    });

    // If payment confirmed, fire-and-forget AWB generation
    if (paymentStatus === "PAID") {
      generateAwbForOrder(order.id)
        .then((result) => {
          if (result.success) {
            console.log(
              `[Netopia IPN] AWB ${result.awbNumber} generated for order ${orderID}`
            );
          } else {
            console.error(
              `[Netopia IPN] AWB generation failed for order ${orderID}: ${result.error}`
            );
          }
        })
        .catch((err) => {
          console.error(
            `[Netopia IPN] AWB generation error for order ${orderID}:`,
            err
          );
        });
    }

    return xmlResponse(SUCCESS_XML);
  } catch (error) {
    console.error("[Netopia IPN] Unexpected error:", error);
    return xmlResponse(ERROR_XML, 500);
  }
}
