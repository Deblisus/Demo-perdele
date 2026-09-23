import { z } from "zod";
import { db } from "@/lib/db";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/validation";

/**
 * Store settings, read from the `Setting` table with environment variables as
 * the fallback.
 *
 * Server-side only by construction (it touches Prisma). The cart store (`src/stores/cart.store.ts`) computes
 * shipping in the browser from the `NEXT_PUBLIC_*` variables, and it cannot
 * read the database — so those two numbers live in two places by necessity.
 * The database value is authoritative for what a customer is actually charged;
 * the settings page compares the two and says so out loud when they drift,
 * because a cart that promises free shipping at 600 while the server bills at
 * 500 is worse than either number being wrong on its own.
 */

export const settingsSchema = z.object({
  store: z.object({
    name: z.string().trim().max(120),
    email: z.string().trim().max(160),
    phone: z.string().trim().max(40),
    address: z.string().trim().max(300),
  }),
  shipping: z.object({
    freeShippingThreshold: z.number().min(0).max(1_000_000),
    shippingFee: z.number().min(0).max(10_000),
    defaultPackageWeightKg: z.number().min(0.1).max(100),
  }),
});

export type StoreSettings = z.infer<typeof settingsSchema>;

/** Values used when nothing has been saved yet. */
function defaults(): StoreSettings {
  return {
    store: {
      name: process.env.SENDER_NAME || "Perdele Shop",
      email: process.env.SENDER_EMAIL || "",
      phone: process.env.SENDER_PHONE || "",
      address: [
        process.env.SENDER_STREET,
        process.env.SENDER_CITY,
        process.env.SENDER_COUNTY,
        process.env.SENDER_ZIP_CODE,
      ]
        .filter(Boolean)
        .join(", "),
    },
    shipping: {
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      shippingFee: SHIPPING_FEE,
      // Matches the weight `generateAwbForOrder` has always sent to Fan Courier.
      defaultPackageWeightKg: 1.5,
    },
  };
}

const SETTING_KEYS = {
  store: "store.info",
  shipping: "shipping.defaults",
} as const;

async function readGroup<T>(key: string, fallback: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    // Merge over the fallback so a setting added after the row was written
    // still resolves, instead of coming back undefined.
    return { ...fallback, ...(JSON.parse(row.value) as Partial<T>) };
  } catch {
    console.error(`[Settings] ${key} holds invalid JSON — using defaults.`);
    return fallback;
  }
}

/** The full settings object, with defaults filled in. */
export async function getSettings(): Promise<StoreSettings> {
  const base = defaults();
  const [store, shipping] = await Promise.all([
    readGroup(SETTING_KEYS.store, base.store),
    readGroup(SETTING_KEYS.shipping, base.shipping),
  ]);
  return { store, shipping };
}

/** Just the shipping numbers — what `createOrder` needs on every checkout. */
export async function getShippingSettings(): Promise<
  StoreSettings["shipping"]
> {
  return readGroup(SETTING_KEYS.shipping, defaults().shipping);
}

/** Persist one group. Returns the settings as they now stand. */
export async function saveSettings(
  group: keyof StoreSettings,
  value: StoreSettings[keyof StoreSettings]
): Promise<void> {
  const key = SETTING_KEYS[group];
  const serialized = JSON.stringify(value);
  await db.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

/** What the browser will compute with, for the drift warning on the panel. */
export function clientShippingEnv(): {
  freeShippingThreshold: number;
  shippingFee: number;
} {
  return {
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
  };
}
