import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ── Types ────────────────────────────────────────────────────────

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export type ProductListItem = Prisma.ProductGetPayload<{
  include: { images: { take: 1 }; category: { select: { name: true; slug: true } } };
}>;

export type CategoryWithCount = Prisma.CategoryGetPayload<{}> & {
  _count: { products: number };
};

// ── Filter types ─────────────────────────────────────────────────

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  opacity?: string;
  color?: string;
  fabricType?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
}

export type ProductSortOption =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "newest";

// ── Queries ──────────────────────────────────────────────────────

/**
 * Get products with filtering, sorting, and pagination.
 */
export async function getProducts(options: {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
}) {
  const { filters = {}, sort = "recommended", page = 1, pageSize = 24 } = options;

  const where: Prisma.ProductWhereInput = {
    ...(filters.categorySlug && {
      category: { slug: filters.categorySlug },
    }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { shortDescription: { contains: filters.search } },
      ],
    }),
    ...(filters.minPrice !== undefined && {
      pricePerUnit: { gte: filters.minPrice },
    }),
    ...(filters.maxPrice !== undefined && {
      pricePerUnit: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        lte: filters.maxPrice,
      },
    }),
    ...(filters.opacity && { opacity: filters.opacity }),
    ...(filters.color && { color: filters.color }),
    ...(filters.fabricType && { fabricType: filters.fabricType }),
    ...(filters.inStock !== undefined && { inStock: filters.inStock }),
    ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
    ...(filters.isOnSale !== undefined && { isOnSale: filters.isOnSale }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case "price-asc":
        return { pricePerUnit: "asc" as const };
      case "price-desc":
        return { pricePerUnit: "desc" as const };
      case "newest":
        return { createdAt: "desc" as const };
      case "recommended":
      default:
        return { isFeatured: "desc" as const };
    }
  })();

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single product by slug (for PDP).
 */
export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
}

/**
 * Get featured products (for landing page).
 */
export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { isFeatured: true, inStock: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });
}

/**
 * Get on-sale products.
 */
export async function getOnSaleProducts(limit = 8) {
  return db.product.findMany({
    where: { isOnSale: true, inStock: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });
}

/**
 * Get related products (same category, excluding current product).
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 6
) {
  return db.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      inStock: true,
    },
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });
}

/**
 * Get all categories with product counts (for navigation and filters).
 */
export async function getCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

/**
 * Get a single category by slug.
 */
export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

/**
 * Get unique filter values for the product filter sidebar.
 */
export async function getFilterOptions() {
  const [colors, opacities, fabricTypes, priceRange] = await Promise.all([
    db.product.findMany({
      where: { inStock: true },
      select: { color: true, colorHex: true },
      distinct: ["color"],
      orderBy: { color: "asc" },
    }),
    db.product.findMany({
      where: { inStock: true, opacity: { not: null } },
      select: { opacity: true },
      distinct: ["opacity"],
    }),
    db.product.findMany({
      where: { inStock: true, fabricType: { not: null } },
      select: { fabricType: true },
      distinct: ["fabricType"],
    }),
    db.product.aggregate({
      where: { inStock: true },
      _min: { pricePerUnit: true },
      _max: { pricePerUnit: true },
    }),
  ]);

  return {
    colors: colors.filter(
      (c): c is { color: string; colorHex: string } =>
        c.color !== null && c.colorHex !== null
    ),
    opacities: opacities
      .map((o) => o.opacity)
      .filter((o): o is string => o !== null),
    fabricTypes: fabricTypes
      .map((f) => f.fabricType)
      .filter((f): f is string => f !== null),
    priceRange: {
      min: priceRange._min.pricePerUnit ?? 0,
      max: priceRange._max.pricePerUnit ?? 500,
    },
  };
}
