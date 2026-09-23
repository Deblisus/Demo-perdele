'use client';

import { useCartStore } from "@/stores/cart.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRON, calculateItemTotal } from "@/lib/utils/currency";
import { TAILORING_OPTIONS } from "@/lib/constants/tailoring";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const tailoringLabel = (type: string) =>
  TAILORING_OPTIONS.find((t) => t.type === type)?.label ?? type.replace('_', ' ');

export function CartReviewStep({ onNext }: { onNext: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="border-b border-border py-12">
        <h2 className="font-display text-3xl font-medium tracking-tight">Coșul tău este gol</h2>
        <p className="mt-3 text-muted-foreground">
          Nu ai adăugat încă niciun produs în coș.
        </p>
        <Link href="/produse" className={cn(buttonVariants(), "mt-8 h-12 rounded-sm px-7")}>
          Vezi colecția
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="sr-only">Coș</h2>
      <ul className="border-t border-foreground">
        {items.map((item, i) => (
          <li
            key={`${item.productId}-${i}`}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-border py-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-5"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt="" fill sizes="88px" className="object-cover" />
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium leading-snug">{item.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[
                      item.heightCm ? `Înălțime ${item.heightCm} cm` : null,
                      item.tailoringType && item.tailoringType !== 'none'
                        ? tailoringLabel(item.tailoringType)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <p className="tnum order-last font-medium sm:order-none sm:shrink-0 sm:text-right">
                  {formatRON(calculateItemTotal(item))}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                <div className="flex items-center gap-2">
                  <label htmlFor={`qty-${i}`} className="sr-only">
                    Cantitate {item.name}
                  </label>
                  <Input
                    id={`qty-${i}`}
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseFloat(e.target.value) || 1)}
                    className="tnum h-9 w-20 rounded-sm"
                  />
                  <span className="tnum text-sm text-muted-foreground">
                    {item.pricingUnit} × {formatRON(item.pricePerUnit + item.tailoringPricePerUnit)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-destructive"
                >
                  Elimină
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
        <Link
          href="/produse"
          className="text-sm underline-offset-4 hover:underline"
        >
          ← Continuă cumpărăturile
        </Link>
        <Button className="h-12 rounded-sm px-8 text-[0.95rem]" onClick={onNext}>
          Continuă spre date
        </Button>
      </div>
    </div>
  );
}
