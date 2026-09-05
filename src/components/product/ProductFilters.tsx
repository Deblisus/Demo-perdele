'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryFilter {
  slug: string;
  name: string;
  _count: { products: number };
}

interface FilterOptions {
  colors: { color: string; colorHex: string }[];
  opacities: string[];
  fabricTypes: string[];
  priceRange: { min: number; max: number };
}

interface ProductFiltersProps {
  categories: CategoryFilter[];
  filterOptions: FilterOptions;
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    opacity?: string;
    color?: string;
  };
  className?: string;
}

export function ProductFilters({ categories, filterOptions, currentFilters, className }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const applyFilter = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value));
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const handlePriceSubmit = () => {
    let params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    router.push(pathname + '?' + params.toString());
  };

  const isChecked = (name: string, value: string) => searchParams.get(name) === value;

  const FilterContent = () => (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtre</h2>
        {Array.from(searchParams.keys()).length > 0 && (
          <button 
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
          >
            Șterge filtrele
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">Categorii</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={isChecked('category', cat.slug)}
                onChange={(e) => applyFilter('category', e.target.checked ? cat.slug : '')}
              />
              <span className="flex-1">{cat.name}</span>
              <span className="text-muted-foreground text-xs">({cat._count.products})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">Preț</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full px-3 py-1 text-sm border rounded-md bg-transparent"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full px-3 py-1 text-sm border rounded-md bg-transparent"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button onClick={handlePriceSubmit} variant="secondary" className="w-full text-xs" size="sm">
          Aplică
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">Opacitate</h3>
        <div className="space-y-2">
          {filterOptions.opacities?.map((op) => (
            <label key={op} className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="radio"
                name="opacity"
                className="border-gray-300 text-primary focus:ring-primary"
                checked={isChecked('opacity', op)}
                onChange={() => applyFilter('opacity', op)}
              />
              <span>{op}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">Culoare</h3>
        <div className="flex flex-wrap gap-2">
          {filterOptions.colors?.map((c) => (
            <button
              key={c.color}
              onClick={() => applyFilter('color', isChecked('color', c.color) ? '' : c.color)}
              className={cn(
                "w-6 h-6 rounded-full border border-border/50",
                isChecked('color', c.color) ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-muted-foreground/50 hover:ring-offset-1"
              )}
              style={{ backgroundColor: c.colorHex }}
              title={c.color}
              aria-label={`Filtrează după culoarea ${c.color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0">
        <FilterContent />
      </div>
      
      <div className="lg:hidden mb-4">
        <MobileDrawer>
          <FilterContent />
        </MobileDrawer>
      </div>
    </>
  );
}

function MobileDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full flex items-center justify-center gap-2">
        <Filter className="w-4 h-4" />
        Filtre
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-background border-r shadow-lg overflow-y-auto p-6 animate-in slide-in-from-left">
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-8">
              {children}
            </div>
          </div>
          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
