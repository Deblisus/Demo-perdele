/**
 * Fan Courier matches `county` and `locality` against its own nomenclator,
 * which stores plain ASCII names ("Bucuresti", "Arges", "Bistrita-Nasaud").
 *
 * The checkout form captures these as free text, so a customer who types the
 * correct Romanian spelling ("București", "Argeș") would have their AWB
 * rejected with `recipient.address.county: The selected ... is invalid.`
 * Stripping diacritics before building the payload keeps both spellings working.
 *
 * NFD decomposition covers every Romanian diacritic, including both the
 * comma-below (ș U+0219, ț U+021B) and the legacy cedilla (ş U+015F, ţ U+0163)
 * encodings, since each decomposes to a base letter plus a combining mark.
 */
const COMBINING_MARKS = /[̀-ͯ]/g;

/** Remove diacritics and collapse whitespace for Fan Courier address fields. */
export function normalizeAddressField(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate to the field limit documented for /intern-awb, after normalizing.
 * Fan Courier rejects over-long values outright rather than trimming them.
 */
export function normalizeAddressFieldMax(value: string, maxLength: number): string {
  return normalizeAddressField(value).slice(0, maxLength);
}
