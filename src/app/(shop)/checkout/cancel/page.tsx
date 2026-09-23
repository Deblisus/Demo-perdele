import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 pt-16 lg:px-8 lg:pt-24">
      <div className="max-w-xl">
        <p className="text-sm text-destructive">Plata nu a fost finalizată</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight lg:text-5xl">
          Plata a fost anulată.
        </h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Produsele sunt încă în coș, așa că poți
          încerca din nou oricând.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/checkout" className={cn(buttonVariants(), "h-12 rounded-sm px-7")}>
            Încearcă din nou
          </Link>
          <Link href="/produse" className="text-sm underline-offset-4 hover:underline">
            Înapoi la produse
          </Link>
        </div>
      </div>
    </div>
  );
}
