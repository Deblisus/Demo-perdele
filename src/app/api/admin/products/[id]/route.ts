import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  productCreateSchema,
  productPatchSchema,
} from "@/lib/admin/product-schema";
import { revalidateStorefront } from "@/lib/admin/revalidate";
import {
  genericError,
  isMissingRecord,
  uniqueViolation,
} from "@/lib/admin/api-errors";

/**
 * PATCH — one or two fields, from an inline cell edit or a row toggle.
 * PUT    — the whole product, from the edit form.
 * DELETE — remove it, unless an order references it.
 */

/** Full product, for the edit form. Fetched on open so the table stays light. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }
  return Response.json({ product }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = productPatchSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid update.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // The two price fields constrain each other, and a patch usually carries only
  // one of them — so the cross-field rule has to be checked against the merged
  // result, not against the payload. Without this an inline price edit can push
  // the selling price above the strike-through one and show customers a
  // "discount" that is really a markup.
  const touchesPrice =
    parsed.data.pricePerUnit !== undefined ||
    parsed.data.originalPrice !== undefined;

  if (touchesPrice) {
    const current = await db.product.findUnique({
      where: { id },
      select: { pricePerUnit: true, originalPrice: true },
    });
    if (!current) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }

    const price = parsed.data.pricePerUnit ?? current.pricePerUnit;
    const original =
      parsed.data.originalPrice !== undefined
        ? parsed.data.originalPrice
        : current.originalPrice;

    if (original != null && original <= price) {
      return Response.json(
        {
          error: "Original price must be higher than the current price.",
          fields: {
            [parsed.data.originalPrice !== undefined
              ? "originalPrice"
              : "pricePerUnit"]: [
              `The strike-through price is ${original} — clear it, or keep the selling price below it.`,
            ],
          },
        },
        { status: 400 }
      );
    }
  }

  try {
    const product = await db.product.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        pricePerUnit: true,
        originalPrice: true,
        inStock: true,
        isFeatured: true,
        isOnSale: true,
        categoryId: true,
      },
    });

    revalidateStorefront();
    return Response.json({ ok: true, product });
  } catch (error) {
    if (isMissingRecord(error)) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }
    const conflict = uniqueViolation(error);
    return conflict
      ? Response.json(conflict, { status: 409 })
      : Response.json(genericError(error, "products/patch"), { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = productCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Some fields need fixing.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { images, ...data } = parsed.data;

  try {
    // Images are replaced wholesale rather than diffed: the form owns the
    // complete ordered list, and reconciling it row by row would be a lot of
    // machinery to arrive at the same three rows.
    await db.$transaction([
      db.productImage.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: {
          ...data,
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              alt: image.alt ?? null,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);

    revalidateStorefront();
    return Response.json({ ok: true });
  } catch (error) {
    if (isMissingRecord(error)) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }
    const conflict = uniqueViolation(error);
    return conflict
      ? Response.json(conflict, { status: 409 })
      : Response.json(genericError(error, "products/put"), { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!product) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }

  // OrderItem stores productId as a loose string with no foreign key, so Prisma
  // would happily delete a product that past orders still point at and leave
  // those line items dangling. Check explicitly and refuse.
  const orderedCount = await db.orderItem.count({ where: { productId: id } });
  if (orderedCount > 0) {
    return Response.json(
      {
        error: `${product.name} appears on ${orderedCount} order ${
          orderedCount === 1 ? "line" : "lines"
        } and cannot be deleted. Mark it out of stock instead.`,
      },
      { status: 409 }
    );
  }

  try {
    await db.product.delete({ where: { id } });
    revalidateStorefront();
    return Response.json({ ok: true });
  } catch (error) {
    if (isMissingRecord(error)) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }
    return Response.json(genericError(error, "products/delete"), {
      status: 500,
    });
  }
}
