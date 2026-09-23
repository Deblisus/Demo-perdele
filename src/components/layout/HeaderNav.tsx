"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SHOP_CATEGORIES } from "@/lib/constants/catalog";

/**
 * The masthead's category row, set on an ink band (h-11 — part of
 * `--header-h`). Current category: full paper colour plus a madder underline.
 */
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Categorii" className="hidden bg-foreground text-background lg:block">
      <ul className="mx-auto flex h-11 max-w-7xl items-stretch justify-center gap-1 px-8">
        {SHOP_CATEGORIES.map((cat) => {
          const active = pathname === cat.href;
          return (
            <li key={cat.href} className="flex">
              <Link
                href={cat.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center whitespace-nowrap px-4 text-sm font-medium transition-colors duration-150 hover:bg-background/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-background",
                  active ? "text-background" : "text-background/80 hover:text-background",
                  active &&
                    "after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:bg-brand-on-ink"
                )}
              >
                {cat.label}
              </Link>
            </li>
          );
        })}
        <li className="flex">
          <Link
            href="/produse?sale=true"
            className="inline-flex items-center whitespace-nowrap px-4 text-sm font-semibold text-brand-on-ink transition-colors duration-150 hover:bg-background/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-background"
          >
            Reduceri
          </Link>
        </li>
      </ul>
    </nav>
  );
}
