import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1 - Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight">PERDELE SHOP</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Magazin online de perdele și draperii premium. Confecționare la comandă pe dimensiunile dvs.
            </p>
          </div>

          {/* Col 2 - Categorii */}
          <div className="space-y-4">
            <h4 className="font-semibold">Categorii</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/produse" className="hover:text-white transition-colors">Toate Produsele</Link></li>
              <li><Link href="/categorie/draperii-catifea" className="hover:text-white transition-colors">Draperii Catifea</Link></li>
              <li><Link href="/categorie/draperii-blackout" className="hover:text-white transition-colors">Draperii Blackout</Link></li>
              <li><Link href="/categorie/perdele-voal" className="hover:text-white transition-colors">Perdele Voal</Link></li>
              <li><Link href="/categorie/perdele-in" className="hover:text-white transition-colors">Perdele In</Link></li>
              <li><Link href="/categorie/accesorii" className="hover:text-white transition-colors">Accesorii</Link></li>
            </ul>
          </div>

          {/* Col 3 - Informații */}
          <div className="space-y-4">
            <h4 className="font-semibold">Informații</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="#" className="hover:text-white transition-colors">Despre Noi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Termeni și Condiții</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Politica de Retur</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">GDPR</Link></li>
            </ul>
          </div>

          {/* Col 4 - Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>0770 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>contact@perdeleshop.ro</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>București, România</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2026 Perdele Shop. Toate drepturile rezervate.</p>
          <p>Plăți securizate prin Netopia</p>
        </div>
      </div>
    </footer>
  );
}
