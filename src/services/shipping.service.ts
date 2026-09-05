import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
} from "@/lib/validation";
import { roundPrice } from "@/lib/utils/currency";

/**
 * Calculate shipping cost based on cart subtotal.
 *
 * @param subtotal - Cart subtotal in RON
 * @returns Shipping cost: 0 if above free threshold, SHIPPING_FEE otherwise
 */
export function calculateShippingCost(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_FEE;
}

/**
 * Calculate the remaining amount needed for free shipping.
 *
 * @returns Amount in RON still needed, or 0 if already qualified
 */
export function remainingForFreeShipping(subtotal: number): number {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  return remaining > 0 ? roundPrice(remaining) : 0;
}

/**
 * Estimate delivery time based on whether items need tailoring.
 *
 * @param hasTailoredItems - Whether the order contains custom-sewn items
 * @returns Estimated delivery range string
 */
export function estimateDeliveryTime(hasTailoredItems: boolean): string {
  if (hasTailoredItems) {
    return "7–8 zile lucrătoare (include confecționare)";
  }
  return "1–3 zile lucrătoare";
}
