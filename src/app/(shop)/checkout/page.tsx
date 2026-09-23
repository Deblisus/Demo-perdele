import { Metadata } from "next";
import { CheckoutWizard } from "@/components/checkout/CheckoutWizard";

export const metadata: Metadata = {
  title: "Finalizare comandă | Perdele online",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8 lg:pt-10">
      <h1 className="font-display text-4xl font-medium tracking-tight lg:text-5xl">
        Finalizare comandă
      </h1>
      <CheckoutWizard />
    </div>
  );
}
