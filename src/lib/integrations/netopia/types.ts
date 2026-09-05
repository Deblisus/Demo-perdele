import { z } from "zod";

// ── Config ─────────────────────────────────────────────────────────

export interface NetopiaConfig {
  apiKey: string;
  posSignature: string;
  isLive: boolean;
  publicKey: string;
}

// ── Payment status codes ──────────────────────────────────────────

export enum NetopiaPaymentStatus {
  REDIRECT_TO_PAYMENT = 101,
  PAID = 3,
  CONFIRMED = 5,
  REJECTED = 12,
  THREE_D_SECURE_PENDING = 15,
}

// ── Address (shared for billing & shipping) ───────────────────────

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  address: string;
  postalCode?: string;
}

// ── Product (optional line items) ─────────────────────────────────

export interface Product {
  name: string;
  code: string;
  category?: string;
  price: number;
  vat?: number;
}

// ── API request payload ───────────────────────────────────────────

export interface NetopiaOrderPayload {
  config: {
    notifyUrl: string;
    redirectUrl: string;
    language?: string;
  };
  payment: {
    options: { installments: number };
  };
  order: {
    orderID: string;
    amount: number;
    currency: string;
    description: string;
    billing: Address;
    shipping: Address;
    products?: Product[];
  };
}

// ── API response schemas ──────────────────────────────────────────

export const StartPaymentResponseSchema = z
  .object({
    paymentURL: z.string().optional(),
    code: z.coerce.number().optional(),
    status: z.coerce.number().optional(),
    ntpID: z.string().optional(),
    message: z.string().optional(),
    error: z
      .object({
        code: z.coerce.number(),
        message: z.string(),
      })
      .optional(),
  })
  .passthrough();

export type NetopiaStartPaymentResponse = z.infer<
  typeof StartPaymentResponseSchema
>;

// ── IPN (webhook) payload ─────────────────────────────────────────

export const NetopiaIpnPayloadSchema = z
  .object({
    ntpID: z.string(),
    orderID: z.string(),
    status: z.number(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    errorCode: z.number().optional(),
    errorMessage: z.string().optional(),
  })
  .passthrough();

export type NetopiaIpnPayload = z.infer<typeof NetopiaIpnPayloadSchema>;
