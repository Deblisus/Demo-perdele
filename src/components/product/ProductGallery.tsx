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

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <ImageIcon className="w-16 h-16 opacity-20" />
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <Image
          key={selectedImage.url}
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover animate-in fade-in duration-500"
          loading="eager"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative shrink-0 w-20 h-20 lg:w-full lg:h-auto lg:aspect-square overflow-hidden rounded-md bg-muted snap-start transition-all",
                selectedIndex === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
