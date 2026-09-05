import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { TrustSignals } from "@/components/product/TrustSignals";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";

// ── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produs negăsit | Perdele Shop" };
  }

  return {
    title: `${product.name} | Perdele Shop`,
    description:
      product.shortDescription ??
      product.description?.slice(0, 160) ??
      `Cumpără ${product.name} de la Perdele Shop`,
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

  // Opacity-related labels for display
  const opacityLabels: Record<string, string> = {
    blackout: "Blackout (opac 100%)",
    "semi-opac": "Semi-opac",
    transparent: "Transparent",
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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumbs */}
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

      {/* Product main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-6">
        {/* Left: Image Gallery */}
        <ProductGallery
          images={product.images}
          productName={product.name}
        />

        {/* Right: Product Info + Configurator */}
        <div className="space-y-6">
          {/* Product name & category */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-muted-foreground mt-2">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Configurator (with pricing + add to cart) */}
          <ProductConfigurator product={product} />

          {/* Trust signals */}
          <TrustSignals hasTailoring={false} />
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mt-12 lg:mt-16">
        <div className="border-b">
          <div className="flex gap-8">
            <button className="pb-3 border-b-2 border-primary text-sm font-medium">
              Descriere
            </button>
            <button className="pb-3 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground transition-colors">
              Specificații
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="py-6">
          {product.description ? (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nu există o descriere detaliată pentru acest produs.
            </p>
          )}

          {/* Specs table */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Specificații Tehnice</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((spec, i) => (
                      <tr
                        key={spec.label}
                        className={i % 2 === 0 ? "bg-muted/50" : "bg-background"}
                      >
                        <td className="px-4 py-3 font-medium text-muted-foreground w-1/3">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
