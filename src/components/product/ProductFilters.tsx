'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Popover } from '@base-ui/react/popover';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OPACITY_LABELS } from '@/lib/constants/catalog';
import { ProductSort } from './ProductSort';

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
  currentSort?: string;
}

const chip =
  'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-sm border px-3 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const priceInput =
  'tnum h-9 w-24 rounded-sm border border-input bg-background px-2 text-sm focus-visible:border-foreground focus-visible:outline-none';

/**
 * Catalogue toolbar: collections as tabs, then one filter bar that sticks
 * under the header (`--header-h`) for the whole length of the grid.
 *
 * Renders a fragment on purpose — the sticky bar must be a direct child of
 * the page container, or it would only stick within this component's box.
 */
export function ProductFilters({
  categories,
  filterOptions,
  currentFilters,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleFilter = (name: string, value: string) =>
    pushParams((params) => {
      if (params.get(name) === value) params.delete(name);
      else params.set(name, value);
    });

  const handlePriceSubmit = (e: FormEvent) => {
    e.preventDefault();
    pushParams((params) => {
      if (minPrice) params.set('minPrice', minPrice);
      else params.delete('minPrice');
      if (maxPrice) params.set('maxPrice', maxPrice);
      else params.delete('maxPrice');
    });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    pushParams((params) => {
      ['opacity', 'color', 'minPrice', 'maxPrice'].forEach((key) => params.delete(key));
    });
  };

  const activeCount = [
    currentFilters.opacity,
    currentFilters.color,
    currentFilters.minPrice || currentFilters.maxPrice,
  ].filter(Boolean).length;

  const activeCategory =
    currentFilters.category ?? (pathname.startsWith('/categorie/') ? pathname.split('/')[2] : undefined);

  const activeColor = filterOptions.colors?.find((c) => c.color === currentFilters.color);

  const opacityChips = filterOptions.opacities?.length > 0 && (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="float-left mr-1 text-xs text-muted-foreground">Opacitate</legend>
      {filterOptions.opacities.map((op) => {
        const active = currentFilters.opacity === op;
        return (
          <button
            key={op}
            type="button"
            aria-pressed={active}
            onClick={() => toggleFilter('opacity', op)}
            className={cn(
              chip,
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-input hover:border-foreground'
            )}
          >
            {OPACITY_LABELS[op] ?? op}
          </button>
        );
      })}
    </fieldset>
  );

  const colorList = (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
      {filterOptions.colors?.map((c) => {
        const active = currentFilters.color === c.color;
        return (
          <li key={c.color}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => toggleFilter('color', c.color)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                active && 'bg-muted font-medium'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-5 shrink-0 rounded-full border border-foreground/15',
                  active && 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                )}
                style={{ backgroundColor: c.colorHex }}
              />
              <span className="truncate">{c.color}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const priceForm = (
    <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
      <span className="text-xs whitespace-nowrap text-muted-foreground">Preț / ml</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="de la"
        aria-label="Preț minim pe metru"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className={priceInput}
      />
      <span className="text-muted-foreground" aria-hidden="true">–</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="până la"
        aria-label="Preț maxim pe metru"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className={priceInput}
      />
      <button type="submit" className={cn(chip, 'border-input hover:border-foreground')}>
        Aplică
      </button>
    </form>
  );

  const clearButton = activeCount > 0 && (
    <button
      type="button"
      onClick={clearFilters}
      className="inline-flex h-9 items-center gap-1.5 self-start whitespace-nowrap text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:self-auto"
    >
      <X className="size-3.5" aria-hidden="true" />
      Șterge filtrele
    </button>
  );

  return (
    <>
      {/* Collections */}
      <nav aria-label="Colecții" className="-mx-4 overflow-x-auto border-b border-border px-4 lg:mx-0 lg:px-0">
        <ul className="flex gap-6">
          <li>
            <CategoryTab href="/produse" active={!activeCategory && pathname === '/produse'}>
              Toate
            </CategoryTab>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <CategoryTab href={`/categorie/${cat.slug}`} active={activeCategory === cat.slug}>
                {cat.name}
                <span className="tnum ml-1.5 text-muted-foreground">{cat._count.products}</span>
              </CategoryTab>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sticky filter bar. The ::before paints paper edge to edge so the
          grid never shows through at wide screens. */}
      <div
        className="sticky top-[var(--header-h)] z-30 mb-10 before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:border-border before:bg-background/95 before:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3 py-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="catalog-filters-mobile"
            className={cn(chip, 'border-input hover:border-foreground lg:hidden')}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filtre
            {activeCount > 0 && <span className="tnum text-brand">({activeCount})</span>}
          </button>

          {/* Desktop: everything in one row */}
          <div className="hidden min-w-0 flex-1 items-center gap-x-6 lg:flex">
            {opacityChips}

            {filterOptions.colors?.length > 0 && (
              <Popover.Root>
                <Popover.Trigger
                  className={cn(
                    chip,
                    activeColor ? 'border-foreground' : 'border-input hover:border-foreground'
                  )}
                >
                  {activeColor && (
                    <span
                      aria-hidden="true"
                      className="size-4 rounded-full border border-foreground/15"
                      style={{ backgroundColor: activeColor.colorHex }}
                    />
                  )}
                  {activeColor ? activeColor.color : 'Culoare'}
                  <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={6} align="start" className="z-50">
                    <Popover.Popup className="max-h-[min(26rem,60vh)] w-[27rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-sm border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none">
                      <Popover.Title className="px-2 pt-1 pb-2 text-xs text-muted-foreground">
                        Culoare
                      </Popover.Title>
                      {colorList}
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            )}

            {priceForm}
            {clearButton}
          </div>

          <ProductSort currentSort={currentSort} className="shrink-0" />
        </div>

        {/* Mobile: panel opens inside the sticky bar */}
        {open && (
          <div
            id="catalog-filters-mobile"
            className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto border-t border-border pt-4 pb-5 lg:hidden"
          >
            {opacityChips}
            {filterOptions.colors?.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Culoare</p>
                {colorList}
              </div>
            )}
            {priceForm}
            <div className="flex items-center justify-between gap-4">
              {clearButton || <span />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(chip, 'border-foreground bg-foreground text-background')}
              >
                Gata
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CategoryTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        '-mb-px inline-flex h-12 items-center whitespace-nowrap border-b-2 text-sm transition-colors duration-150',
        active
          ? 'border-foreground font-medium text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
}
