'use client';

import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRON, calculateItemTotal } from "@/lib/utils/currency";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CartReviewStep({ onNext }: { onNext: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-4">Coșul tău este gol</h2>
        <p className="text-muted-foreground mb-8">
          Nu ai adăugat încă niciun produs în coș.
        </p>
        <Link href="/">
          <Button>Întoarce-te la magazin</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex gap-4 p-4 border rounded-lg">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-medium text-sm sm:text-base">{item.name}</h3>
                  {item.tailoringType && item.tailoringType !== 'none' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Manoperă: {item.tailoringType.replace('_', ' ')}
                    </p>
                  )}
                  {item.heightCm && (
                    <p className="text-sm text-muted-foreground">
                      Înălțime: {item.heightCm} cm
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-destructive -mr-2 -mt-2 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min={0.5} 
                    step={0.5}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseFloat(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">{item.pricingUnit}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base sm:text-lg">
                    {formatRON(calculateItemTotal(item))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRON(item.pricePerUnit + item.tailoringPricePerUnit)} / {item.pricingUnit}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={onNext}>
          Continuă
        </Button>
      </div>
    </div>
  );
}
