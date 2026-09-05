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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300 rounded-full" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  i <= currentStep 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-background border-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs sm:text-sm font-medium hidden sm:block ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
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
        
        <div className="lg:col-span-4">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
