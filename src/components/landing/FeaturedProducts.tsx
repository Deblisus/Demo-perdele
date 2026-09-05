import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";

interface FeaturedProductsProps {
  products: any[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold">Cele Mai Vândute</h2>
          <Link 
            href="/produse" 
            className="text-sm font-medium text-primary hover:underline"
          >
            Vezi Toate &rarr;
          </Link>
        </div>
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
