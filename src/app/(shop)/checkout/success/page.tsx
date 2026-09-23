'use client';

import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="max-w-xl">
      <p className="text-sm text-success">Comandă înregistrată</p>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight lg:text-5xl">
        Mulțumim, comanda ta a fost plasată.
      </h1>

      {orderNumber && (
        <dl className="mt-8 border-y border-border py-4">
          <dt className="text-sm text-muted-foreground">Număr comandă</dt>
          <dd className="mt-1 font-mono text-lg font-medium">{orderNumber}</dd>
        </dl>
      )}

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Îți trimitem în curând un email de confirmare cu detaliile comenzii.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        {orderNumber && (
          <Link
            href={`/orders/track?orderNumber=${orderNumber}`}
            className={cn(buttonVariants(), "h-12 rounded-sm px-7")}
          >
            Urmărește comanda
          </Link>
        )}
        <Link href="/" className="text-sm underline-offset-4 hover:underline">
          Înapoi la magazin
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 pt-16 lg:px-8 lg:pt-24">
      <Suspense fallback={<p className="text-muted-foreground">Se încarcă…</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
