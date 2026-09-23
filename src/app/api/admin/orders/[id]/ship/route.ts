import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { generateAwbForOrder } from "@/services/checkout.service";

const bodySchema = z.object({
  /**
   * `courier` asks Fan Courier for a new AWB; `manual` records a number the
   * operator already has (or none at all, for a hand-delivered order).
   */
  mode: z.enum(["courier", "manual"]),
  awbNumber: z.string().trim().max(40).optional(),
});

/** Mark an order as shipped, with or without generating an AWB. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid ship request." }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    return Response.json(
      { error: "This order has already been shipped." },
      { status: 409 }
    );
  }
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return Response.json(
      { error: "A cancelled order cannot be shipped." },
      { status: 409 }
    );
  }

  if (parsed.data.mode === "courier") {
    if (order.awbNumber) {
      return Response.json(
        { error: `An AWB already exists for this order (${order.awbNumber}).` },
        { status: 409 }
      );
    }

    // Reuses the exact path the payment webhook takes, so an AWB created from
    // the panel is indistinguishable from an automatic one — same payload,
    // same normalisation, same customer notification.
    const result = await generateAwbForOrder(id);
    if (!result.success) {
      return Response.json(
        { error: result.error ?? "Fan Courier rejected the shipment." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, awbNumber: result.awbNumber });
  }

  const awbNumber = parsed.data.awbNumber?.trim() || null;

  await db.$transaction([
    db.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
        shippingStatus: awbNumber ? "AWB_MANUAL" : "SHIPPED_NO_AWB",
        ...(awbNumber ? { awbNumber } : {}),
      },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId: id,
        status: "SHIPPED",
        // The timeline is customer-facing history, so its notes stay Romanian
        // alongside the ones the checkout flow writes.
        note: awbNumber
          ? `Marcată ca expediată din panou (AWB ${awbNumber})`
          : "Marcată ca expediată din panou, fără AWB",
      },
    }),
  ]);

  return Response.json({ ok: true, awbNumber });
}
