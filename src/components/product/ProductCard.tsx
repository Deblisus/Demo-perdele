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
  const discountPercentage = isOnSale && originalPrice 
    ? Math.round(((originalPrice - pricePerUnit) / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/produse/${slug}`} className={cn('group flex flex-col gap-3', className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <LayoutTemplate className="w-12 h-12 opacity-20" />
          </div>
        )}
        
        {isOnSale && originalPrice && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-bold z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {category?.name && (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {category.name}
          </span>
        )}
        <h3 className="text-sm font-medium line-clamp-2 mt-1" title={name}>
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {isOnSale && originalPrice && (
            <span className="line-through text-muted-foreground text-sm">
              {formatRON(originalPrice)}
            </span>
          )}
          <span className="font-semibold">{formatRON(pricePerUnit)}</span>
          <span className="text-muted-foreground text-sm">/ {pricingUnit}</span>
        </div>
      </div>
    </Link>
  );
}
