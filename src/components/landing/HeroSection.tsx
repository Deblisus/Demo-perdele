import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[70vh] lg:min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop"
          alt="Perdele și draperii premium"
          fill
          className="object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="max-w-2xl text-left">
          <p className="text-white/80 text-sm md:text-base font-semibold uppercase tracking-wider mb-4">
            Perdele & Draperii Premium
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Croite Pe Măsura Ta
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            Materiale de înaltă calitate • Confecționare la comandă • Livrare în toată țara
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/produse"
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
            >
              Descoperă Colecția
            </Link>
            <Link
              href="/produse?sale=true"
              className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto text-white border-white hover:bg-white hover:text-black" })}
            >
              Vezi Ofertele
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
