/**
 * Shop colour palettes. "gold" is the default and is rendered on <html> by the
 * root layout; "classic" (the Atelier palette) removes the attribute. The
 * visitor's choice lives in localStorage and is re-applied before first paint
 * by PALETTE_INIT_SCRIPT, so a returning "classic" visitor never sees a flash
 * of gold.
 */
export type Palette = "gold" | "classic";

export const DEFAULT_PALETTE: Palette = "gold";
export const PALETTE_STORAGE_KEY = "palette";

export function applyPalette(palette: Palette) {
  const root = document.documentElement;
  if (palette === "gold") root.dataset.palette = "gold";
  else delete root.dataset.palette;
}

export const PALETTE_INIT_SCRIPT = `try{if(localStorage.getItem("${PALETTE_STORAGE_KEY}")==="classic")delete document.documentElement.dataset.palette}catch(e){}`;
