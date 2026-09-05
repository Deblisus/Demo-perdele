"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TailoringType } from "@/lib/validation";
import { calculateItemTotal, roundPrice } from "@/lib/utils/currency";
import {
  calculateShippingCost,
  remainingForFreeShipping,
} from "@/services/shipping.service";

// ── Types ────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  /** Price per unit (per linear meter or per piece) */
  pricePerUnit: number;
  /** Pricing unit: 'ml' (per linear meter) or 'buc' (per piece) */
  pricingUnit: "ml" | "buc";
  /** Quantity in the pricing unit (meters for ml, pieces for buc) */
  quantity: number;
  /** Custom height in centimeters (for curtain tailoring) */
  heightCm?: number;
  /** Selected tailoring type */
  tailoringType?: TailoringType;
  /** Tailoring cost per unit (LEI per ml or per piece) */
  tailoringPricePerUnit: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateTailoring: (
    productId: string,
    tailoringType: TailoringType,
    tailoringPricePerUnit: number
  ) => void;
  clearCart: () => void;
}

// ── Selectors (derived state) ────────────────────────────────────────

export function getSubtotal(items: CartItem[]): number {
  return roundPrice(
    items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  );
}

export function getShippingCost(items: CartItem[]): number {
  return calculateShippingCost(getSubtotal(items));
}

export function getTotal(items: CartItem[]): number {
  return roundPrice(getSubtotal(items) + getShippingCost(items));
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function getRemainingForFreeShipping(items: CartItem[]): number {
  return remainingForFreeShipping(getSubtotal(items));
}

// ── Store ────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.tailoringType === item.tailoringType &&
              i.heightCm === item.heightCm
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === existing.productId &&
                i.tailoringType === existing.tailoringType &&
                i.heightCm === existing.heightCm
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(0.5, quantity) }
              : i
          ),
        })),

      updateTailoring: (productId, tailoringType, tailoringPricePerUnit) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, tailoringType, tailoringPricePerUnit }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "perdele-cart",
    }
  )
);
