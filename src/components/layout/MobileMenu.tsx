"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SHOP_CATEGORIES, SHOP_CONTACT } from "@/lib/constants/catalog";

const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Toate produsele" },
  ...SHOP_CATEGORIES,
  { href: "/produse?sale=true", label: "Reduceri" },
];

export function MobileMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        className="-ml-2 inline-flex size-10 items-center justify-center rounded-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        aria-label="Deschide meniul"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[min(20rem,85vw)] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-2xl font-medium tracking-tight">
            Perdele online
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Meniu" className="flex-1 overflow-y-auto">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-border">
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={cn(
                        "block whitespace-nowrap px-5 py-3.5 text-[0.95rem] hover:bg-muted",
                        pathname === link.href && "font-semibold",
                        link.href.includes("sale") && "text-brand"
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-border bg-secondary px-5 py-4 text-sm text-muted-foreground">
          <p>Comenzi telefonice</p>
          <p className="tnum text-foreground">{SHOP_CONTACT.phone}</p>
          <p>{SHOP_CONTACT.email}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
