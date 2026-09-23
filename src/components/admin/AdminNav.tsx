"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  FolderTree,
  Gauge,
  Menu,
  Package,
  Receipt,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutButton } from "./SignOutButton";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Gauge;
  /** Number of rows waiting on the operator, e.g. unshipped paid orders. */
  badge?: number;
};

type NavGroup = { label: string; items: NavItem[] };

export type AdminNavCounts = {
  pendingOrders: number;
  lowStock: number;
};

function buildGroups(counts: AdminNavCounts): NavGroup[] {
  return [
    {
      label: "Operations",
      items: [
        { href: "/admin", label: "Overview", icon: Gauge },
        {
          href: "/admin/orders",
          label: "Orders",
          icon: Receipt,
          badge: counts.pendingOrders,
        },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          href: "/admin/products",
          label: "Products",
          icon: Package,
          badge: counts.lowStock,
        },
        { href: "/admin/categories", label: "Categories", icon: FolderTree },
      ],
    },
    {
      label: "System",
      items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
    },
  ];
}

/** `/admin` must only light up on an exact match, or it stays active everywhere. */
function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavList({
  counts,
  onNavigate,
}: {
  counts: AdminNavCounts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3.5" aria-label="Admin sections">
      {buildGroups(counts).map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="readout px-2.5 pb-1">{group.label}</p>
          <ul className="flex flex-col gap-px">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rail-item flex h-8 items-center gap-2.5 rounded-md px-2.5",
                      "text-[0.8125rem] transition-colors",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-current"
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span
                        className="machine ml-auto rounded-sm bg-[var(--st-warn-tint)] px-1.5 py-px text-[0.6875rem] leading-[1.4] text-[var(--st-warn-ink)]"
                        title={`${item.badge} need attention`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function RailFooter() {
  return (
    <div className="mt-auto flex flex-col gap-1 border-t border-[var(--rule)] px-3.5 pt-3">
      <Link
        href="/"
        className="flex h-8 items-center gap-2 rounded-md px-2.5 text-[0.8125rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowUpRight className="size-4 shrink-0" aria-hidden />
        <span className="truncate">View storefront</span>
      </Link>
      <SignOutButton />
    </div>
  );
}

function Wordmark() {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold tracking-tight">PERDELE</span>
      <span className="readout">Admin</span>
    </div>
  );
}

/** Fixed rail — the panel's spine on ≥1024px. */
export function AdminRail({ counts }: { counts: AdminNavCounts }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[14.5rem] flex-col border-r border-[var(--rule)] bg-background pb-3.5 lg:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-[var(--rule)] px-5">
        <Wordmark />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavList counts={counts} />
      </div>
      <RailFooter />
    </aside>
  );
}

/** Below 1024px the rail becomes a sheet behind a single menu button. */
export function AdminNavSheet({ counts }: { counts: AdminNavCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close on navigation — a sheet left open over the new page is the classic
  // mobile-nav bug. Adjusted during render rather than in an effect so the
  // sheet never paints once in its open state over the page it just left.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open admin menu"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
      >
        <Menu className="size-[1.125rem]" aria-hidden />
      </SheetTrigger>
      {/* The portal escapes `.admin-scope`, so the class is re-applied here. */}
      <SheetContent
        side="left"
        className="admin-scope flex w-[16rem] flex-col gap-0 p-0"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--rule)] px-5">
          <SheetTitle className="p-0">
            <Wordmark />
          </SheetTitle>
          <SheetClose
            aria-label="Close menu"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavList counts={counts} onNavigate={() => setOpen(false)} />
        </div>
        <div className="pb-3.5">
          <RailFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}
