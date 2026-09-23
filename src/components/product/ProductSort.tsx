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
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor="sort" className="text-xs whitespace-nowrap text-muted-foreground">
        Ordonează
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="h-9 rounded-sm border border-input bg-transparent pr-8 pl-3 text-sm focus-visible:border-foreground focus-visible:outline-none"
      >
        <option value="recommended">Recomandate</option>
        <option value="price-asc">Preț crescător</option>
        <option value="price-desc">Preț descrescător</option>
        <option value="newest">Cele mai noi</option>
      </select>
    </div>
  );
}
