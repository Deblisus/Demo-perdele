import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { fanCourierClient } from "@/lib/integrations/fan-courier";

/** Stream the Fan Courier label PDF for an order's AWB. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: { awbNumber: true, orderNumber: true },
  });
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }
  if (!order.awbNumber) {
    return Response.json(
      { error: "This order has no AWB yet." },
      { status: 404 }
    );
  }

  try {
    const pdf = await fanCourierClient.getAwbLabel(order.awbNumber, "pdf");
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        // `inline` so the browser previews it; the viewer's own save button
        // handles downloading, which beats forcing a file into Downloads.
        "content-disposition": `inline; filename="AWB-${order.awbNumber}-${order.orderNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown courier error";
    return Response.json(
      { error: `Could not fetch the label: ${message}` },
      { status: 502 }
    );
  }
}
