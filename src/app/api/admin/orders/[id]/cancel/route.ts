import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { updateOrderStatus } from "@/services/order.service";

const bodySchema = z.object({
  reason: z.string().trim().max(200).optional(),
});

/**
 * Cancel an order.
 *
 * This only changes our own records: it does not refund a Netopia capture and
 * does not void a Fan Courier AWB. Both are surfaced back to the operator in
 * `warnings` so the panel can say plainly what still needs doing by hand.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid cancel request." }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status === "CANCELLED") {
    return Response.json(
      { error: "This order is already cancelled." },
      { status: 409 }
    );
  }
  if (order.status === "DELIVERED") {
    return Response.json(
      { error: "A delivered order cannot be cancelled — refund it instead." },
      { status: 409 }
    );
  }

  const reason = parsed.data.reason?.trim();
  await updateOrderStatus(
    id,
    "CANCELLED",
    reason ? `Anulată din panou: ${reason}` : "Anulată din panou"
  );

  const warnings: string[] = [];
  if (order.paymentStatus === "PAID") {
    warnings.push(
      "Payment was already captured. Refund it in the Netopia dashboard — cancelling here does not move money."
    );
  }
  if (order.awbNumber) {
    warnings.push(
      `AWB ${order.awbNumber} is still live. Cancel it with Fan Courier so the parcel is not collected.`
    );
  }

  return Response.json({ ok: true, warnings });
}
