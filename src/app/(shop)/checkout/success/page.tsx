'use client';

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-6">
      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
      <h1 className="text-3xl font-bold">Comanda ta a fost plasată cu succes!</h1>
      
      {orderNumber && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Număr comandă</p>
          <p className="font-mono text-lg font-semibold">{orderNumber}</p>
        </div>
      )}

      <p className="text-muted-foreground">
        Veți primi în curând un email de confirmare cu detaliile comenzii.
      </p>

      <div className="pt-6 space-y-3">
        {orderNumber && (
          <Link href={`/orders/track?orderNumber=${orderNumber}`} className="w-full block">
            <Button className="w-full">
              Urmărește comanda
            </Button>
          </Link>
        )}
        <Link href="/" className="w-full block">
          <Button variant="outline" className="w-full">
            Înapoi la magazin
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-[60vh] px-4">
      <Suspense fallback={<div className="text-center mt-16">Se încarcă...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
