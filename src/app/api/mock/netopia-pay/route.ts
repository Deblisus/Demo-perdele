import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentStatus, findOrderByNumber } from "@/services/order.service";
import { generateAwbForOrder } from "@/services/checkout.service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderID = url.searchParams.get('orderID'); // The orderNumber
  
  if (!orderID) return new NextResponse("Missing orderID", { status: 400 });

  const order = await findOrderByNumber(orderID);
  if (!order) return new NextResponse("Order not found", { status: 404 });

  // Simulate Netopia Webhook marking payment as PAID
  await updatePaymentStatus(order.netopiaOrderId!, {
    paymentStatus: "PAID",
    netopiaNtpId: "mock-ntp-" + Date.now(),
    netopiaStatus: 3,
    paidAt: new Date(),
  });

  // Trigger Fan Courier AWB generation just like the real webhook
  generateAwbForOrder(order.id).catch(console.error);

  // Redirect customer back to the shop's success page
  return NextResponse.redirect(new URL(`/checkout/success?orderNumber=${orderID}`, req.url));
}
