'use client';

import { useCartStore, getSubtotal, getShippingCost, getTotal } from "@/stores/cart.store";
import { FreeShippingBar } from "./FreeShippingBar";
import { formatRON, calculateItemTotal } from "@/lib/utils/currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = getSubtotal(items);
  const shipping = getShippingCost(items);
  const total = getTotal(items);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
      <h3 className="font-semibold text-lg">Sumar comandă</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex justify-between text-sm">
            <div className="flex-1 pr-4">
              <span className="font-medium line-clamp-2">{item.name}</span>
              <div className="text-muted-foreground mt-1">
                {item.quantity} x {formatRON(item.pricePerUnit + item.tailoringPricePerUnit)}/{item.pricingUnit}
                {item.tailoringType && item.tailoringType !== 'none' && (
                  <div className="text-xs">
                    Manoperă inclusă
                  </div>
                )}
              </div>
            </div>
            <div className="font-medium">
              {formatRON(calculateItemTotal(item))}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatRON(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Transport</span>
          {shipping === 0 ? (
            <Badge variant="secondary" className="text-green-600 bg-green-50">GRATUIT</Badge>
          ) : (
            <span>{formatRON(shipping)}</span>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatRON(total)}</span>
      </div>

      <FreeShippingBar />
    </div>
  );
}
