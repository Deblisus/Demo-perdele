import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { productCreateSchema } from "@/lib/admin/product-schema";
import { revalidateStorefront } from "@/lib/admin/revalidate";
import { genericError, uniqueViolation } from "@/lib/admin/api-errors";

/** Create a product, with its images, in one transaction. */
export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

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
        // Flattened so the form can pin each message to its own input.
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { images, ...data } = parsed.data;

  const category = await db.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return Response.json(
      { error: "That category no longer exists.", fields: { categoryId: ["Unknown category"] } },
      { status: 400 }
    );
  }

  try {
    const product = await db.product.create({
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
      select: { id: true, slug: true },
    });

    revalidateStorefront();
    return Response.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    const conflict = uniqueViolation(error);
    return conflict
      ? Response.json(conflict, { status: 409 })
      : Response.json(genericError(error, "products"), { status: 500 });
  }
}
