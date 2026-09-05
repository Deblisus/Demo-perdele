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

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold">Explorează Colecțiile Noastre</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.slug}
              href={`/categorie/${category.slug}`}
              className="group relative block aspect-[4/5] rounded-xl overflow-hidden bg-muted"
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-muted-foreground">Fără imagine</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-4 lg:p-6 w-full">
                <h3 className="text-white font-bold text-lg lg:text-xl">{category.name}</h3>
                <p className="text-white/80 text-sm mt-1">
                  {category._count.products} {category._count.products === 1 ? 'produs' : 'produse'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
