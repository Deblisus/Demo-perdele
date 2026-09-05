import { ProductCard, ProductCardProps } from './ProductCard';
import { cn } from '@/lib/utils';

interface RelatedProductsProps {
  products: ProductCardProps['product'][];
  title?: string;
  className?: string;
}

export function RelatedProducts({ products, title = 'Produse Similare', className }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      
      <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
        {products.map((product) => (
          <div key={product.id} className="w-[280px] shrink-0 lg:w-auto snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
