/**
 * Shop navigation and display labels shared by the header, footer, catalogue
 * toolbar and product page.
 */

export const SHOP_CATEGORIES = [
  { href: "/categorie/draperii-catifea", label: "Draperii catifea" },
  { href: "/categorie/draperii-blackout", label: "Draperii blackout" },
  { href: "/categorie/perdele-voal", label: "Perdele voal" },
  { href: "/categorie/perdele-in", label: "Perdele in" },
  { href: "/categorie/accesorii", label: "Accesorii" },
] as const;

export const OPACITY_LABELS: Record<string, string> = {
  blackout: "Blackout",
  "semi-opac": "Semi-opac",
  transparent: "Transparent",
};

/** Placeholder contact details — confirm before launch. */
export const SHOP_CONTACT = {
  phone: "0770 123 456",
  email: "contact@perdeleshop.ro",
  city: "București, România",
} as const;
