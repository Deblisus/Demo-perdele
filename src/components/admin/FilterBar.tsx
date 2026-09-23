"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

/**
 * Filters live in the URL, not in component state.
 *
 * That is what makes a filtered view shareable, bookmarkable and survivable
 * across a refresh — and it lets the page stay a Server Component that simply
 * reads `searchParams` and queries, with no client-side data layer at all.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      // Any filter change invalidates the current page number.
      if (!("page" in updates)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );
}

export function FilterShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-x-3 gap-y-3 rounded-md border border-[var(--rule)] bg-background px-3 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label className="readout" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

/** Debounced free-text search bound to a URL parameter. */
export function SearchField({
  paramKey = "q",
  placeholder,
  label = "Search",
  className,
}: {
  paramKey?: string;
  placeholder: string;
  label?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const setParams = useQueryParams();
  const committed = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);
  const timer = useRef<number | null>(null);

  // Keep in step when the URL changes from elsewhere — a Reset button, the
  // browser's back button — without stomping on what is being typed. Adjusted
  // during render, so the field never shows the stale value for a frame.
  if (lastCommitted !== committed) {
    setLastCommitted(committed);
    setValue(committed);
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setParams({ [paramKey]: next.trim() || null });
    }, 300);
  }

  return (
    <FilterField label={label} htmlFor={`filter-${paramKey}`} className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={`filter-${paramKey}`}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
          className="h-8 pr-8 pl-8 text-[0.8125rem]"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              if (timer.current) window.clearTimeout(timer.current);
              setValue("");
              setParams({ [paramKey]: null });
            }}
            className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-3" aria-hidden />
          </button>
        ) : null}
      </div>
    </FilterField>
  );
}

/** A select bound to a URL parameter. The first option is treated as "no filter". */
export function FilterSelect({
  paramKey,
  label,
  options,
  className,
}: {
  paramKey: string;
  label: string;
  options: FilterOption[];
  className?: string;
}) {
  const searchParams = useSearchParams();
  const setParams = useQueryParams();
  const current = searchParams.get(paramKey) ?? options[0].value;

  const labelFor = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option.label]));
    return (value: string | null) =>
      (value && map.get(value)) ?? options[0].label;
  }, [options]);

  return (
    <FilterField label={label} className={className}>
      <Select
        items={options}
        value={current}
        onValueChange={(value: string | null) =>
          setParams({
            [paramKey]: !value || value === options[0].value ? null : value,
          })
        }
      >
        <SelectTrigger size="sm" className="w-full text-[0.8125rem]">
          <SelectValue>{(value: string | null) => labelFor(value)}</SelectValue>
        </SelectTrigger>
        {/* The portal renders outside `.admin-scope`, so it re-declares it. */}
        <SelectContent className="admin-scope">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  );
}

/** A date input bound to a URL parameter, in `YYYY-MM-DD`. */
export function FilterDate({
  paramKey,
  label,
}: {
  paramKey: string;
  label: string;
}) {
  const searchParams = useSearchParams();
  const setParams = useQueryParams();
  const value = searchParams.get(paramKey) ?? "";

  return (
    <FilterField label={label} htmlFor={`filter-${paramKey}`}>
      <Input
        id={`filter-${paramKey}`}
        type="date"
        value={value}
        onChange={(event) => setParams({ [paramKey]: event.target.value || null })}
        className="machine h-8 w-[9.5rem] text-[0.8125rem]"
      />
    </FilterField>
  );
}

/** Clears every listed parameter at once. Hidden when nothing is set. */
export function ResetFilters({ keys }: { keys: string[] }) {
  const searchParams = useSearchParams();
  const setParams = useQueryParams();
  const active = keys.filter((key) => searchParams.get(key));

  if (active.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() =>
        setParams(Object.fromEntries(keys.map((key) => [key, null])))
      }
      className="readout mb-1 inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1.5 transition-colors hover:bg-secondary hover:text-foreground"
    >
      <X className="size-3" aria-hidden />
      Reset {active.length}
    </button>
  );
}
