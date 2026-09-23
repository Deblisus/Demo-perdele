import { FREE_SHIPPING_THRESHOLD } from "@/lib/validation";
import { SHOP_CONTACT } from "@/lib/constants/catalog";

/**
 * The masthead's issue line: the three facts a curtain buyer checks before
 * anything else, set small above the wordmark.
 */
export function AnnouncementBar() {
  return (
    <div className="shop-announce border-b border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-6 px-4 py-2 text-xs lg:justify-between lg:px-8">
        <p className="whitespace-nowrap">
          Transport gratuit la comenzi peste {FREE_SHIPPING_THRESHOLD} lei
        </p>
        <p className="hidden whitespace-nowrap text-muted-foreground lg:block">
          Confecționare la comandă în 7–8 zile lucrătoare
        </p>
        <a
          href={`tel:${SHOP_CONTACT.phone.replace(/\s/g, "")}`}
          className="hidden whitespace-nowrap underline-offset-4 hover:underline lg:block"
        >
          Comenzi telefonice: {SHOP_CONTACT.phone}
        </a>
      </div>
    </div>
  );
}
