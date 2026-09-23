"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  applyPalette,
  DEFAULT_PALETTE,
  PALETTE_STORAGE_KEY,
  type Palette,
} from "@/lib/palette";

const OPTIONS: { value: Palette; label: string }[] = [
  { value: "gold", label: "Auriu" },
  { value: "classic", label: "Clasic" },
];

/** Floating switch between the gold palette and the original Atelier one. */
export function PaletteToggle() {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);

  useEffect(() => {
    setPalette(document.documentElement.dataset.palette === "gold" ? "gold" : "classic");
  }, []);

  function choose(next: Palette) {
    setPalette(next);
    applyPalette(next);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // Storage blocked: the choice still applies for this page view.
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Paletă de culori"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex rounded-full border border-border bg-card p-1 text-xs font-medium text-card-foreground shadow-md"
    >
      {OPTIONS.map((option) => {
        const active = palette === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full border border-current"
              style={{ background: option.value === "gold" ? "#F0BD50" : "oklch(0.25 0.012 60)" }}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
