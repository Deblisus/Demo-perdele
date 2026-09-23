import { ProductCard, ProductCardProps } from './ProductCard';
import { cn } from '@/lib/utils';

interface RelatedProductsProps {
  products: ProductCardProps['product'][];
  title?: string;
  className?: string;
}

export function RelatedProducts({ products, title = 'Produse similare', className }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="mb-8 border-b border-foreground pb-4 font-display text-2xl font-medium tracking-tight lg:text-3xl">
        {title}
      </h2>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className={cn('w-[62vw] max-w-[16rem] shrink-0 snap-start lg:w-auto lg:max-w-none')}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
