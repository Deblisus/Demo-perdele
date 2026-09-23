import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProducts,
  getCategoryBySlug,
  getCategories,
  getFilterOptions,
} from "@/lib/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/product/Pagination";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import type { ProductSortOption } from "@/lib/queries/products";

// ── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Categorie negăsită | Perdele online" };
  }

  return {
    title: `${category.name} | Perdele online`,
    description:
      category.description ??
      `Descoperă colecția noastră de ${category.name.toLowerCase()}. Materiale premium, confecționare la comandă.`,
  };
}

// ── Page ─────────────────────────────────────────────────────────

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  // Parse filter params
  const sort = (typeof sp.sort === "string" ? sp.sort : "recommended") as ProductSortOption;
  const minPrice = typeof sp.minPrice === "string" ? Number(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;
  const opacity = typeof sp.opacity === "string" ? sp.opacity : undefined;
  const color = typeof sp.color === "string" ? sp.color : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page)) : 1;

  // Fetch data
  const [{ products, total, totalPages }, categories, filterOptions] =
    await Promise.all([
      getProducts({
        filters: {
          categorySlug: slug,
          minPrice,
          maxPrice,
          opacity,
          color,
        },
        sort,
        page,
      }),
      getCategories(),
      getFilterOptions(),
    ]);

  const currentFilters = {
    category: slug,
    minPrice: minPrice?.toString(),
    maxPrice: maxPrice?.toString(),
    opacity,
    color,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-8 lg:pt-8">
      <Breadcrumbs
        items={[
          { label: "Produse", href: "/produse" },
          { label: category.name },
        ]}
      />

      <header className="mt-6 mb-8 grid gap-x-12 gap-y-3 lg:grid-cols-12 lg:items-end">
        <h1 className="font-display text-4xl font-medium tracking-tight lg:col-span-6 lg:text-5xl">
          {category.name}
        </h1>
        <div className="lg:col-span-6">
          {category.description && (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          )}
          <p className="tnum mt-2 text-sm text-muted-foreground">
            {total} {total === 1 ? "produs" : "produse"}
          </p>
        </div>
      </header>

      <ProductFilters
        categories={categories}
        filterOptions={filterOptions}
        currentFilters={currentFilters}
        currentSort={sort}
      />

      <ProductGrid products={products} />

      <Pagination
        page={page}
        totalPages={totalPages}
        params={{
          sort: sort !== "recommended" ? sort : undefined,
          minPrice: minPrice !== undefined ? String(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
          opacity,
          color,
        }}
      />
    </div>
  );
}
