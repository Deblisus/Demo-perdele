import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const PRODUCTS_PER_PAGE = 30;

export const PRODUCT_SORTS = ["name", "price", "updated", "category"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductQuery = {
  q: string;
  category: string;
  stock: "all" | "in" | "out";
  flag: "all" | "featured" | "sale";
  sort: ProductSort;
  dir: "asc" | "desc";
  page: number;
};

export function parseProductQuery(
  params: Record<string, string | string[] | undefined>
): ProductQuery {
  const single = (key: string): string => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };

  const sortRaw = single("sort") as ProductSort;
  const stockRaw = single("stock");
  const flagRaw = single("flag");
  const page = Number.parseInt(single("page"), 10);

  return {
    q: single("q").slice(0, 120),
    category: single("category"),
    stock: stockRaw === "in" || stockRaw === "out" ? stockRaw : "all",
    flag: flagRaw === "featured" || flagRaw === "sale" ? flagRaw : "all",
    sort: PRODUCT_SORTS.includes(sortRaw) ? sortRaw : "updated",
    // Newest-edited first is the useful default; names read better A→Z.
    dir: single("dir") === "asc" ? "asc" : single("dir") === "desc" ? "desc" : sortRaw === "name" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function buildWhere(query: ProductQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (query.q) {
    and.push({
      OR: [
        { name: { contains: query.q } },
        { sku: { contains: query.q } },
        { slug: { contains: query.q } },
        { color: { contains: query.q } },
      ],
    });
  }
  if (query.category) and.push({ categoryId: query.category });
  if (query.stock !== "all") and.push({ inStock: query.stock === "in" });
  if (query.flag === "featured") and.push({ isFeatured: true });
  if (query.flag === "sale") and.push({ isOnSale: true });

  return and.length > 0 ? { AND: and } : {};
}

function buildOrderBy(
  query: ProductQuery
): Prisma.ProductOrderByWithRelationInput[] {
  switch (query.sort) {
    case "name":
      return [{ name: query.dir }];
    case "price":
      return [{ pricePerUnit: query.dir }, { name: "asc" }];
    case "category":
      return [{ category: { name: query.dir } }, { name: "asc" }];
    default:
      return [{ updatedAt: query.dir }];
  }
}

export async function findProducts(query: ProductQuery) {
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: buildOrderBy(query),
      skip: (query.page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      include: {
        category: { select: { id: true, name: true } },
        // Only the primary image is needed for the row thumbnail; the edit
        // form fetches the full set when it opens.
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    db.product.count({ where }),
  ]);

  return {
    rows,
    total,
    pages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}

/** Categories for the filter bar and the product form's picker. */
export async function getCategoryOptions() {
  return db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}

/** One product with every field the edit form binds to. */
export async function getProductForEdit(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}
