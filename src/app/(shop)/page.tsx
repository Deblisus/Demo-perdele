import { HeroSection } from '@/components/landing/HeroSection';
import { CategoryShowcase } from '@/components/landing/CategoryShowcase';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { MeasureGuide } from '@/components/landing/MeasureGuide';
import { getCategories, getFeaturedProducts } from '@/lib/queries/products';

// TrustBar, HowItWorks and PromoBanner are no longer mounted: their facts now
// live in the hero's fact row, the masthead line and MeasureGuide.
export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <>
      <HeroSection />
      <CategoryShowcase categories={categories as any} />
      <FeaturedProducts products={featuredProducts} />
      <MeasureGuide />
    </>
  );
}
