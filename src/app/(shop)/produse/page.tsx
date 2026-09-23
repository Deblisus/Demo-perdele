import { Suspense } from "react";
import { getProducts, getCategories, getFilterOptions } from "@/lib/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/product/Pagination";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import type { ProductSortOption } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Toate Produsele | Perdele online",
  description:
    "Descoperă colecția noastră completă de perdele, draperii și accesorii. Materiale premium, confecționare la comandă.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Parse filter params
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const sort = (typeof params.sort === "string" ? params.sort : "recommended") as ProductSortOption;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const opacity = typeof params.opacity === "string" ? params.opacity : undefined;
  const color = typeof params.color === "string" ? params.color : undefined;
  const isOnSale = params.sale === "true" ? true : undefined;
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page)) : 1;

  // Fetch data in parallel
  const [{ products, total, totalPages }, categories, filterOptions] =
    await Promise.all([
      getProducts({
        filters: {
          categorySlug,
          minPrice,
          maxPrice,
          opacity,
          color,
          isOnSale,
        },
        sort,
        page,
      }),
      getCategories(),
      getFilterOptions(),
    ]);

  const currentFilters = {
    category: categorySlug,
    minPrice: minPrice?.toString(),
    maxPrice: maxPrice?.toString(),
    opacity,
    color,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-8 lg:pt-8">
      <Breadcrumbs items={[{ label: isOnSale ? "Reduceri" : "Produse" }]} />

      <header className="mt-6 mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h1 className="font-display text-4xl font-medium tracking-tight lg:text-5xl">
          {isOnSale ? "Produse la reducere" : "Toate produsele"}
        </h1>
        <p className="tnum text-sm text-muted-foreground">
          {total} {total === 1 ? "produs" : "produse"}
        </p>
      </header>

      <ProductFilters
        categories={categories}
        filterOptions={filterOptions}
        currentFilters={currentFilters}
        currentSort={sort}
      />

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        }
      >
        <ProductGrid products={products} />
      </Suspense>

      <Pagination
        page={page}
        totalPages={totalPages}
        params={{
          category: categorySlug,
          sort: sort !== "recommended" ? sort : undefined,
          minPrice: minPrice !== undefined ? String(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
          opacity,
          color,
          sale: isOnSale ? "true" : undefined,
        }}
      />
    </div>
  );
}
