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
import { ProductSort } from "@/components/product/ProductSort";
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
    return { title: "Categorie negăsită | Perdele Shop" };
  }

  return {
    title: `${category.name} | Perdele Shop`,
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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Produse", href: "/produse" },
          { label: category.name },
        ]}
      />

      {/* Category header */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {total} {total === 1 ? "produs" : "produse"}
        </p>
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="lg:hidden">
          <ProductFilters
            categories={categories}
            filterOptions={filterOptions}
            currentFilters={currentFilters}
          />
        </div>
        <div className="ml-auto">
          <ProductSort currentSort={sort} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        {/* Desktop filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilters
            categories={categories}
            filterOptions={filterOptions}
            currentFilters={currentFilters}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`?${new URLSearchParams({
                      ...(sort !== "recommended" && { sort }),
                      ...(minPrice !== undefined && {
                        minPrice: String(minPrice),
                      }),
                      ...(maxPrice !== undefined && {
                        maxPrice: String(maxPrice),
                      }),
                      ...(opacity && { opacity }),
                      ...(color && { color }),
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
