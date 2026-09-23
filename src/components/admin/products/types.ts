export type CategoryOption = { id: string; name: string; slug: string };

export type ProductRowView = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string;
  categoryName: string;
  pricePerUnit: number;
  originalPrice: number | null;
  pricingUnit: string;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
};
