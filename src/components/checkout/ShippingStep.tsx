'use client';

import { Button } from "@/components/ui/button";
import { useCartStore, getShippingCost } from "@/stores/cart.store";
import { formatRON } from "@/lib/utils/currency";

export function ShippingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const items = useCartStore((state) => state.items);
  const shippingCost = getShippingCost(items);

  // Check if any items are tailored
  const hasTailoredItems = items.some(item => item.tailoringType && item.tailoringType !== 'none');

  return (
    <div className="border-t border-foreground pt-6">
      <h2 className="font-display text-2xl font-medium tracking-tight">Livrare</h2>

      <div className="mt-6 flex items-start gap-3 rounded-sm border border-foreground px-4 py-4">
        <span aria-hidden="true" className="mt-1 grid size-4 shrink-0 place-items-center rounded-full border border-foreground">
          <span className="size-2 rounded-full bg-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Fan Courier — Standard</p>
          <p className="mt-0.5 text-sm text-muted-foreground">1–3 zile lucrătoare de la expediere</p>
        </div>
        <p className="tnum shrink-0 text-sm font-medium">
          {shippingCost === 0 ? "Gratuit" : formatRON(shippingCost)}
        </p>
      </div>

      {hasTailoredItems && (
        <div className="mt-4 rounded-sm bg-secondary px-4 py-4 text-sm leading-relaxed">
          <p className="font-medium">Comanda conține produse confecționate la comandă.</p>
          <p className="mt-1 text-muted-foreground">
            Acestea necesită aproximativ 7–8 zile lucrătoare de confecționare
            înainte de expediere.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
        <button type="button" onClick={onBack} className="text-sm underline-offset-4 hover:underline">
          ← Înapoi la date
        </button>
        <Button onClick={onNext} className="h-12 rounded-sm px-8 text-[0.95rem]">
          Continuă spre plată
        </Button>
      </div>
    </div>
  );
}
