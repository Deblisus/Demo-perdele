import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const categoryBaseSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, digits and single hyphens"
    ),
  description: optionalText(4000),
  imageUrl: optionalText(2048),
  sortOrder: z
    .union([z.number(), z.string()])
    .transform((value) =>
      typeof value === "number" ? value : Number(String(value).trim() || "0")
    )
    .refine((value) => Number.isInteger(value) && value >= 0 && value <= 9999, {
      message: "Use a whole number between 0 and 9999",
    }),
});

/** Inline cell edits send a single field. */
export const categoryPatchSchema = categoryBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Nothing to update" }
);

export type CategoryInput = z.infer<typeof categoryBaseSchema>;
