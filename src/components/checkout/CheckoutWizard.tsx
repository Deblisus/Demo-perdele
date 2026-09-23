'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { OrderSummary } from "./OrderSummary";
import { CartReviewStep } from "./CartReviewStep";
import { CustomerInfoStep } from "./CustomerInfoStep";
import { ShippingStep } from "./ShippingStep";
import { PaymentStep } from "./PaymentStep";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type BillingInfo, type ShippingInfo, type PaymentMethod, type CheckoutFormData } from "@/lib/validation";

const STEPS = ["Coș", "Date personale", "Livrare", "Plată"];

export function CheckoutWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));
  };
  
  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((p) => Math.max(0, p - 1));
  };

  const handleCustomerInfoNext = (b: BillingInfo, s: ShippingInfo, same: boolean) => {
    setBilling(b);
    setShipping(s);
    setSameAsShipping(same);
    handleNext();
  };

  const handleFinalSubmit = async (paymentMethod: PaymentMethod) => {
    if (!billing || !shipping) return;
    
    setError(null);
    setIsSubmitting(true);

    const payload: CheckoutFormData = {
      billing,
      shipping,
      sameAsShipping,
      paymentMethod,
      items,
      acceptedTerms: true,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.errors 
          ? JSON.stringify(data.errors, null, 2) 
          : data.message || "A apărut o eroare la plasarea comenzii";
        throw new Error(errorMessage);
      }

      const { paymentUrl, orderNumber } = await res.json();
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        clearCart();
        router.push(`/checkout/success?orderNumber=${orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || "A apărut o eroare. Vă rugăm să încercați din nou.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      {/* Step line: text, not bubbles. Done steps in ink, the current one underlined. */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-4 text-sm">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-3 whitespace-nowrap">
            <span
              aria-current={i === currentStep ? "step" : undefined}
              className={
                i === currentStep
                  ? "font-medium text-foreground underline decoration-brand decoration-2 underline-offset-[10px]"
                  : i < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
              }
            >
              <span className="tnum mr-1.5 text-muted-foreground">{i + 1}</span>
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="text-border">
                /
              </span>
            )}
          </li>
        ))}
      </ol>

      {error && (
        <Alert variant="destructive" className="mt-6 rounded-sm">
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          {currentStep === 0 && <CartReviewStep onNext={handleNext} />}
          {currentStep === 1 && (
            <CustomerInfoStep 
              onNext={handleCustomerInfoNext} 
              onBack={handleBack} 
              defaultBilling={billing || undefined}
              defaultShipping={shipping || undefined}
              defaultSameAsShipping={sameAsShipping}
            />
          )}
          {currentStep === 2 && <ShippingStep onNext={handleNext} onBack={handleBack} />}
          {currentStep === 3 && (
            <PaymentStep 
              onSubmit={handleFinalSubmit} 
              onBack={handleBack} 
              isSubmitting={isSubmitting}
            />
          )}
        </div>
        
        <div className="min-w-0 lg:col-span-5 xl:col-span-4 xl:col-start-9">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
