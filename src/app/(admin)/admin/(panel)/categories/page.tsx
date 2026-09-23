import { db } from "@/lib/db";
import { EmptyState, PageHead } from "@/components/admin/primitives";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
import { NewCategoryButton } from "@/components/admin/categories/CategoryForm";
import type { CategoryRowView } from "@/components/admin/categories/types";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const categories: CategoryRowView[] = rows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  }));

  const totalProducts = categories.reduce(
    (sum, category) => sum + category.productCount,
    0
  );
  const empty = categories.filter((category) => category.productCount === 0);

  return (
    <div className="mx-auto max-w-[76rem]">
      <PageHead
        eyebrow="Catalog"
        title="Categories"
        lede="The storefront's top-level navigation, in display order. Names, slugs and order edit in place."
        actions={<NewCategoryButton />}
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          hint="Every product belongs to a category, so this is the first thing to set up. Create one, then add products to it."
        />
      ) : (
        <>
          <p className="readout mb-3">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"} ·{" "}
            {totalProducts} {totalProducts === 1 ? "product" : "products"}
            {empty.length > 0 ? ` · ${empty.length} empty` : ""}
          </p>
          <CategoriesTable categories={categories} />
        </>
      )}
    </div>
  );
}
