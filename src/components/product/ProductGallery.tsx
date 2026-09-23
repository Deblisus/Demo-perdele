'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  productName: string;
  className?: string;
}

/** Thumbnails run down the left edge on desktop, under the photo on mobile. */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn('relative flex aspect-[4/5] items-center justify-center rounded-sm bg-muted', className)}>
        <ImageIcon className="size-14 opacity-20" />
      </div>
    );
  }

  const selectedImage = images[selectedIndex];
  const hasThumbs = images.length > 1;

  return (
    <div
      className={cn(
        'grid gap-3',
        hasThumbs && 'lg:grid-cols-[4.5rem_minmax(0,1fr)]',
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted lg:order-2">
        <Image
          key={selectedImage.url}
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover animate-in fade-in duration-300 motion-reduce:animate-none"
          loading="eager"
        />
      </div>

      {hasThumbs && (
        <div className="flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Imaginea ${idx + 1} din ${images.length}`}
              aria-pressed={selectedIndex === idx}
              className={cn(
                'relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm bg-muted outline-offset-2 transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-ring lg:w-full',
                selectedIndex === idx
                  ? 'ring-1 ring-foreground ring-offset-2 ring-offset-background'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
