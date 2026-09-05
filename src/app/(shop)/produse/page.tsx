import { Suspense } from "react";
import { getProducts, getCategories, getFilterOptions } from "@/lib/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import type { ProductSortOption } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Toate Produsele | Perdele Shop",
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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Produse" },
        ]}
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {isOnSale ? "Oferte Speciale" : "Toate Produsele"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "produs" : "produse"} găsite
          </p>
        </div>
        <ProductSort currentSort={sort} />
      </div>

      {/* Main content: sidebar + grid */}
      <div className="flex gap-8">
        {/* Filter sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilters
            categories={categories}
            filterOptions={filterOptions}
            currentFilters={currentFilters}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button is inside ProductFilters */}
          <div className="lg:hidden mb-4">
            <ProductFilters
              categories={categories}
              filterOptions={filterOptions}
              currentFilters={currentFilters}
            />
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            }
          >
            <ProductGrid products={products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`?${new URLSearchParams({
                      ...(categorySlug && { category: categorySlug }),
                      ...(sort !== "recommended" && { sort }),
                      ...(minPrice !== undefined && { minPrice: String(minPrice) }),
                      ...(maxPrice !== undefined && { maxPrice: String(maxPrice) }),
                      ...(opacity && { opacity }),
                      ...(color && { color }),
                      ...(isOnSale && { sale: "true" }),
                      page: String(pageNum),
                    }).toString()}`}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                      pageNum === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {pageNum}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
