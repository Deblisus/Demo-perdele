import { requireAdminPage } from "@/lib/admin/auth";
import { getNavCounts } from "@/lib/admin/metrics";
import { AdminNavSheet, AdminRail } from "@/components/admin/AdminNav";
import { ShopClock } from "@/components/admin/ShopClock";

/**
 * The panel shell: a fixed rail on the left, a thin instrument bar across the
 * top, and the page's own index below it. Nothing floats, nothing is carded —
 * hairlines carry the structure.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminPage();
  const counts = await getNavCounts();

  return (
    <div className="min-h-screen">
      <AdminRail counts={counts} />

      {/* `clip`, never `hidden`: `hidden` would turn this into a scroll
          container and break the sticky instrument bar above. Wide tables
          scroll inside their own `.scroll-x`; the page body never does. */}
      <div className="overflow-x-clip lg:pl-[14.5rem]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--rule)] bg-background/90 px-4 backdrop-blur-sm sm:px-6">
          <AdminNavSheet counts={counts} />
          <span className="text-sm font-semibold tracking-tight lg:hidden">
            PERDELE
          </span>
          <ShopClock className="ml-auto" />
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="border-t border-[var(--rule)] px-4 py-3 sm:px-6">
          <p className="readout">
            Perdele Shop · admin v1 ·{" "}
            {process.env.NODE_ENV === "production" ? "live" : "development"}
          </p>
        </footer>
      </div>
    </div>
  );
}
