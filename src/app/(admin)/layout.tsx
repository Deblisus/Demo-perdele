import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perdele Shop · Admin",
  robots: { index: false, follow: false },
};

/**
 * The admin token boundary.
 *
 * `.admin-scope` (src/app/admin.css) redefines the raw CSS variables that
 * globals.css maps its Tailwind theme onto, so every shadcn primitive rendered
 * below this point picks up the cool instrument-panel palette without a single
 * forked component. The storefront's tokens are untouched.
 *
 * Caveat worth remembering: Sheet / Dialog / DropdownMenu render through a
 * portal attached to <body>, which is *outside* this subtree — so those
 * surfaces carry `admin-scope` on their own content element.
 */
export default function AdminScopeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-scope min-h-screen">{children}</div>;
}
