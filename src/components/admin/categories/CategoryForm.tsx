"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { slugify } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";
import type { CategoryRowView } from "./types";

type Draft = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
};

const EMPTY: Draft = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  sortOrder: "0",
};

export function CategoryForm({
  mode,
  category,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  category?: CategoryRowView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  // Reset the draft whenever the sheet opens onto a different record. Keyed on
  // "open + which category", and adjusted during render so the form never
  // flashes the previous category's values.
  const openKey = open ? `${mode}:${category?.id ?? "new"}` : null;
  const [lastOpenKey, setLastOpenKey] = useState(openKey);

  if (lastOpenKey !== openKey) {
    setLastOpenKey(openKey);
    if (openKey !== null) {
      setFieldErrors({});
      if (mode === "edit" && category) {
        setDraft({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          sortOrder: String(category.sortOrder),
        });
        setSlugTouched(true);
      } else {
        setDraft(EMPTY);
        setSlugTouched(false);
      }
    }
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setFieldErrors({});
    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${category?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldErrors(payload.fields ?? {});
        toast.error(payload.error ?? "Could not save the category.");
        return;
      }

      toast.success(
        mode === "create" ? `${draft.name} created` : `${draft.name} saved`
      );
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="admin-scope flex w-full flex-col gap-0 p-0 sm:max-w-[28rem]"
      >
        <SheetHeader className="shrink-0 border-b border-[var(--rule)] px-5 py-4">
          <SheetTitle className="text-[0.9375rem]">
            {mode === "create" ? "New category" : "Edit category"}
          </SheetTitle>
          <SheetDescription className="text-[0.8125rem]">
            Categories give products their storefront URL and their place in the
            navigation.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form
            id="category-form"
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field label="Name" id="c-name" errors={fieldErrors.name}>
              <Input
                id="c-name"
                value={draft.name}
                onChange={(event) => {
                  const name = event.target.value;
                  set("name", name);
                  if (!slugTouched) set("slug", slugify(name));
                }}
                className="h-8 text-[0.8125rem]"
              />
            </Field>

            <Field
              label="Slug"
              id="c-slug"
              hint="Storefront URL: /categorie/<slug>"
              errors={fieldErrors.slug}
            >
              <Input
                id="c-slug"
                value={draft.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  set("slug", event.target.value);
                }}
                className="machine h-8 text-[0.8125rem]"
              />
            </Field>

            <Field
              label="Description"
              id="c-description"
              hint="Shown at the top of the category page."
              errors={fieldErrors.description}
            >
              <Textarea
                id="c-description"
                rows={4}
                value={draft.description}
                onChange={(event) => set("description", event.target.value)}
                className="text-[0.8125rem]"
              />
            </Field>

            <Field
              label="Banner image"
              id="c-image"
              hint="A path under /public, or a full URL on an allowed host."
              errors={fieldErrors.imageUrl}
            >
              <Input
                id="c-image"
                value={draft.imageUrl}
                placeholder="/categories/catifea.jpg"
                onChange={(event) => set("imageUrl", event.target.value)}
                className="machine h-8 text-[0.8125rem]"
              />
            </Field>

            <Field
              label="Sort order"
              id="c-sort"
              hint="Lower numbers come first in the storefront navigation."
              errors={fieldErrors.sortOrder}
            >
              <Input
                id="c-sort"
                inputMode="numeric"
                value={draft.sortOrder}
                onChange={(event) => set("sortOrder", event.target.value)}
                className="machine h-8 w-24 text-[0.8125rem]"
              />
            </Field>
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--rule)] bg-[var(--paper-2)] px-5 py-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" form="category-form" size="lg" disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            {mode === "create" ? "Create category" : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  id,
  hint,
  errors,
  className,
  children,
}: {
  label: string;
  id?: string;
  hint?: string;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="readout">
        {label}
      </Label>
      {children}
      {errors?.length ? (
        <p role="alert" className="text-[0.75rem] text-destructive">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="text-[0.75rem] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        New category
      </Button>
      <CategoryForm mode="create" open={open} onOpenChange={setOpen} />
    </>
  );
}
