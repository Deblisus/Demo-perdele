import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBar } from '@/components/landing/TrustBar';
import { CategoryShowcase } from '@/components/landing/CategoryShowcase';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PromoBanner } from '@/components/landing/PromoBanner';
import { getCategories, getFeaturedProducts } from '@/lib/queries/products';

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryShowcase categories={categories as any} />
      <FeaturedProducts products={featuredProducts} />
      <HowItWorks />
      <PromoBanner />
    </>
  );
}
