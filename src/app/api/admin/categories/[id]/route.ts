import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  categoryBaseSchema,
  categoryPatchSchema,
} from "@/lib/admin/category-schema";
import { revalidateStorefront } from "@/lib/admin/revalidate";
import {
  genericError,
  isMissingRecord,
  uniqueViolation,
} from "@/lib/admin/api-errors";

async function write(
  id: string,
  request: Request,
  schema: typeof categoryBaseSchema | typeof categoryPatchSchema,
  context: string
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
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
    const category = await db.category.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
    });
    revalidateStorefront();
    return Response.json({ ok: true, category });
  } catch (error) {
    if (isMissingRecord(error)) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }
    const conflict = uniqueViolation(error);
    return conflict
      ? Response.json(conflict, { status: 409 })
      : Response.json(genericError(error, context), { status: 500 });
  }
}

/** PATCH — one field from an inline edit. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  return write(id, request, categoryPatchSchema, "categories/patch");
}

/** PUT — the whole category, from the form. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  return write(id, request, categoryBaseSchema, "categories/put");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { products: true } } },
  });
  if (!category) {
    return Response.json({ error: "Category not found." }, { status: 404 });
  }

  // Product.categoryId is a required relation, so deleting a category with
  // products would fail at the database anyway — catching it here lets us say
  // how many products are in the way and what to do about it.
  if (category._count.products > 0) {
    return Response.json(
      {
        error: `${category.name} still holds ${category._count.products} ${
          category._count.products === 1 ? "product" : "products"
        }. Move them to another category first.`,
      },
      { status: 409 }
    );
  }

  try {
    await db.category.delete({ where: { id } });
    revalidateStorefront();
    return Response.json({ ok: true });
  } catch (error) {
    if (isMissingRecord(error)) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }
    return Response.json(genericError(error, "categories/delete"), {
      status: 500,
    });
  }
}
