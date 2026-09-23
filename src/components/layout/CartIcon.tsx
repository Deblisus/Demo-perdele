"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";

/** The header's one solid button: the way into checkout. */
export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  // Lines, not metres: 2.5 ml of voile is one thing in the bag.
  const lineCount = useCartStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? lineCount : 0;

  return (
    <Link
      href="/checkout"
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px sm:h-11 sm:px-4"
      aria-label={count > 0 ? `Coș de cumpărături, ${count} produse — finalizează comanda` : "Coș de cumpărături"}
    >
      <ShoppingBag className="size-[1.125rem]" aria-hidden="true" />
      <span className="hidden sm:inline">Coș</span>
      <span
        aria-hidden="true"
        className={
          count > 0
            ? "tnum inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-on-ink px-1.5 text-xs font-bold text-foreground"
            : "tnum text-primary-foreground/70"
        }
      >
        {count}
      </span>
    </Link>
  );
}
