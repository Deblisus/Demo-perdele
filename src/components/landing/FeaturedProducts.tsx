import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCardProps } from "@/components/product/ProductCard";

interface FeaturedProductsProps {
  products: ProductCardProps["product"][];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 lg:mt-28 lg:px-8">
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-foreground pb-4">
        <h2 className="font-display text-3xl font-medium tracking-tight lg:text-4xl">
          Recomandate acum
        </h2>
        <Link
          href="/produse"
          className="whitespace-nowrap text-sm font-medium underline-offset-4 hover:underline"
        >
          Vezi toate
        </Link>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
