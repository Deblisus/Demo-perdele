'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
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
    <div className="border-t border-foreground pt-6">
      <h2 className="font-display text-2xl font-medium tracking-tight">Plată</h2>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
        className="mt-6"
      >
        <Label
          htmlFor="CARD"
          className="flex cursor-pointer items-start gap-3 rounded-sm border border-foreground px-4 py-4 font-normal"
        >
          <RadioGroupItem value="CARD" id="CARD" className="mt-0.5" />
          <span className="min-w-0">
            <span className="block font-medium">Card bancar online</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Plătești pe pagina securizată Netopia, apoi revii aici.
            </span>
          </span>
        </Label>
      </RadioGroup>

      <div className="mt-8 space-y-4 border-t border-border pt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="returnPolicy"
            checked={returnPolicyAccepted}
            onCheckedChange={(c) => setReturnPolicyAccepted(!!c)}
            className="mt-0.5"
          />
          <Label htmlFor="returnPolicy" className="font-normal leading-snug">
            Înțeleg că produsele personalizate (tăiate sau confecționate la
            comandă) nu pot fi returnate, conform OUG 34/2014.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(c) => setTermsAccepted(!!c)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="font-normal leading-snug">
            Accept termenii și condițiile.
          </Label>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="self-start text-sm underline-offset-4 hover:underline disabled:opacity-50"
        >
          ← Înapoi la livrare
        </button>
        <Button
          onClick={() => onSubmit(paymentMethod)}
          disabled={!canSubmit}
          className="tnum h-12 w-full rounded-sm px-8 text-[0.95rem] sm:w-auto"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Se procesează…" : `Plătește ${formatRON(total)}`}
        </Button>
      </div>
      {!canSubmit && !isSubmitting && (
        <p className="mt-3 text-right text-xs text-muted-foreground">
          Bifează cele două confirmări pentru a plăti.
        </p>
      )}
    </div>
  );
}
