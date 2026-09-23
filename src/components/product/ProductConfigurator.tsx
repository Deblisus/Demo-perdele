"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { useCartStore } from "@/stores/cart.store";
import { TAILORING_OPTIONS } from "@/lib/constants/tailoring";
import { formatRON, calculateItemTotal } from "@/lib/utils/currency";
import type { TailoringType } from "@/lib/validation";
import { AddToCartButton } from "./AddToCartButton";

interface ProductConfiguratorProps {
  product: {
    id: string;
    name: string;
    slug: string;
    pricePerUnit: number;
    originalPrice: number | null;
    pricingUnit: string;
    minQuantity: number;
    maxQuantity: number;
    defaultHeightCm: number;
    minHeightCm: number;
    maxHeightCm: number;
    isOnSale: boolean;
    images: { url: string }[];
  };
}

/*
 * Palette note: both palettes redefine the same tokens, so this file only
 * uses token utilities. `primary` is a fill (gold in Gold, ink in Classic)
 * and is never used as text on paper. Control borders use
 * `border-foreground/25`, which clears 3:1 in both palettes where
 * `border-input` (a light gold in Gold) does not.
 */
const control =
  "h-12 rounded-sm border border-foreground/25 bg-card text-base transition-colors duration-150 hover:border-foreground/50";
const focusRing =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const isMl = product.pricingUnit === "ml";

  const [quantity, setQuantity] = useState<number>(
    isMl ? Math.max(2.5, product.minQuantity) : product.minQuantity
  );
  const [heightCm, setHeightCm] = useState<number>(product.defaultHeightCm);
  const [tailoringType, setTailoringType] = useState<TailoringType>("none");

  const addItem = useCartStore((state) => state.addItem);

  const selectedTailoring = TAILORING_OPTIONS.find((t) => t.type === tailoringType);
  const tailoringPricePerUnit = selectedTailoring?.pricePerUnit ?? 0;

  const handleQuantityChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setQuantity(num);
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setHeightCm(num);
    }
  };

  const decrementQuantity = () => {
    const step = isMl ? 0.5 : 1;
    setQuantity((q) => Math.max(product.minQuantity, q - step));
  };

  const incrementQuantity = () => {
    const step = isMl ? 0.5 : 1;
    setQuantity((q) => Math.min(product.maxQuantity, q + step));
  };

  const currentTotal = calculateItemTotal({
    pricePerUnit: product.pricePerUnit,
    quantity,
    pricingUnit: product.pricingUnit as "ml" | "buc",
    tailoringPricePerUnit: isMl ? tailoringPricePerUnit : 0,
  });

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.images?.[0]?.url || "",
      pricePerUnit: product.pricePerUnit,
      pricingUnit: product.pricingUnit as "ml" | "buc",
      quantity,
      heightCm: isMl ? heightCm : undefined,
      tailoringType: isMl ? tailoringType : undefined,
      tailoringPricePerUnit: isMl ? tailoringPricePerUnit : 0,
    });

    toast.success(`${product.name} a fost adăugat în coș`, {
      action: {
        label: "Mergi la coș",
        onClick: () => {
          window.location.href = "/checkout";
        },
      },
      cancel: {
        label: "Continuă cumpărăturile",
        onClick: () => {},
      },
    });
  };

  const onSale = Boolean(
    product.isOnSale && product.originalPrice && product.originalPrice > product.pricePerUnit
  );

  const stepper = (
    <div className={cn(control, "flex items-stretch overflow-hidden")}>
      <button
        type="button"
        onClick={decrementQuantity}
        disabled={quantity <= product.minQuantity}
        aria-label="Scade cantitatea"
        className={cn(
          "inline-flex w-11 shrink-0 items-center justify-center hover:bg-muted disabled:pointer-events-none disabled:opacity-35",
          focusRing
        )}
      >
        <Minus className="size-4" />
      </button>
      <input
        id="quantity"
        type="number"
        inputMode="decimal"
        value={quantity}
        onChange={(e) => handleQuantityChange(e.target.value)}
        min={product.minQuantity}
        max={product.maxQuantity}
        step={isMl ? 0.5 : 1}
        className={cn(
          "tnum w-full min-w-0 bg-transparent text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          focusRing
        )}
      />
      <button
        type="button"
        onClick={incrementQuantity}
        disabled={quantity >= product.maxQuantity}
        aria-label="Crește cantitatea"
        className={cn(
          "inline-flex w-11 shrink-0 items-center justify-center hover:bg-muted disabled:pointer-events-none disabled:opacity-35",
          focusRing
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );

  return (
    <div>
      {/* Price */}
      <p className="tnum flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn("font-display text-3xl font-medium tracking-tight", onSale && "text-brand")}>
          {formatRON(product.pricePerUnit)}
        </span>
        <span className="text-muted-foreground">/ {isMl ? "metru liniar" : product.pricingUnit}</span>
        {onSale && (
          <>
            <span className="text-sm text-muted-foreground line-through">
              {formatRON(product.originalPrice!)}
            </span>
            <span className="bg-brand px-1.5 py-0.5 text-xs font-semibold text-brand-foreground">
              −{Math.round((1 - product.pricePerUnit / product.originalPrice!) * 100)}%
            </span>
          </>
        )}
      </p>

      {/* Dimensions */}
      <div className="mt-5 border-t border-border pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium">{isMl ? "Dimensiuni" : "Cantitate"}</p>
          {isMl && (
            <Link
              href="/#masurare"
              className="text-xs whitespace-nowrap text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cum măsor fereastra?
            </Link>
          )}
        </div>

        {isMl ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label htmlFor="quantity" className="text-xs text-muted-foreground">
                Lățime material (ml)
              </label>
              <div className="mt-1.5">{stepper}</div>
              <p className="mt-1.5 text-xs text-muted-foreground">2–2,5 × lățimea galeriei</p>
            </div>
            <div className="min-w-0">
              <label htmlFor="height" className="text-xs text-muted-foreground">
                Înălțime (cm)
              </label>
              <input
                id="height"
                type="number"
                inputMode="numeric"
                value={heightCm}
                onChange={(e) => handleHeightChange(e.target.value)}
                min={product.minHeightCm}
                max={product.maxHeightCm}
                step={1}
                className={cn(control, focusRing, "tnum mt-1.5 w-full px-3")}
              />
              <p className="tnum mt-1.5 text-xs text-muted-foreground">
                {product.minHeightCm}–{product.maxHeightCm} cm
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 w-40">
            <label htmlFor="quantity" className="sr-only">
              Cantitate
            </label>
            {stepper}
          </div>
        )}
      </div>

      {/* Finishing — native radios, styled as one segmented list */}
      {isMl && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Manoperă</legend>
          <div className="mt-3 divide-y divide-foreground/15 overflow-hidden rounded-sm border border-foreground/25">
            {TAILORING_OPTIONS.map((option) => {
              const selected = tailoringType === option.type;
              return (
                <label
                  key={option.type}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center justify-between gap-4 px-4 text-sm transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ring",
                    selected
                      ? "bg-primary font-medium text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  <input
                    type="radio"
                    name="tailoring"
                    value={option.type}
                    checked={selected}
                    onChange={() => setTailoringType(option.type)}
                    className="sr-only"
                  />
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full border",
                        selected ? "border-primary-foreground" : "border-foreground/40"
                      )}
                    >
                      {selected && <span className="size-2 rounded-full bg-primary-foreground" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </span>
                  <span
                    className={cn(
                      "tnum shrink-0 whitespace-nowrap",
                      selected ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {option.pricePerUnit === 0 ? "inclus" : `+${option.pricePerUnit} lei/ml`}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {selectedTailoring?.description}
            {tailoringType !== "none" &&
              " · Confecționare în 7–8 zile lucrătoare; produsele croite pe măsură nu se pot returna (OUG 34/2014)."}
          </p>
        </fieldset>
      )}

      {/* Total + add */}
      <div className="mt-5 border-t border-foreground pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Total</p>
            {isMl && (
              <p className="tnum mt-0.5 text-xs text-muted-foreground">
                {quantity} ml × {formatRON(product.pricePerUnit + tailoringPricePerUnit)}
              </p>
            )}
          </div>
          <p className="tnum font-display text-3xl font-medium tracking-tight" aria-live="polite">
            {formatRON(currentTotal)}
          </p>
        </div>

        <AddToCartButton onClick={handleAddToCart} className="mt-4" />
      </div>
    </div>
  );
}
