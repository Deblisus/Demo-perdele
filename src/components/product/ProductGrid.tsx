import { ProductCard, ProductCardProps } from './ProductCard';
import { cn } from '@/lib/utils';
import { SearchX } from 'lucide-react';

interface ProductGridProps {
  products: ProductCardProps['product'][];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-muted-foreground border border-dashed rounded-lg">
        <SearchX className="w-12 h-12 mb-4 opacity-50" />
        <p>Nu am găsit produse care să corespundă filtrelor selectate.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
