'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard } from "lucide-react";
import { useCartStore, getTotal } from "@/stores/cart.store";
import { formatRON } from "@/lib/utils/currency";
import type { PaymentMethod } from "@/lib/validation";

export function PaymentStep({ 
  onSubmit, 
  onBack,
  isSubmitting 
}: { 
  onSubmit: (paymentMethod: PaymentMethod) => void; 
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const items = useCartStore((state) => state.items);
  const total = getTotal(items);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [returnPolicyAccepted, setReturnPolicyAccepted] = useState(false);

  const canSubmit = termsAccepted && returnPolicyAccepted && !isSubmitting;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Metodă de plată</h3>
        
        <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
          <div className="flex items-center space-x-3 border rounded-lg p-4 bg-muted/50">
            <RadioGroupItem value="CARD" id="CARD" />
            <Label htmlFor="CARD" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Card bancar online (Netopia)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="returnPolicy" 
            checked={returnPolicyAccepted}
            onCheckedChange={(c) => setReturnPolicyAccepted(!!c)}
            className="mt-1"
          />
          <Label htmlFor="returnPolicy" className="leading-snug">
            Înțeleg că produsele personalizate (tăiate/confecționate la comandă) nu pot fi returnate conform OUG 34/2014.
          </Label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={(c) => setTermsAccepted(!!c)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="leading-snug">
            Accept termenii și condițiile.
          </Label>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Înapoi
        </Button>
        <Button 
          onClick={() => onSubmit(paymentMethod)} 
          disabled={!canSubmit}
          size="lg"
        >
          {isSubmitting ? "Se procesează..." : `Plătește ${formatRON(total)}`}
        </Button>
      </div>
    </div>
  );
}
