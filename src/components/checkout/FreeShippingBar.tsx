'use client';

import { useCartStore, getRemainingForFreeShipping } from "@/stores/cart.store";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatRON } from "@/lib/utils/currency";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/validation";

export function FreeShippingBar() {
  const items = useCartStore((state) => state.items);
  const remaining = getRemainingForFreeShipping(items);
  
  if (items.length === 0) return null;

  if (remaining <= 0) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700 w-full justify-center py-2 text-sm">
        Transport gratuit!
      </Badge>
    );
  }

  const progress = ((FREE_SHIPPING_THRESHOLD - remaining) / FREE_SHIPPING_THRESHOLD) * 100;

  return (
    <div className="space-y-2">
      <p className="text-sm text-center">
        Mai adaugă <span className="font-bold">{formatRON(remaining)}</span> pentru transport gratuit
      </p>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
