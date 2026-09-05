import { z } from "zod";
import { isKnownCounty } from "@/lib/constants/romania";

// ── Constants ─────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  "PENDING",
  "PAYMENT_PROCESSING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TAILORING_TYPES = [
  "none",
  "rejansa_6cm",
  "rejansa_bara",
  "capse",
] as const;

export type TailoringType = (typeof TAILORING_TYPES)[number];

// ── Shipping ──────────────────────────────────────────────────────────

export const FREE_SHIPPING_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? "600"
);

export const SHIPPING_FEE = Number(
  process.env.NEXT_PUBLIC_SHIPPING_FEE ?? "20"
);

// ── Zod schemas ───────────────────────────────────────────────────────

/** Romanian phone: starts with 07 and has 10 digits total. */
const romanianPhone = z
  .string()
  .regex(/^07\d{8}$/, "Număr de telefon invalid (format: 07xxxxxxxx)");

/** Address fields shared between billing and shipping. */
const addressSchema = z.object({
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  phone: romanianPhone,
  address: z.string().min(3, "Adresa este obligatorie"),
  city: z.string().min(1, "Orașul este obligatoriu"),
  county: z
    .string()
    .min(1, "Județul este obligatoriu")
    .refine(isKnownCounty, "Selectați un județ din listă"),
  zipCode: z.string().optional(),
});

export const billingSchema = addressSchema.extend({
  email: z.string().email("Adresa de email este invalidă"),
});

export const shippingSchema = addressSchema;

/** A single cart item submitted at checkout. */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().optional(),
  pricePerUnit: z.number().positive(),
  pricingUnit: z.enum(["ml", "buc"]),
  quantity: z.number().positive(),
  heightCm: z.number().int().positive().optional(),
  tailoringType: z.enum(TAILORING_TYPES).optional(),
  tailoringPricePerUnit: z.number().min(0).default(0),
});

/** Full checkout form payload submitted from the client. */
export const checkoutSchema = z.object({
  billing: billingSchema,
  shipping: shippingSchema,
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z.array(checkoutItemSchema).min(1, "Coșul este gol"),
  /** Customer agrees that custom-cut items cannot be returned (OUG 34/2014). */
  acceptedTerms: z.boolean().refine(val => val === true, "Trebuie să acceptați termenii și condițiile"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type BillingInfo = z.infer<typeof billingSchema>;
export type ShippingInfo = z.infer<typeof shippingSchema>;
