import { ProductCard, ProductCardProps } from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: ProductCardProps['product'][];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="border-y border-border py-16 text-center">
        <p className="font-display text-2xl font-medium">Niciun produs găsit</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Încearcă alte filtre sau șterge-le pe cele active.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
