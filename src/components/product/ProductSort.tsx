'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChangeEvent } from 'react';

interface ProductSortProps {
  currentSort?: string;
  className?: string;
}

export function ProductSort({ currentSort = 'recommended', className }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'recommended') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="sort" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Ordonează după:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="recommended">Recomandate</option>
        <option value="price-asc">Preț: mic la mare</option>
        <option value="price-desc">Preț: mare la mic</option>
        <option value="newest">Cele mai noi</option>
      </select>
    </div>
  );
}
