import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Asymmetric split: the promise on the left, one tall curtain on the right,
 * no overlay and no gradient. The photo is the only colour above the fold.
 */
export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-8 pb-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-14 lg:pb-24">
      <div className="flex min-w-0 flex-col justify-center lg:col-span-6 lg:pr-6">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.02em] [overflow-wrap:anywhere]">
          Croite pe măsura ferestrei tale.
        </h1>
        <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-muted-foreground lg:text-lg">
          Alegi materialul, ne spui lățimea și înălțimea, iar atelierul le coase
          cu rejansă sau capse. Livrăm cu Fan Courier în toată țara.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href="/produse"
            className={cn(buttonVariants(), "h-12 px-7 text-[0.95rem]")}
          >
            Vezi colecția
          </Link>
          <Link
            href="#masurare"
            className="whitespace-nowrap text-sm font-medium underline decoration-border underline-offset-[6px] hover:decoration-foreground"
          >
            Cum măsor fereastra
          </Link>
        </div>

        <dl className="mt-12 grid max-w-[34rem] grid-cols-3 border-t border-border pt-5 text-xs">
          <div className="pr-3">
            <dt className="text-muted-foreground">Preț</dt>
            <dd className="mt-1 font-medium">pe metru liniar</dd>
          </div>
          <div className="border-l border-border px-3">
            <dt className="text-muted-foreground">Transport</dt>
            <dd className="mt-1 font-medium">gratuit peste {FREE_SHIPPING_THRESHOLD} lei</dd>
          </div>
          <div className="border-l border-border pl-3">
            <dt className="text-muted-foreground">Plată</dt>
            <dd className="mt-1 font-medium">card, prin Netopia</dd>
          </div>
        </dl>
      </div>

      <figure className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-sm bg-muted sm:aspect-[16/10] lg:col-span-6 lg:aspect-[4/5]">
        <Image
          src="https://images.unsplash.com/photo-1754611362309-71297e9f42fd?q=80&w=1600&auto=format&fit=crop"
          alt="Draperii gri prinse lateral la o fereastră mare, într-un living luminos"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          loading="eager"
        />
      </figure>
    </section>
  );
}
