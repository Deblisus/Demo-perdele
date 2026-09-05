"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Info, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">
            {formatRON(product.pricePerUnit)} / {product.pricingUnit}
          </span>
          {product.isOnSale && product.originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatRON(product.originalPrice)}
              </span>
              <Badge variant="destructive" className="text-sm">
                -{Math.round((1 - product.pricePerUnit / product.originalPrice) * 100)}%
              </Badge>
            </>
          )}
        </div>
      </div>

      <Separator />

      {isMl && <h3 className="text-lg font-semibold">Configurator</h3>}

      <div className="space-y-6">
        {/* Quantity */}
        <div className="space-y-3">
          <Label htmlFor="quantity">
            {isMl ? "Metri liniari (lățime):" : "Cantitate:"}
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border border-input">
              <Button
                variant="ghost"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= product.minQuantity}
                className="rounded-r-none h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min={product.minQuantity}
                max={product.maxQuantity}
                step={isMl ? 0.5 : 1}
                className="w-20 border-0 rounded-none text-center focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= product.maxQuantity}
                className="rounded-l-none h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm font-medium">{product.pricingUnit}</span>
          </div>
          {isMl && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              Recomandăm 2-2.5x lățimea galeriei pentru falduri perfecte
            </p>
          )}
        </div>

        {/* Height (only for ml) */}
        {isMl && (
          <div className="space-y-3">
            <Label htmlFor="height">Înălțime (cm):</Label>
            <Input
              id="height"
              type="number"
              value={heightCm}
              onChange={(e) => handleHeightChange(e.target.value)}
              min={product.minHeightCm}
              max={product.maxHeightCm}
              step={1}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Între {product.minHeightCm} și {product.maxHeightCm} cm
            </p>
          </div>
        )}

        {/* Tailoring Options (only for ml) */}
        {isMl && (
          <div className="space-y-3">
            <Label>Tip manoperă/prindere:</Label>
            <RadioGroup
              value={tailoringType}
              onValueChange={(val) => setTailoringType(val as TailoringType)}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {TAILORING_OPTIONS.map((option) => (
                <Label
                  key={option.type}
                  htmlFor={option.type}
                  className={`flex cursor-pointer flex-col rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground ${
                    tailoringType === option.type
                      ? "border-primary bg-accent/10"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <RadioGroupItem value={option.type} id={option.type} />
                    <span className="font-semibold">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-auto">
                    {option.pricePerUnit === 0
                      ? "Gratuit"
                      : `+${option.pricePerUnit} lei/ml`}
                  </p>
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-4">
        {isMl && tailoringType !== "none" && tailoringPricePerUnit > 0 && (
          <p className="text-sm text-muted-foreground">
            {quantity} ml × ({product.pricePerUnit} + {tailoringPricePerUnit}) lei/ml
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">TOTAL:</span>
          <span className="text-3xl font-bold">{formatRON(currentTotal)}</span>
        </div>

        <AddToCartButton onClick={handleAddToCart} />
      </div>
    </div>
  );
}
