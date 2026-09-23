"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  ImageOff,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRON } from "@/lib/utils/currency";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/components/admin/FilterBar";
import { Nil } from "@/components/admin/primitives";
import { ProductForm } from "./ProductForm";
import { BulkBar } from "./BulkBar";
import type { CategoryOption, ProductRowView } from "./types";

type Sort = "name" | "price" | "updated" | "category";

export function ProductsTable({
  products,
  categories,
  sort,
  dir,
}: {
  products: ProductRowView[];
  categories: CategoryOption[];
  sort: Sort;
  dir: "asc" | "desc";
}) {
  const setParams = useQueryParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);

  const visibleIds = products.map((product) => product.id);

  // Drop selections for rows that a filter or page change has taken away —
  // otherwise a bulk action silently hits products no longer on screen.
  // Adjusted during render so the bulk bar never shows a stale count.
  const [lastProducts, setLastProducts] = useState(products);
  if (lastProducts !== products) {
    setLastProducts(products);
    const survivors = new Set([...selected].filter((id) => visibleIds.includes(id)));
    if (survivors.size !== selected.size) setSelected(survivors);
  }

  const selectedVisible = visibleIds.filter((id) => selected.has(id));
  const allSelected =
    visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const someSelected =
    selectedVisible.length > 0 && selectedVisible.length < visibleIds.length;

  function toggleSort(field: Sort) {
    const nextDir =
      sort === field
        ? dir === "asc"
          ? "desc"
          : "asc"
        : field === "name" || field === "category"
          ? "asc"
          : "desc";
    setParams({ sort: field, dir: nextDir });
  }

  const toggleRow = useCallback((id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return (
    <>
      <div className="scroll-x">
        <table className="ledger min-w-[62rem]">
          <caption className="sr-only">
            Products. Names, SKUs and prices are editable in place.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-8">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  aria-label={
                    allSelected ? "Clear selection" : "Select all on this page"
                  }
                  onCheckedChange={(checked: boolean) =>
                    setSelected(checked ? new Set(visibleIds) : new Set())
                  }
                />
              </th>
              <th scope="col" className="w-12">
                <span className="sr-only">Image</span>
              </th>
              <SortableHead
                label="Name"
                field="name"
                sort={sort}
                dir={dir}
                onSort={toggleSort}
              />
              <th scope="col">SKU</th>
              <SortableHead
                label="Category"
                field="category"
                sort={sort}
                dir={dir}
                onSort={toggleSort}
              />
              <SortableHead
                label="Price"
                field="price"
                sort={sort}
                dir={dir}
                onSort={toggleSort}
                align="right"
              />
              <th scope="col" className="text-right!">
                Was
              </th>
              <th scope="col">In stock</th>
              <th scope="col">Featured</th>
              <th scope="col">On sale</th>
              <th scope="col" className="text-right!">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selected.has(product.id)}
                onSelect={toggleRow}
                onEdit={() => setEditing(product.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <BulkBar
        ids={[...selected]}
        onClear={() => setSelected(new Set())}
      />

      <ProductForm
        mode="edit"
        productId={editing ?? undefined}
        categories={categories}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </>
  );
}

function SortableHead({
  label,
  field,
  sort,
  dir,
  onSort,
  align,
}: {
  label: string;
  field: Sort;
  sort: Sort;
  dir: "asc" | "desc";
  onSort: (field: Sort) => void;
  align?: "right";
}) {
  const active = sort === field;
  return (
    <th
      scope="col"
      className={cn(align === "right" && "text-right!")}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 transition-colors hover:text-foreground",
          active && "text-foreground"
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="size-3" aria-hidden />
          ) : (
            <ChevronDown className="size-3" aria-hidden />
          )
        ) : (
          <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
        )}
      </button>
    </th>
  );
}

function ProductRow({
  product,
  selected,
  onSelect,
  onEdit,
}: {
  product: ProductRowView;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Optimistic local copy of the flags, so a switch moves under the finger
  // instead of waiting for the round trip and the router refresh.
  const serverFlags = {
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
  };
  const [flags, setFlags] = useState(serverFlags);

  // Re-sync once the server confirms (or contradicts) the optimistic value.
  const flagKey = `${product.inStock}|${product.isFeatured}|${product.isOnSale}`;
  const [lastFlagKey, setLastFlagKey] = useState(flagKey);
  if (lastFlagKey !== flagKey) {
    setLastFlagKey(flagKey);
    setFlags(serverFlags);
  }

  async function patch(
    changes: Record<string, unknown>,
    onFail?: () => void
  ): Promise<boolean> {
    setPending(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(changes),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        onFail?.();
        toast.error(payload.error ?? "Could not save.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      onFail?.();
      toast.error("Could not reach the server.");
      return false;
    } finally {
      setPending(false);
    }
  }

  function toggleFlag(key: keyof typeof flags, value: boolean) {
    const previous = flags[key];
    setFlags((current) => ({ ...current, [key]: value }));
    patch({ [key]: value }, () =>
      setFlags((current) => ({ ...current, [key]: previous }))
    );
  }

  async function remove() {
    if (
      !window.confirm(
        `Delete “${product.name}”? This cannot be undone. Products that appear on past orders are protected.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(payload.error ?? "Could not delete.", { duration: 8000 });
        return;
      }
      toast.success(`${product.name} deleted`);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="row-live" data-open={selected}>
      <td>
        <Checkbox
          checked={selected}
          aria-label={`Select ${product.name}`}
          onCheckedChange={(checked: boolean) =>
            onSelect(product.id, checked)
          }
        />
      </td>
      <td>
        <div className="relative size-9 overflow-hidden rounded-sm border border-[var(--rule)] bg-[var(--paper-2)]">
          {product.imageUrl ? (
            // A plain <img>, not next/image: the operator can type any URL into
            // the form, and next/image throws on a host missing from
            // `images.remotePatterns` in next.config.ts. At 36px there is no
            // optimisation worth having, and a broken thumbnail beats a 500 in
            // the middle of the products table.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <ImageOff className="size-3.5 text-muted-foreground" aria-hidden />
            </span>
          )}
        </div>
      </td>
      <td className="max-w-[20rem]">
        <EditableText
          value={product.name}
          label={`Name of ${product.name}`}
          onCommit={(value) => patch({ name: value })}
          className="text-[0.8125rem]"
        />
        <Link
          href={`/produse/${product.slug}`}
          target="_blank"
          rel="noreferrer"
          className="machine mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-primary"
        >
          /{product.slug}
          <ExternalLink className="size-2.5" aria-hidden />
        </Link>
      </td>
      <td className="max-w-[9rem]">
        <EditableText
          value={product.sku ?? ""}
          label={`SKU of ${product.name}`}
          placeholder="—"
          onCommit={(value) => patch({ sku: value })}
          className="machine text-[0.75rem]"
        />
      </td>
      <td className="text-[0.75rem] text-muted-foreground">
        {product.categoryName}
      </td>
      <td className="text-right">
        <EditableNumber
          value={product.pricePerUnit}
          label={`Price of ${product.name}`}
          onCommit={(value) => patch({ pricePerUnit: value })}
          suffix={`/${product.pricingUnit}`}
        />
      </td>
      <td className="text-right">
        <EditableNumber
          value={product.originalPrice}
          label={`Original price of ${product.name}`}
          onCommit={(value) => patch({ originalPrice: value })}
          muted
          strike
        />
      </td>
      <td>
        <Switch
          size="sm"
          checked={flags.inStock}
          disabled={pending}
          aria-label={`${product.name} in stock`}
          onCheckedChange={(value: boolean) => toggleFlag("inStock", value)}
        />
      </td>
      <td>
        <Switch
          size="sm"
          checked={flags.isFeatured}
          disabled={pending}
          aria-label={`${product.name} featured`}
          onCheckedChange={(value: boolean) => toggleFlag("isFeatured", value)}
        />
      </td>
      <td>
        <Switch
          size="sm"
          checked={flags.isOnSale}
          disabled={pending}
          aria-label={`${product.name} on sale`}
          onCheckedChange={(value: boolean) => toggleFlag("isOnSale", value)}
        />
      </td>
      <td>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${product.name}`}
            onClick={onEdit}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${product.name}`}
            disabled={deleting}
            onClick={remove}
          >
            {deleting ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              <Trash2 aria-hidden />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ── Inline cells ────────────────────────────────────────────────────
   A cell is a plain button until it is activated, then an input. Rendering
   thirty rows of live inputs would be both slower and impossible to scan —
   a table of form fields stops reading like a table. */

function EditableText({
  value,
  label,
  placeholder,
  onCommit,
  className,
}: {
  value: string;
  label: string;
  placeholder?: string;
  onCommit: (value: string) => Promise<boolean> | void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  if (lastValue !== value) {
    setLastValue(value);
    setDraft(value);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${label}`}
        className={cn(
          "-mx-1 block w-[calc(100%+0.5rem)] truncate rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-secondary",
          className
        )}
      >
        {value || (
          <span className="text-muted-foreground">{placeholder ?? "—"}</span>
        )}
      </button>
    );
  }

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onCommit(draft.trim());
  };

  return (
    <input
      autoFocus
      value={draft}
      aria-label={label}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "-mx-1 w-[calc(100%+0.5rem)] rounded-sm border border-[var(--ring)] bg-background px-1 py-0.5 outline-none",
        className
      )}
    />
  );
}

function EditableNumber({
  value,
  label,
  onCommit,
  suffix,
  muted = false,
  strike = false,
}: {
  value: number | null;
  label: string;
  onCommit: (value: number | null) => Promise<boolean> | void;
  suffix?: string;
  muted?: boolean;
  strike?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [lastValue, setLastValue] = useState(value);

  if (lastValue !== value) {
    setLastValue(value);
    setDraft(value === null ? "" : String(value));
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${label}`}
        className="-mx-1 rounded-sm px-1 py-0.5 transition-colors hover:bg-secondary"
      >
        {value === null ? (
          <Nil />
        ) : (
          <span
            className={cn(
              "machine text-[0.8125rem] whitespace-nowrap",
              muted && "text-muted-foreground",
              strike && "line-through"
            )}
          >
            {formatRON(value)}
            {suffix ? (
              <span className="text-muted-foreground">{suffix}</span>
            ) : null}
          </span>
        )}
      </button>
    );
  }

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : Number(trimmed.replace(",", "."));
    if (next !== null && !Number.isFinite(next)) {
      toast.error("That is not a number.");
      setDraft(value === null ? "" : String(value));
      return;
    }
    if (next !== value) onCommit(next);
  };

  return (
    <input
      autoFocus
      inputMode="decimal"
      value={draft}
      aria-label={label}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") {
          setDraft(value === null ? "" : String(value));
          setEditing(false);
        }
      }}
      className="machine -mx-1 w-24 rounded-sm border border-[var(--ring)] bg-background px-1 py-0.5 text-right text-[0.8125rem] outline-none"
    />
  );
}
