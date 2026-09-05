"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Toate Produsele" },
  { href: "/categorie/draperii-catifea", label: "Draperii Catifea" },
  { href: "/categorie/draperii-blackout", label: "Draperii Blackout" },
  { href: "/categorie/perdele-voal", label: "Perdele Voal" },
  { href: "/categorie/perdele-in", label: "Perdele In" },
  { href: "/categorie/accesorii", label: "Accesorii" },
];

export function MobileMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden" aria-label="Deschide meniul">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold tracking-tight">
            PERDELE SHOP
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 py-6 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <SheetClose key={link.href} className="text-left">
              <Link
                href={link.href}
                className={cn(
                  "block px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
          
          <div className="mt-auto">
            <Separator className="my-4" />
            <div className="px-4 text-sm text-muted-foreground space-y-2">
              <p>📞 0770 123 456</p>
              <p>✉️ contact@perdeleshop.ro</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
