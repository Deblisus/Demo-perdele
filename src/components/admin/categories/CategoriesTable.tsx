"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  ImageOff,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./CategoryForm";
import type { CategoryRowView } from "./types";

export function CategoriesTable({
  categories,
}: {
  categories: CategoryRowView[];
}) {
  const [editing, setEditing] = useState<CategoryRowView | null>(null);

  return (
    <>
      <div className="scroll-x">
        <table className="ledger min-w-[48rem]">
          <caption className="sr-only">
            Categories. Names, slugs and sort order are editable in place.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-12">
                <span className="sr-only">Image</span>
              </th>
              <th scope="col">Name</th>
              <th scope="col">Slug</th>
              <th scope="col">Description</th>
              <th scope="col" className="text-right!">
                Order
              </th>
              <th scope="col" className="text-right!">
                Products
              </th>
              <th scope="col" className="text-right!">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setEditing(category)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <CategoryForm
        mode="edit"
        category={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </>
  );
}

function CategoryRow({
  category,
  onEdit,
}: {
  category: CategoryRowView;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function patch(changes: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(changes),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(
          payload.fields
            ? Object.values(payload.fields).flat()[0] ?? payload.error
            : (payload.error ?? "Could not save.")
        );
        return;
      }
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Delete “${category.name}”? Categories holding products are protected.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(payload.error ?? "Could not delete.", { duration: 8000 });
        return;
      }
      toast.success(`${category.name} deleted`);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="row-live">
      <td>
        <div className="size-9 overflow-hidden rounded-sm border border-[var(--rule)] bg-[var(--paper-2)]">
          {category.imageUrl ? (
            // Plain <img> for the same reason as the products table: the URL is
            // operator-typed and next/image rejects unconfigured hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.imageUrl}
              alt=""
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
      <td className="max-w-[16rem]">
        <InlineCell
          value={category.name}
          label={`Name of ${category.name}`}
          onCommit={(value) => patch({ name: value })}
          className="text-[0.8125rem]"
        />
      </td>
      <td className="max-w-[14rem]">
        <div className="flex items-center gap-1.5">
          <InlineCell
            value={category.slug}
            label={`Slug of ${category.name}`}
            onCommit={(value) => patch({ slug: value })}
            className="machine text-[0.75rem]"
          />
          <Link
            href={`/categorie/${category.slug}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${category.name} on the storefront`}
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        </div>
      </td>
      <td className="max-w-[22rem]">
        <p className="truncate text-[0.75rem] text-muted-foreground">
          {category.description || "—"}
        </p>
      </td>
      <td className="text-right">
        <InlineCell
          value={String(category.sortOrder)}
          label={`Sort order of ${category.name}`}
          onCommit={(value) => patch({ sortOrder: value })}
          className="machine text-right text-[0.8125rem]"
          width="w-16"
        />
      </td>
      <td className="machine text-right text-[0.8125rem]">
        {category.productCount > 0 ? (
          <Link
            href={`/admin/products?category=${category.id}`}
            className="hover:text-primary hover:underline"
          >
            {category.productCount}
          </Link>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </td>
      <td>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
            onClick={onEdit}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${category.name}`}
            disabled={deleting || category.productCount > 0}
            title={
              category.productCount > 0
                ? "Move its products elsewhere first"
                : undefined
            }
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

function InlineCell({
  value,
  label,
  onCommit,
  className,
  width,
}: {
  value: string;
  label: string;
  onCommit: (value: string) => void;
  className?: string;
  width?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // Re-sync when a save round-trips a new value in. Adjusted during render
  // rather than in an effect, so the cell never shows the stale text.
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
          "-mx-1 block truncate rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-secondary",
          width ?? "w-[calc(100%+0.5rem)]",
          className
        )}
      >
        {value || <span className="text-muted-foreground">—</span>}
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
        "-mx-1 rounded-sm border border-[var(--ring)] bg-background px-1 py-0.5 outline-none",
        width ?? "w-[calc(100%+0.5rem)]",
        className
      )}
    />
  );
}
