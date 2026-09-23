import Image from "next/image";
import Link from "next/link";

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
 * The collections as tall cards: the photo and the name, nothing else.
 * Five across on desktop; a swipeable row on smaller screens so five cards
 * never leave an orphan in a 2- or 3-column grid.
 */
export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-foreground pb-4">
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

      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {categories.map((category) => (
          <li
            key={category.slug}
            className="w-[42vw] max-w-[13rem] shrink-0 snap-start sm:w-[28vw] lg:w-auto lg:max-w-none"
          >
            <Link
              href={`/categorie/${category.slug}`}
              className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 20vw"
                    className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                  />
                )}
              </div>
              <h3 className="mt-3 font-display text-xl font-medium tracking-tight decoration-1 underline-offset-4 group-hover:underline">
                {category.name}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
