import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { productBulkSchema } from "@/lib/admin/product-schema";
import { revalidateStorefront } from "@/lib/admin/revalidate";
import { genericError } from "@/lib/admin/api-errors";

const ACTION_DATA = {
  feature: { isFeatured: true },
  unfeature: { isFeatured: false },
  in_stock: { inStock: true },
  out_of_stock: { inStock: false },
  on_sale: { isOnSale: true },
  off_sale: { isOnSale: false },
} as const;

/** Apply one flag change to every selected product. */
export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = productBulkSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Invalid bulk request." }, { status: 400 });
  }

  const { ids, action } = parsed.data;

  try {
    const result = await db.product.updateMany({
      where: { id: { in: ids } },
      data: ACTION_DATA[action],
    });

    revalidateStorefront();
    return Response.json({ ok: true, updated: result.count });
  } catch (error) {
    return Response.json(genericError(error, "products/bulk"), { status: 500 });
  }
}
