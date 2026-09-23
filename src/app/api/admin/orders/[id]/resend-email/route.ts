import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { sendOrderConfirmation } from "@/lib/email/client";

/** Re-send the order confirmation email to the address on the order. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  if (!process.env.RESEND_API_KEY) {
    // sendOrderConfirmation logs and returns silently without a key, which
    // would otherwise report a cheerful success for an email nobody received.
    return Response.json(
      { error: "RESEND_API_KEY is not set — no email can be sent." },
      { status: 503 }
    );
  }

  try {
    await sendOrderConfirmation({
      to: order.billingEmail,
      orderNumber: order.orderNumber,
      total: order.total,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown mail error";
    return Response.json(
      { error: `Resend rejected the message: ${message}` },
      { status: 502 }
    );
  }

  await db.orderStatusHistory.create({
    data: {
      orderId: id,
      status: order.status,
      note: `Email de confirmare retrimis către ${order.billingEmail}`,
    },
  });

  return Response.json({ ok: true, to: order.billingEmail });
}
