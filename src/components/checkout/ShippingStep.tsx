'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Truck } from "lucide-react";
import { useCartStore, getShippingCost } from "@/stores/cart.store";
import { formatRON } from "@/lib/utils/currency";

export function ShippingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const items = useCartStore((state) => state.items);
  const shippingCost = getShippingCost(items);
  
  // Check if any items are tailored
  const hasTailoredItems = items.some(item => item.tailoringType && item.tailoringType !== 'none');

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-base">Metodă de livrare</h3>
        </div>
        <div className="flex justify-between items-center pl-8">
          <span>Curier Fan Courier - Standard (1-3 zile lucrătoare)</span>
          {shippingCost === 0 ? (
            <Badge variant="secondary" className="text-green-600 bg-green-50">GRATUIT</Badge>
          ) : (
            <span className="font-medium">{formatRON(shippingCost)}</span>
          )}
        </div>
      </div>

      {hasTailoredItems && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Informație importantă</AlertTitle>
          <AlertDescription>
            Comanda conține produse confecționate la comandă. Acestea necesită un timp suplimentar de procesare de aproximativ 7-8 zile lucrătoare.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Înapoi
        </Button>
        <Button onClick={onNext}>
          Continuă
        </Button>
      </div>
    </div>
  );
}
