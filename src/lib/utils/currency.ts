/**
 * Currency formatting utilities for Romanian Lei (RON).
 */

const RON_FORMATTER = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Romanian Lei, e.g. `150,00 RON` */
export function formatRON(amount: number): string {
  return RON_FORMATTER.format(amount);
}

/**
 * Round to 2 decimal places (banker's rounding).
 * Use for all price calculations to avoid floating-point drift.
 */
export function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate the total price for a cart item, including tailoring costs.
 *
 * For per-meter pricing (`ml`):
 *   total = (pricePerUnit + tailoringPricePerUnit) × quantity
 *
 * For per-piece pricing (`buc`):
 *   total = pricePerUnit × quantity + tailoringPricePerUnit × quantity
 */
export function calculateItemTotal(item: {
  pricePerUnit: number;
  quantity: number;
  pricingUnit: "ml" | "buc";
  tailoringPricePerUnit?: number;
}): number {
  const tailoring = item.tailoringPricePerUnit ?? 0;
  const unitTotal = item.pricePerUnit + tailoring;
  return roundPrice(unitTotal * item.quantity);
}

/**
 * Generate a human-readable order number.
 * Format: ORD-{YEAR}-{5-digit sequence}
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(5, "0");
  return `ORD-${year}-${seq}`;
}
