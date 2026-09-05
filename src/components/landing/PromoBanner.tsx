import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="bg-primary text-primary-foreground py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center flex flex-col items-center space-y-6">
        <span className="text-4xl">🔥</span>
        <h2 className="text-2xl lg:text-4xl font-bold">Oferte Speciale</h2>
        <p className="text-lg text-primary-foreground/90 max-w-lg">
          Reduceri de până la 40% la draperii și perdele selectate
        </p>
        <Link 
          href="/produse?sale=true"
          className={buttonVariants({ size: "lg", variant: "outline", className: "bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary mt-4" })}
        >
          Vezi Ofertele
        </Link>
      </div>
    </section>
  );
}
