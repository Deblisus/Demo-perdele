import { z } from "zod";

/**
 * Validation for product writes from the admin panel.
 *
 * Deliberately permissive about the curtain properties (they are free-text
 * facets on the storefront, not enums in the schema) and strict about anything
 * that affects money, ordering limits or the storefront's URL space.
 */

/** Empty strings from an HTML form mean "not set", not "set to empty". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

const optionalNumber = z
  .union([z.number(), z.string()])
  .transform((value) => {
    if (typeof value === "number") return value;
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .refine((value) => value === null || !Number.isNaN(value), {
    message: "Must be a number",
  })
  .nullable()
  .optional();

const requiredNumber = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "number" ? value : Number(String(value).replace(",", "."))
  )
  .refine((value) => Number.isFinite(value), { message: "Must be a number" });

export const productImageSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required").max(2048),
  alt: optionalText(200),
});

export const productBaseSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, digits and single hyphens"
    ),
  description: optionalText(8000),
  shortDescription: optionalText(400),

  pricePerUnit: requiredNumber.refine((value) => value > 0, {
    message: "Price must be greater than zero",
  }),
  originalPrice: optionalNumber,
  pricingUnit: z.enum(["ml", "buc"]),
  minQuantity: requiredNumber.refine((value) => value > 0, {
    message: "Minimum must be greater than zero",
  }),
  maxQuantity: requiredNumber.refine((value) => value > 0, {
    message: "Maximum must be greater than zero",
  }),

  fabricType: optionalText(60),
  opacity: optionalText(60),
  color: optionalText(60),
  colorHex: z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex colour like #2E8B57")
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
  pattern: optionalText(60),
  composition: optionalText(200),

  defaultHeightCm: requiredNumber.refine((value) => value > 0, {
    message: "Height must be greater than zero",
  }),
  minHeightCm: requiredNumber.refine((value) => value > 0, {
    message: "Height must be greater than zero",
  }),
  maxHeightCm: requiredNumber.refine((value) => value > 0, {
    message: "Height must be greater than zero",
  }),
  weightGsm: optionalNumber,

  inStock: z.boolean(),
  isFeatured: z.boolean(),
  isOnSale: z.boolean(),
  sku: optionalText(60),

  categoryId: z.string().trim().min(1, "Pick a category"),
  images: z.array(productImageSchema).max(12).default([]),
});

/**
 * Cross-field rules, applied only once every field is present — which is why
 * they hang off the create schema and not off `productBaseSchema`, whose shape
 * the patch schema reuses field by field.
 */
export const productCreateSchema = productBaseSchema
  .refine((data) => data.maxQuantity >= data.minQuantity, {
    message: "Maximum quantity must be at least the minimum",
    path: ["maxQuantity"],
  })
  .refine((data) => data.maxHeightCm >= data.minHeightCm, {
    message: "Maximum height must be at least the minimum",
    path: ["maxHeightCm"],
  })
  .refine(
    (data) =>
      data.defaultHeightCm >= data.minHeightCm &&
      data.defaultHeightCm <= data.maxHeightCm,
    {
      message: "Default height must sit inside the min/max range",
      path: ["defaultHeightCm"],
    }
  )
  .refine(
    // A strike-through price at or below the selling price shows the customer
    // a "discount" that isn't one.
    (data) => data.originalPrice == null || data.originalPrice > data.pricePerUnit,
    {
      message: "Original price must be higher than the current price",
      path: ["originalPrice"],
    }
  );

/** Inline edits and toggles send one or two fields, never the whole product. */
export const productPatchSchema = z
  .object({
    name: productBaseSchema.shape.name.optional(),
    slug: productBaseSchema.shape.slug.optional(),
    sku: optionalText(60),
    pricePerUnit: productBaseSchema.shape.pricePerUnit.optional(),
    originalPrice: optionalNumber,
    categoryId: z.string().trim().min(1).optional(),
    inStock: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isOnSale: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

export const productBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one product").max(500),
  action: z.enum([
    "feature",
    "unfeature",
    "in_stock",
    "out_of_stock",
    "on_sale",
    "off_sale",
  ]),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductBulkAction = z.infer<typeof productBulkSchema>["action"];

/** Romanian-aware slugify — `Draperie Catifea Smarald` → `draperie-catifea-smarald`. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    // Strip combining marks, then the two Romanian letters whose comma-below
    // forms do not decompose in NFD.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
