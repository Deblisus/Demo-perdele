import { revalidatePath } from "next/cache";

/**
 * Push a catalog change out to the storefront.
 *
 * Product and category pages are rendered from the same rows the panel edits,
 * so without this an edit lands in the database and the shop keeps serving the
 * old copy until something else happens to invalidate it. `layout` scope covers
 * the dynamic segments (`/produse/[slug]`, `/categorie/[slug]`) in one call.
 */
export function revalidateStorefront(): void {
  revalidatePath("/", "layout");
}
