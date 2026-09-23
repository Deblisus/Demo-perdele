"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/admin/product-schema";
import type { CategoryOption } from "./types";

type ImageDraft = { url: string; alt: string };

type Draft = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  pricePerUnit: string;
  originalPrice: string;
  pricingUnit: "ml" | "buc";
  minQuantity: string;
  maxQuantity: string;
  fabricType: string;
  opacity: string;
  color: string;
  colorHex: string;
  pattern: string;
  composition: string;
  defaultHeightCm: string;
  minHeightCm: string;
  maxHeightCm: string;
  weightGsm: string;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sku: string;
  categoryId: string;
  images: ImageDraft[];
};

/** Values a new curtain product starts from — the bolt sizes the shop stocks. */
function emptyDraft(categoryId: string): Draft {
  return {
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    pricePerUnit: "",
    originalPrice: "",
    pricingUnit: "ml",
    minQuantity: "0.5",
    maxQuantity: "30",
    fabricType: "",
    opacity: "",
    color: "",
    colorHex: "",
    pattern: "",
    composition: "",
    defaultHeightCm: "280",
    minHeightCm: "200",
    maxHeightCm: "300",
    weightGsm: "",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "",
    categoryId,
    images: [],
  };
}

const PRICING_UNITS = [
  { value: "ml", label: "Per linear meter (ml)" },
  { value: "buc", label: "Per piece (buc)" },
];

export function ProductForm({
  mode,
  productId,
  categories,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  productId?: string;
  categories: CategoryOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() =>
    emptyDraft(categories[0]?.id ?? "")
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  // Once the operator edits the slug by hand, stop overwriting it from the name.
  const [slugTouched, setSlugTouched] = useState(false);

  // Two things happen when the sheet opens onto a new record: the local state
  // resets, and (in edit mode) the product is fetched. The reset is adjusted
  // during render so the form never paints the previous product's values for a
  // frame; only the fetch — which is genuinely asynchronous — lives in an effect.
  const openKey = open ? `${mode}:${productId ?? "new"}` : null;
  const [lastOpenKey, setLastOpenKey] = useState(openKey);

  if (lastOpenKey !== openKey) {
    setLastOpenKey(openKey);
    if (openKey !== null) {
      setFieldErrors({});
      setDraft(emptyDraft(categories[0]?.id ?? ""));
      setSlugTouched(false);
      setLoading(mode === "edit" && Boolean(productId));
    }
  }

  useEffect(() => {
    if (!open || mode !== "edit" || !productId) return;

    // `loading` is already true: the render-time reset above set it when the
    // sheet opened onto this product.
    let cancelled = false;

    fetch(`/api/admin/products/${productId}`)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        if (!payload?.product) {
          toast.error(payload?.error ?? "Could not load the product.");
          onOpenChange(false);
          return;
        }
        setDraft(toDraft(payload.product));
        setSlugTouched(true);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load the product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      // The sheet can be closed and reopened on another product mid-flight;
      // without this the first response would overwrite the second product.
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, productId]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setFieldErrors({});

    const body = {
      ...draft,
      images: draft.images
        .filter((image) => image.url.trim() !== "")
        .map((image) => ({ url: image.url.trim(), alt: image.alt.trim() })),
    };

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldErrors(payload.fields ?? {});
        toast.error(payload.error ?? "Could not save the product.");
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

  // Base UI's Select wants `{ value, label }` pairs; categories arrive as
  // `{ id, name, slug }`.
  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  const categoryLabels = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (value: string | null) =>
      (value && map.get(value)) ?? "Pick a category";
  }, [categories]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="admin-scope flex w-full flex-col gap-0 p-0 sm:max-w-[34rem]"
      >
        <SheetHeader className="shrink-0 border-b border-[var(--rule)] px-5 py-4">
          <SheetTitle className="text-[0.9375rem]">
            {mode === "create" ? "New product" : "Edit product"}
          </SheetTitle>
          <SheetDescription className="text-[0.8125rem]">
            {mode === "create"
              ? "Everything the storefront needs to list and price a curtain."
              : "Changes publish to the storefront as soon as you save."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin text-muted-foreground"
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <form
              id="product-form"
              className="flex flex-col gap-7"
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <FieldGroup label="Identity">
                <Field
                  label="Name"
                  id="p-name"
                  errors={fieldErrors.name}
                  className="sm:col-span-2"
                >
                  <Input
                    id="p-name"
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
                  id="p-slug"
                  hint="Storefront URL: /produse/<slug>"
                  errors={fieldErrors.slug}
                  className="sm:col-span-2"
                >
                  <Input
                    id="p-slug"
                    value={draft.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      set("slug", event.target.value);
                    }}
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field label="SKU" id="p-sku" errors={fieldErrors.sku}>
                  <Input
                    id="p-sku"
                    value={draft.sku}
                    onChange={(event) => set("sku", event.target.value)}
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field label="Category" errors={fieldErrors.categoryId}>
                  <Select
                    items={categoryItems}
                    value={draft.categoryId || null}
                    onValueChange={(value: string | null) =>
                      set("categoryId", value ?? "")
                    }
                  >
                    <SelectTrigger size="sm" className="w-full text-[0.8125rem]">
                      <SelectValue>
                        {(value: string | null) => categoryLabels(value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="admin-scope">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Short description"
                  id="p-short"
                  hint="One line, shown on product cards."
                  errors={fieldErrors.shortDescription}
                  className="sm:col-span-2"
                >
                  <Input
                    id="p-short"
                    value={draft.shortDescription}
                    onChange={(event) =>
                      set("shortDescription", event.target.value)
                    }
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Description"
                  id="p-description"
                  errors={fieldErrors.description}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="p-description"
                    rows={5}
                    value={draft.description}
                    onChange={(event) => set("description", event.target.value)}
                    className="text-[0.8125rem]"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup label="Pricing">
                <Field
                  label="Price"
                  id="p-price"
                  hint="LEI, excluding tailoring."
                  errors={fieldErrors.pricePerUnit}
                >
                  <Input
                    id="p-price"
                    inputMode="decimal"
                    value={draft.pricePerUnit}
                    onChange={(event) =>
                      set("pricePerUnit", event.target.value)
                    }
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Original price"
                  id="p-original"
                  hint="Strike-through. Leave empty when not discounted."
                  errors={fieldErrors.originalPrice}
                >
                  <Input
                    id="p-original"
                    inputMode="decimal"
                    value={draft.originalPrice}
                    onChange={(event) =>
                      set("originalPrice", event.target.value)
                    }
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field label="Pricing unit" errors={fieldErrors.pricingUnit}>
                  <Select
                    items={PRICING_UNITS}
                    value={draft.pricingUnit}
                    onValueChange={(value: string | null) =>
                      set("pricingUnit", (value as "ml" | "buc") ?? "ml")
                    }
                  >
                    <SelectTrigger size="sm" className="w-full text-[0.8125rem]">
                      <SelectValue>
                        {(value: string | null) =>
                          PRICING_UNITS.find((unit) => unit.value === value)
                            ?.label ?? "Per linear meter (ml)"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="admin-scope">
                      {PRICING_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div />

                <Field
                  label="Min quantity"
                  id="p-minq"
                  errors={fieldErrors.minQuantity}
                >
                  <Input
                    id="p-minq"
                    inputMode="decimal"
                    value={draft.minQuantity}
                    onChange={(event) => set("minQuantity", event.target.value)}
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Max quantity"
                  id="p-maxq"
                  errors={fieldErrors.maxQuantity}
                >
                  <Input
                    id="p-maxq"
                    inputMode="decimal"
                    value={draft.maxQuantity}
                    onChange={(event) => set("maxQuantity", event.target.value)}
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup label="Specs">
                <Field label="Fabric" id="p-fabric" errors={fieldErrors.fabricType}>
                  <Input
                    id="p-fabric"
                    placeholder="catifea, voal, in…"
                    value={draft.fabricType}
                    onChange={(event) => set("fabricType", event.target.value)}
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field label="Opacity" id="p-opacity" errors={fieldErrors.opacity}>
                  <Input
                    id="p-opacity"
                    placeholder="blackout, semi-opac…"
                    value={draft.opacity}
                    onChange={(event) => set("opacity", event.target.value)}
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field label="Colour" id="p-color" errors={fieldErrors.color}>
                  <Input
                    id="p-color"
                    placeholder="Smarald"
                    value={draft.color}
                    onChange={(event) => set("color", event.target.value)}
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Colour swatch"
                  id="p-colorhex"
                  errors={fieldErrors.colorHex}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      id="p-colorhex"
                      placeholder="#2E8B57"
                      value={draft.colorHex}
                      onChange={(event) => set("colorHex", event.target.value)}
                      className="machine h-8 text-[0.8125rem]"
                    />
                    <span
                      aria-hidden
                      className="size-8 shrink-0 rounded-md border border-[var(--rule-strong)]"
                      style={{
                        background: /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                          draft.colorHex
                        )
                          ? draft.colorHex
                          : "transparent",
                      }}
                    />
                  </div>
                </Field>

                <Field label="Pattern" id="p-pattern" errors={fieldErrors.pattern}>
                  <Input
                    id="p-pattern"
                    placeholder="uni, brodat, jacquard…"
                    value={draft.pattern}
                    onChange={(event) => set("pattern", event.target.value)}
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Weight (g/m²)"
                  id="p-gsm"
                  errors={fieldErrors.weightGsm}
                >
                  <Input
                    id="p-gsm"
                    inputMode="numeric"
                    value={draft.weightGsm}
                    onChange={(event) => set("weightGsm", event.target.value)}
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Composition"
                  id="p-composition"
                  errors={fieldErrors.composition}
                  className="sm:col-span-2"
                >
                  <Input
                    id="p-composition"
                    placeholder="100% poliester"
                    value={draft.composition}
                    onChange={(event) => set("composition", event.target.value)}
                    className="h-8 text-[0.8125rem]"
                  />
                </Field>

                <Field
                  label="Default height (cm)"
                  id="p-defh"
                  errors={fieldErrors.defaultHeightCm}
                >
                  <Input
                    id="p-defh"
                    inputMode="numeric"
                    value={draft.defaultHeightCm}
                    onChange={(event) =>
                      set("defaultHeightCm", event.target.value)
                    }
                    className="machine h-8 text-[0.8125rem]"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Min height"
                    id="p-minh"
                    errors={fieldErrors.minHeightCm}
                  >
                    <Input
                      id="p-minh"
                      inputMode="numeric"
                      value={draft.minHeightCm}
                      onChange={(event) =>
                        set("minHeightCm", event.target.value)
                      }
                      className="machine h-8 text-[0.8125rem]"
                    />
                  </Field>
                  <Field
                    label="Max height"
                    id="p-maxh"
                    errors={fieldErrors.maxHeightCm}
                  >
                    <Input
                      id="p-maxh"
                      inputMode="numeric"
                      value={draft.maxHeightCm}
                      onChange={(event) =>
                        set("maxHeightCm", event.target.value)
                      }
                      className="machine h-8 text-[0.8125rem]"
                    />
                  </Field>
                </div>
              </FieldGroup>

              <ImagesField
                images={draft.images}
                onChange={(images) => set("images", images)}
                error={fieldErrors.images?.[0]}
              />

              <FieldGroup label="Visibility">
                <Toggle
                  label="In stock"
                  hint="Off hides the buy button on the storefront."
                  checked={draft.inStock}
                  onChange={(value) => set("inStock", value)}
                />
                <Toggle
                  label="Featured"
                  hint="Shows on the landing page."
                  checked={draft.isFeatured}
                  onChange={(value) => set("isFeatured", value)}
                />
                <Toggle
                  label="On sale"
                  hint="Draws the sale badge. Needs an original price."
                  checked={draft.isOnSale}
                  onChange={(value) => set("isOnSale", value)}
                />
              </FieldGroup>
            </form>
          </div>
        )}

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--rule)] bg-[var(--paper-2)] px-5 py-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            size="lg"
            disabled={saving || loading}
          >
            {saving ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : null}
            {mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Form furniture ──────────────────────────────────────────────── */

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="readout mb-3 border-b border-[var(--rule)] pb-2 w-full">
        {label}
      </legend>
      <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
        {children}
      </div>
    </fieldset>
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--rule)] p-3 sm:col-span-2">
      <Switch
        checked={checked}
        onCheckedChange={(value: boolean) => onChange(value)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-medium">{label}</span>
        <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted-foreground">
          {hint}
        </span>
      </span>
    </label>
  );
}

function ImagesField({
  images,
  onChange,
  error,
}: {
  images: ImageDraft[];
  onChange: (images: ImageDraft[]) => void;
  error?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="readout mb-3 w-full border-b border-[var(--rule)] pb-2">
        Images
      </legend>

      <p className="mb-3 text-[0.75rem] leading-relaxed text-muted-foreground">
        Paths under <code className="machine">/public</code> (e.g.{" "}
        <code className="machine">/products/catifea-smarald.jpg</code>) or full
        URLs. The first image is the one cards and the gallery lead with.
      </p>

      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-md border border-[var(--rule)] p-2"
          >
            <span className="readout mt-2 w-5 shrink-0 text-center">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                value={image.url}
                placeholder="/products/example.jpg"
                aria-label={`Image ${index + 1} URL`}
                onChange={(event) =>
                  onChange(
                    images.map((item, i) =>
                      i === index ? { ...item, url: event.target.value } : item
                    )
                  )
                }
                className="machine h-8 text-[0.8125rem]"
              />
              <Input
                value={image.alt}
                placeholder="Alt text (Romanian, for screen readers)"
                aria-label={`Image ${index + 1} alt text`}
                onChange={(event) =>
                  onChange(
                    images.map((item, i) =>
                      i === index ? { ...item, alt: event.target.value } : item
                    )
                  )
                }
                className="h-8 text-[0.8125rem]"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove image ${index + 1}`}
              onClick={() => onChange(images.filter((_, i) => i !== index))}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[0.75rem] text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => onChange([...images, { url: "", alt: "" }])}
      >
        <Plus aria-hidden />
        Add image
      </Button>
    </fieldset>
  );
}

/* ── Mapping ─────────────────────────────────────────────────────── */

type ApiProduct = {
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  pricePerUnit: number;
  originalPrice: number | null;
  pricingUnit: string;
  minQuantity: number;
  maxQuantity: number;
  fabricType: string | null;
  opacity: string | null;
  color: string | null;
  colorHex: string | null;
  pattern: string | null;
  composition: string | null;
  defaultHeightCm: number;
  minHeightCm: number;
  maxHeightCm: number;
  weightGsm: number | null;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sku: string | null;
  categoryId: string;
  images: Array<{ url: string; alt: string | null }>;
};

/** Nulls become empty strings: an `<input>` with `value={null}` goes uncontrolled. */
function toDraft(product: ApiProduct): Draft {
  const text = (value: string | null) => value ?? "";
  const num = (value: number | null) => (value === null ? "" : String(value));

  return {
    name: product.name,
    slug: product.slug,
    description: text(product.description),
    shortDescription: text(product.shortDescription),
    pricePerUnit: String(product.pricePerUnit),
    originalPrice: num(product.originalPrice),
    pricingUnit: product.pricingUnit === "buc" ? "buc" : "ml",
    minQuantity: String(product.minQuantity),
    maxQuantity: String(product.maxQuantity),
    fabricType: text(product.fabricType),
    opacity: text(product.opacity),
    color: text(product.color),
    colorHex: text(product.colorHex),
    pattern: text(product.pattern),
    composition: text(product.composition),
    defaultHeightCm: String(product.defaultHeightCm),
    minHeightCm: String(product.minHeightCm),
    maxHeightCm: String(product.maxHeightCm),
    weightGsm: num(product.weightGsm),
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    isOnSale: product.isOnSale,
    sku: text(product.sku),
    categoryId: product.categoryId,
    images: product.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? "",
    })),
  };
}
