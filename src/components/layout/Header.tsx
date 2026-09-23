import Link from "next/link";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileMenu } from "./MobileMenu";
import { CartIcon } from "./CartIcon";
import { HeaderNav } from "./HeaderNav";

/**
 * N6 masthead, adapted for a shop: issue line, centred serif wordmark with the
 * bag button on the right, and the categories on an ink band underneath so
 * they read as navigation, not as part of the paper.
 *
 * Its height is mirrored in `--header-h` (tokens.css) — sticky toolbars below
 * it depend on that value, so change both together.
 */
export function Header() {
  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-40 border-b border-border bg-background lg:border-b-0">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 lg:h-20 lg:px-8">
          <div className="flex items-center">
            <MobileMenu />
            <Link
              href="/produse"
              className="hidden whitespace-nowrap text-sm font-medium underline-offset-4 hover:underline lg:inline"
            >
              Toate produsele
            </Link>
          </div>

          <Link
            href="/"
            className="font-display text-2xl font-medium tracking-tight whitespace-nowrap lg:text-[2rem]"
          >
            Perdele online
          </Link>

          <div className="flex justify-end">
            <CartIcon />
          </div>
        </div>

        <HeaderNav />
      </header>
    </>
  );
}
