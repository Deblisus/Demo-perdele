'use client';

import { useState, type UIEvent } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  productName: string;
  className?: string;
}

/**
 * Desktop: every photo stacked full-width in the page flow, so the gallery
 * scrolls while the buy box beside it stays put. Mobile: one swipeable row
 * with a position counter.
 */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn('relative flex aspect-[4/5] items-center justify-center rounded-sm bg-muted', className)}>
        <ImageIcon className="size-14 opacity-20" />
      </div>
    );
  }

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className={cn('relative', className)}>
      <div
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, idx) => (
          <figure
            key={img.url}
            className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-muted sm:rounded-sm"
          >
            <Image
              src={img.url}
              alt={img.alt || (idx === 0 ? productName : `${productName} — detaliu`)}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </figure>
        ))}
      </div>

      {images.length > 1 && (
        <p
          aria-hidden="true"
          className="tnum absolute right-3 bottom-3 rounded-sm bg-background/90 px-2 py-1 text-xs font-medium text-foreground lg:hidden"
        >
          {current + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
