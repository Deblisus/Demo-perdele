import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { categoryBaseSchema } from "@/lib/admin/category-schema";
import { revalidateStorefront } from "@/lib/admin/revalidate";
import { genericError, uniqueViolation } from "@/lib/admin/api-errors";

/** Create a category. */
export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = categoryBaseSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Some fields need fixing.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const category = await db.category.create({
      data: parsed.data,
      select: { id: true, slug: true },
    });
    revalidateStorefront();
    return Response.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    const conflict = uniqueViolation(error);
    return conflict
      ? Response.json(conflict, { status: 409 })
      : Response.json(genericError(error, "categories"), { status: 500 });
  }
}
