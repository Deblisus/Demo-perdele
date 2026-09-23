import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  findProducts,
  getCategoryOptions,
  parseProductQuery,
  PRODUCTS_PER_PAGE,
} from "@/lib/admin/products";
import {
  FilterSelect,
  FilterShell,
  ResetFilters,
  SearchField,
} from "@/components/admin/FilterBar";
import { EmptyState, PageHead } from "@/components/admin/primitives";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { NewProductButton } from "@/components/admin/products/NewProductButton";
import type { ProductRowView } from "@/components/admin/products/types";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["q", "category", "stock", "flag"];

const STOCK_OPTIONS = [
  { value: "all", label: "Any stock" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
];

const FLAG_OPTIONS = [
  { value: "all", label: "Any flag" },
  { value: "featured", label: "Featured" },
  { value: "sale", label: "On sale" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseProductQuery(params);

  const [categories, { rows, total, pages }] = await Promise.all([
    getCategoryOptions(),
    findProducts(query),
  ]);

  const products: ProductRowView[] = rows.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    pricePerUnit: product.pricePerUnit,
    originalPrice: product.originalPrice,
    pricingUnit: product.pricingUnit,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    imageUrl: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.alt ?? null,
  }));

  const categoryOptions = [
    { value: "all", label: "Any category" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const firstRow = total === 0 ? 0 : (query.page - 1) * PRODUCTS_PER_PAGE + 1;
  const lastRow = Math.min(query.page * PRODUCTS_PER_PAGE, total);

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHead
        eyebrow="Catalog"
        title="Products"
        lede="Names, SKUs and prices edit in place — click a cell, type, press Enter. Switches publish immediately."
        actions={<NewProductButton categories={categories} />}
      />

      <FilterShell className="mb-4">
        <SearchField
          placeholder="Name, SKU, slug or colour"
          className="min-w-[14rem] flex-1"
        />
        <FilterSelect
          paramKey="category"
          label="Category"
          options={categoryOptions}
          className="w-[12rem]"
        />
        <FilterSelect
          paramKey="stock"
          label="Stock"
          options={STOCK_OPTIONS}
          className="w-[9.5rem]"
        />
        <FilterSelect
          paramKey="flag"
          label="Flag"
          options={FLAG_OPTIONS}
          className="w-[9.5rem]"
        />
        <ResetFilters keys={FILTER_KEYS} />
      </FilterShell>

      <p className="readout mb-3">
        {total === 0 ? "No matching products" : `${firstRow}–${lastRow} of ${total}`}
      </p>

      {products.length === 0 ? (
        <EmptyState
          title={
            categories.length === 0
              ? "No categories yet"
              : "Nothing matches these filters"
          }
          hint={
            categories.length === 0
              ? "Products belong to a category, so start there."
              : "Clear the filters, or search by a different name or SKU."
          }
          action={
            categories.length === 0 ? (
              <Link
                href="/admin/categories"
                className="readout rounded-sm underline underline-offset-4 hover:text-foreground"
              >
                Go to categories
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <ProductsTable
            products={products}
            categories={categories}
            sort={query.sort}
            dir={query.dir}
          />
          <Pagination page={query.page} pages={pages} params={params} />
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: Record<string, string | string[] | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page") continue;
      const single = Array.isArray(value) ? value[0] : value;
      if (single) next.set(key, single);
    }
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  };

  const linkClass =
    "inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted";
  const disabledClass =
    "inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--rule)] px-2.5 text-[0.8rem] font-medium text-muted-foreground opacity-50";

  return (
    <nav
      className="mt-4 flex items-center justify-between gap-3"
      aria-label="Products pagination"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft className="size-3.5" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          <ChevronLeft className="size-3.5" />
          Previous
        </span>
      )}
      <span className="readout">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          Next
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          Next
          <ChevronRight className="size-3.5" />
        </span>
      )}
    </nav>
  );
}
