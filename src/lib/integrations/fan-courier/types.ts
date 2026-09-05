import { z } from 'zod';

export interface FanCourierConfig {
  clientId: string;
  username?: string;
  password?: string;
}

export interface CreateAwbPayload {
  service: string;
  recipient: {
    name: string;
    phone: string;
    email?: string;
    county: string;
    city: string;
    street: string;
    streetNo?: string;
    zipCode?: string;
  };
  parcels?: number;
  envelopes?: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  cod?: number;
  declaredValue?: number;
  payment?: 'destinatar' | 'expeditor';
  content?: string;
  observation?: string;
  options?: string[];
}

/**
 * Field-level validation errors from /intern-awb, keyed by the dotted request
 * path — e.g. `{ "recipient.address.county": ["The selected ... is invalid."] }`.
 * The published docs describe a flat string array, so both shapes are accepted.
 */
export const AwbErrorsSchema = z.union([
  z.record(z.string(), z.array(z.string())),
  z.array(z.string())
]);

export type AwbErrors = z.infer<typeof AwbErrorsSchema>;

/**
 * One shipment result inside the `response` array.
 *
 * Unknown keys are preserved rather than stripped, because the live API has
 * drifted from its own documentation in ways that used to break parsing:
 *  - `awbNumber` is `null` on failure and numeric on success
 *  - `packages` is a parcel *count* on success, not an array of parcels
 *  - `errors` is a field → messages map, not a string array, and is
 *    explicitly `null` (not absent) on success — so it must be `nullish`
 *  - `estimatedDeliveryTime` is a number of hours (e.g. `24`) on success,
 *    despite being documented elsewhere as a string
 */
export const AwbShipmentResultSchema = z.looseObject({
  awbNumber: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v) => (v == null ? null : String(v))),
  success: z.boolean().optional(),
  tariff: z.number().nullish(),
  vat: z.number().nullish(),
  packages: z.number().nullish(),
  letter: z.string().nullish(),
  routingCode: z.string().nullish(),
  estimatedDeliveryTime: z.union([z.string(), z.number()]).nullish(),
  errors: AwbErrorsSchema.nullish()
});

export type AwbShipmentResult = z.infer<typeof AwbShipmentResultSchema>;

export const AwbResponseSchema = z.object({
  response: z.array(AwbShipmentResultSchema)
});

export type AwbResponse = z.infer<typeof AwbResponseSchema>;

/**
 * Flatten Fan Courier's validation errors into a single readable line so the
 * failing field survives into logs instead of being swallowed.
 */
export function formatAwbErrors(errors?: AwbErrors | null): string | null {
  if (!errors) return null;

  if (Array.isArray(errors)) {
    return errors.length > 0 ? errors.join('; ') : null;
  }

  const parts = Object.entries(errors).map(
    ([field, messages]) => `${field}: ${messages.join(', ')}`
  );

  return parts.length > 0 ? parts.join('; ') : null;
}

export const TrackingEventSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  location: z.string().optional(),
  date: z.string()
});

export type TrackingEvent = z.infer<typeof TrackingEventSchema>;

export const TrackingResponseSchema = z.object({
  awbNumber: z.string(),
  content: z.string().optional(),
  date: z.string().optional(),
  events: z.array(TrackingEventSchema),
  confirmation: z.string().optional(),
  OTD: z.string().optional()
});

export type TrackingResponse = z.infer<typeof TrackingResponseSchema>;

export const LocalitySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).optional(),
  name: z.string(),
  county: z.string(),
  agency: z.string().optional()
});

export type Locality = z.infer<typeof LocalitySchema>;

export const LoginResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    token: z.string(),
    expiresAt: z.string().optional()
  }),
  message: z.string().optional()
});
