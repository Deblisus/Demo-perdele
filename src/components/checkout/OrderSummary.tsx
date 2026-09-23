'use client';

import { useCartStore, getSubtotal, getShippingCost, getTotal } from "@/stores/cart.store";
import { FreeShippingBar } from "./FreeShippingBar";
import { formatRON, calculateItemTotal } from "@/lib/utils/currency";

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = getSubtotal(items);
  const shipping = getShippingCost(items);
  const total = getTotal(items);

  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Sumar comandă"
      className="rounded-sm bg-secondary px-5 py-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:px-6"
    >
      <h2 className="font-display text-xl font-medium tracking-tight">Sumar comandă</h2>

      <ul className="mt-5 max-h-[18rem] space-y-4 overflow-y-auto border-t border-border pt-4 pr-1">
        {items.map((item, i) => (
          <li key={`${item.productId}-${i}`} className="flex justify-between gap-4 text-sm">
            <div className="min-w-0">
              <p className="line-clamp-2 leading-snug">{item.name}</p>
              <p className="tnum mt-1 text-xs text-muted-foreground">
                {item.quantity} {item.pricingUnit} × {formatRON(item.pricePerUnit + item.tailoringPricePerUnit)}
                {item.tailoringType && item.tailoringType !== 'none' && ' · manoperă inclusă'}
              </p>
            </div>
            <p className="tnum shrink-0">{formatRON(calculateItemTotal(item))}</p>
          </li>
        ))}
      </ul>

      <dl className="tnum mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatRON(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Transport</dt>
          <dd>{shipping === 0 ? "Gratuit" : formatRON(shipping)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-foreground pt-4">
        <span className="font-medium">Total</span>
        <span className="tnum font-display text-2xl font-medium tracking-tight">
          {formatRON(total)}
        </span>
      </div>

      <div className="mt-5">
        <FreeShippingBar />
      </div>
    </aside>
  );
}
