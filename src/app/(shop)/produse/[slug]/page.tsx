import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { TrustSignals } from "@/components/product/TrustSignals";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { OPACITY_LABELS } from "@/lib/constants/catalog";

// ── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produs negăsit | Perdele online" };
  }

  return {
    title: `${product.name} | Perdele online`,
    description:
      product.shortDescription ??
      product.description?.slice(0, 160) ??
      `Cumpără ${product.name} de la Perdele online`,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url
        ? [{ url: product.images[0].url, alt: product.name }]
        : undefined,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    6
  );

  const opacityLabels: Record<string, string> = {
    ...OPACITY_LABELS,
    blackout: "Blackout (opac 100%)",
  };

  // Specifications table data
  const specs: { label: string; value: string }[] = [
    ...(product.fabricType
      ? [
          {
            label: "Tip material",
            value:
              product.fabricType.charAt(0).toUpperCase() +
              product.fabricType.slice(1),
          },
        ]
      : []),
    ...(product.composition
      ? [{ label: "Compoziție", value: product.composition }]
      : []),
    ...(product.opacity
      ? [
          {
            label: "Opacitate",
            value: opacityLabels[product.opacity] ?? product.opacity,
          },
        ]
      : []),
    ...(product.weightGsm
      ? [{ label: "Greutate", value: `${product.weightGsm} g/m²` }]
      : []),
    ...(product.pattern
      ? [
          {
            label: "Model",
            value:
              product.pattern.charAt(0).toUpperCase() +
              product.pattern.slice(1),
          },
        ]
      : []),
    {
      label: "Înălțime disponibilă",
      value: `${product.minHeightCm} – ${product.maxHeightCm} cm`,
    },
    {
      label: "Cantitate minimă",
      value:
        product.pricingUnit === "ml"
          ? `${product.minQuantity} ml`
          : `${product.minQuantity} buc`,
    },
    ...(product.sku ? [{ label: "SKU", value: product.sku }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-8 lg:pt-8">
      <Breadcrumbs
        items={[
          { label: "Produse", href: "/produse" },
          {
            label: product.category.name,
            href: `/categorie/${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Gallery stays in view while the configurator scrolls. */}
        <div className="min-w-0 lg:col-span-7">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <ProductGallery images={product.images} productName={product.name} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <Link
            href={`/categorie/${product.category.slug}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight [overflow-wrap:anywhere] lg:text-[2.5rem]">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-8">
            <ProductConfigurator product={product} />
          </div>

          <TrustSignals className="mt-8" />
        </div>
      </div>

      {/* Description and specs side by side — both always visible. */}
      <div className="mt-20 grid gap-12 border-t border-foreground pt-10 lg:grid-cols-12">
        <section className="min-w-0 lg:col-span-7">
          <h2 className="font-display text-2xl font-medium tracking-tight">Descriere</h2>
          <p className="mt-4 max-w-[65ch] leading-relaxed text-muted-foreground">
            {product.description || "Nu există o descriere detaliată pentru acest produs."}
          </p>
        </section>

        {specs.length > 0 && (
          <section className="min-w-0 lg:col-span-5">
            <h2 className="font-display text-2xl font-medium tracking-tight">Specificații</h2>
            <dl className="mt-4 border-t border-border text-sm">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-4 border-b border-border py-3"
                >
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="tnum">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts
          products={relatedProducts}
          title={`Tot din ${product.category.name.toLowerCase()}`}
          className="mt-20"
        />
      )}
    </div>
  );
}
