"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

const stepBtn =
  "inline-flex size-11 items-center justify-center text-foreground transition-colors duration-150 hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

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

  return (
    <div>
      {/* Price */}
      <p className="tnum flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-6">
        <span className={cn("font-display text-4xl font-medium tracking-tight", onSale && "text-brand")}>
          {formatRON(product.pricePerUnit)}
        </span>
        <span className="text-muted-foreground">/ {product.pricingUnit}</span>
        {onSale && (
          <>
            <span className="text-muted-foreground line-through">
              {formatRON(product.originalPrice!)}
            </span>
            <span className="bg-brand px-1.5 py-0.5 text-xs font-semibold text-brand-foreground">
              −{Math.round((1 - product.pricePerUnit / product.originalPrice!) * 100)}%
            </span>
          </>
        )}
      </p>

      <div className="divide-y divide-border">
        {/* 1 · Width (or quantity for pieces) */}
        <div className="py-6">
          <label htmlFor="quantity" className="flex items-baseline gap-3 text-sm font-medium">
            {isMl && <span className="tnum text-muted-foreground">1</span>}
            {isMl ? "Lățime material (metri liniari)" : "Cantitate"}
          </label>
          <div className="mt-3 flex items-center gap-3">
            <div className="inline-flex items-stretch rounded-sm border border-input">
              <button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= product.minQuantity}
                aria-label="Scade cantitatea"
                className={stepBtn}
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
                className="tnum w-20 border-x border-input bg-transparent text-center text-base [appearance:textfield] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= product.maxQuantity}
                aria-label="Crește cantitatea"
                className={stepBtn}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">{product.pricingUnit}</span>
          </div>
          {isMl && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pentru falduri, comandă de 2–2,5 ori lățimea galeriei.
            </p>
          )}
        </div>

        {/* 2 · Height */}
        {isMl && (
          <div className="py-6">
            <label htmlFor="height" className="flex items-baseline gap-3 text-sm font-medium">
              <span className="tnum text-muted-foreground">2</span>
              Înălțime (cm)
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                value={heightCm}
                onChange={(e) => handleHeightChange(e.target.value)}
                min={product.minHeightCm}
                max={product.maxHeightCm}
                step={1}
                className="tnum h-11 w-28 rounded-sm text-base"
              />
              <span className="tnum text-sm text-muted-foreground">
                între {product.minHeightCm} și {product.maxHeightCm} cm
              </span>
            </div>
          </div>
        )}

        {/* 3 · Finishing */}
        {isMl && (
          <fieldset className="py-6">
            <legend className="float-left flex w-full items-baseline gap-3 text-sm font-medium">
              <span className="tnum text-muted-foreground">3</span>
              Manoperă / prindere
            </legend>
            <RadioGroup
              value={tailoringType}
              onValueChange={(val) => setTailoringType(val as TailoringType)}
              className="clear-left mt-3 gap-0 overflow-hidden rounded-sm border border-input pt-0"
            >
              {TAILORING_OPTIONS.map((option) => {
                const selected = tailoringType === option.type;
                return (
                  <Label
                    key={option.type}
                    htmlFor={option.type}
                    className={cn(
                      "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-input px-4 py-3.5 font-normal transition-colors duration-150 last:border-b-0",
                      selected ? "bg-secondary" : "hover:bg-secondary/60"
                    )}
                  >
                    <RadioGroupItem value={option.type} id={option.type} className="mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                    <span className="tnum text-sm whitespace-nowrap">
                      {option.pricePerUnit === 0 ? "inclus" : `+${option.pricePerUnit} lei/ml`}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
            {tailoringType !== "none" && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Confecționare în 7–8 zile lucrătoare. Produsele croite pe măsură
                nu se pot returna (OUG 34/2014).
              </p>
            )}
          </fieldset>
        )}
      </div>

      {/* Total + add */}
      <div className="border-t border-foreground pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium">Total</span>
          <span className="tnum font-display text-3xl font-medium tracking-tight" aria-live="polite">
            {formatRON(currentTotal)}
          </span>
        </div>
        {isMl && (
          <p className="tnum mt-1 text-right text-xs text-muted-foreground">
            {quantity} ml × {formatRON(product.pricePerUnit + tailoringPricePerUnit)}
          </p>
        )}

        <AddToCartButton onClick={handleAddToCart} className="mt-5" />
      </div>
    </div>
  );
}
