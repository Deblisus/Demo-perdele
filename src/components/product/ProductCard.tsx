import Link from 'next/link';
import Image from 'next/image';
import { formatRON } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import { LayoutTemplate } from 'lucide-react';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    pricePerUnit: number;
    originalPrice?: number | null;
    pricingUnit: string;
    isOnSale?: boolean;
    isFeatured?: boolean;
    images: { url: string; alt?: string | null }[];
    category?: { name: string; slug: string } | null;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { slug, name, pricePerUnit, originalPrice, pricingUnit, isOnSale, images, category } = product;

  const mainImage = images?.[0];
  // A second photo, when there is one, shows on hover — the drape up close.
  const altImage = images?.[1];
  const onSale = Boolean(isOnSale && originalPrice && originalPrice > pricePerUnit);
  const discountPercentage = onSale
    ? Math.round(((originalPrice! - pricePerUnit) / originalPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/produse/${slug}`}
      className={cn(
        'group flex min-w-0 flex-col gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
        {mainImage?.url ? (
          <>
            <Image
              src={mainImage.url}
              alt={mainImage.alt || name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            {altImage?.url && (
              <Image
                src={altImage.url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <LayoutTemplate className="size-10 opacity-25" />
          </div>
        )}

        {onSale && discountPercentage > 0 && (
          <span className="tnum absolute top-0 left-0 bg-brand px-2 py-1 text-xs font-semibold text-brand-foreground">
            −{discountPercentage}%
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {category?.name && (
          <span className="text-xs text-muted-foreground">{category.name}</span>
        )}
        <h3
          className="line-clamp-2 text-sm font-medium leading-snug decoration-1 underline-offset-4 group-hover:underline"
          title={name}
        >
          {name}
        </h3>
        <p className="tnum mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className={cn('font-semibold', onSale && 'text-brand')}>
            {formatRON(pricePerUnit)}
          </span>
          <span className="text-muted-foreground">/ {pricingUnit}</span>
          {onSale && (
            <span className="text-muted-foreground line-through">
              {formatRON(originalPrice!)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
