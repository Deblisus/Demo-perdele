import Link from "next/link";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileMenu } from "./MobileMenu";
import { CartIcon } from "./CartIcon";

const CATEGORIES = [
  { href: "/categorie/draperii-catifea", label: "Draperii Catifea" },
  { href: "/categorie/draperii-blackout", label: "Draperii Blackout" },
  { href: "/categorie/perdele-voal", label: "Perdele Voal" },
  { href: "/categorie/perdele-in", label: "Perdele In" },
  { href: "/categorie/accesorii", label: "Accesorii" },
];

export function Header() {
  return (
    <header>
      <AnnouncementBar />
      
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <MobileMenu />
            <Link href="/" className="text-xl font-bold tracking-tight">
              PERDELE SHOP
            </Link>
          </div>

          {/* CENTER */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/produse"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Toate Produsele
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center">
            <CartIcon />
          </div>

        </div>
      </div>
    </header>
  );
}
