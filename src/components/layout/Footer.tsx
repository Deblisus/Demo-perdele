import Link from "next/link";
import { SHOP_CATEGORIES, SHOP_CONTACT } from "@/lib/constants/catalog";

const INFO_LINKS = [
  { href: "#", label: "Despre noi" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Livrare" },
  { href: "#", label: "Politica de retur" },
  { href: "#", label: "Termeni și condiții" },
  { href: "#", label: "GDPR" },
];

/**
 * Ft1 mast-headed footer: wordmark and contact in one band, the index of
 * collections and the legal line underneath. No column grid of links.
 */
export function Footer() {
  return (
    <footer className="shop-footer mt-24 border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="font-display text-3xl font-medium tracking-tight">
              Perdele online
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Perdele și draperii tăiate și cusute la comandă, pe dimensiunile
              ferestrei tale.
            </p>
          </div>

          <address className="text-sm not-italic leading-relaxed md:text-right">
            <a
              href={`tel:${SHOP_CONTACT.phone.replace(/\s/g, "")}`}
              className="tnum block underline-offset-4 hover:underline"
            >
              {SHOP_CONTACT.phone}
            </a>
            <span className="block">{SHOP_CONTACT.email}</span>
            <span className="block text-muted-foreground">{SHOP_CONTACT.city}</span>
          </address>
        </div>

        <nav
          aria-label="Colecții"
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border py-5 text-sm"
        >
          <Link href="/produse" className="whitespace-nowrap font-medium underline-offset-4 hover:underline">
            Toate produsele
          </Link>
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="whitespace-nowrap underline-offset-4 hover:underline"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <nav aria-label="Informații" className="flex flex-wrap gap-x-5 gap-y-2">
            {INFO_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="whitespace-nowrap">
            © {new Date().getFullYear()} Perdele online · Plăți prin Netopia
          </p>
        </div>
      </div>
    </footer>
  );
}
