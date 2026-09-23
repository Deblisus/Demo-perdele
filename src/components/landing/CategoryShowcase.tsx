import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CategoryData = {
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  _count: { products: number };
};

interface CategoryShowcaseProps {
  categories: CategoryData[];
}

/**
 * The collections as an index, not a tile wall: a small swatch photo, the
 * name set large, one line of what it is for, and the count.
 */
export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-4">
        <h2 className="font-display text-3xl font-medium tracking-tight lg:text-4xl">
          Colecții
        </h2>
        <Link
          href="/produse"
          className="whitespace-nowrap text-sm font-medium underline-offset-4 hover:underline"
        >
          Toate produsele
        </Link>
      </div>

      <ul>
        {categories.map((category) => (
          <li key={category.slug} className="border-b border-border">
            <Link
              href={`/categorie/${category.slug}`}
              className="group grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 py-4 transition-colors duration-150 hover:bg-secondary sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:gap-6 lg:grid-cols-[5.5rem_minmax(0,16rem)_minmax(0,1fr)_auto]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                  {category.name}
                </h3>
                <p className="tnum mt-1 text-sm text-muted-foreground lg:hidden">
                  {category._count.products}{" "}
                  {category._count.products === 1 ? "produs" : "produse"}
                </p>
              </div>

              <p className="hidden text-sm leading-relaxed text-muted-foreground lg:line-clamp-2">
                {category.description}
              </p>

              <div className="flex items-center gap-4 pr-1 sm:pr-3">
                <span className="tnum hidden whitespace-nowrap text-sm text-muted-foreground lg:inline">
                  {category._count.products}{" "}
                  {category._count.products === 1 ? "produs" : "produse"}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-foreground"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
