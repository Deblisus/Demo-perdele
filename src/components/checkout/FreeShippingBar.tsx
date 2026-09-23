'use client';

import { useCartStore, getRemainingForFreeShipping } from "@/stores/cart.store";
import { formatRON } from "@/lib/utils/currency";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/validation";

export function FreeShippingBar() {
  const items = useCartStore((state) => state.items);
  const remaining = getRemainingForFreeShipping(items);

  if (items.length === 0) return null;

  if (remaining <= 0) {
    return (
      <p className="text-sm text-success">Ai transport gratuit.</p>
    );
  }

  const progress = ((FREE_SHIPPING_THRESHOLD - remaining) / FREE_SHIPPING_THRESHOLD) * 100;

  return (
    <div className="space-y-2">
      <p className="text-sm">
        Mai adaugă <span className="tnum font-medium">{formatRON(remaining)}</span> pentru transport gratuit.
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progres spre transport gratuit"
        className="h-[3px] w-full bg-border"
      >
        <div className="h-full bg-foreground" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
