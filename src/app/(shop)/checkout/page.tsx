import { Metadata } from "next";
import { CheckoutWizard } from "@/components/checkout/CheckoutWizard";

export const metadata: Metadata = {
  title: "Finalizare comandă",
};

export default function CheckoutPage() {
  return (
    <div className="bg-muted/30 min-h-screen py-8">
      <CheckoutWizard />
    </div>
  );
}
