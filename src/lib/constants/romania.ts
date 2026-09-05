/**
 * The 42 Romanian counties.
 *
 * `value` is spelled exactly as Fan Courier's nomenclator returns it from
 * `/reports/counties` — plain ASCII, no diacritics ("Arges", "Bistrita-Nasaud",
 * "Bucuresti"). Storing that spelling means the AWB payload matches the
 * carrier's county list without relying on `normalizeAddressField` to repair a
 * hand-typed value. `label` is the correct Romanian spelling shown to the
 * customer.
 *
 * Kept as a static list rather than fetched, because the set of counties is
 * fixed by law and the checkout form must render before any network call.
 * Verified against https://api.fancourier.ro/reports/counties on 2026-09-05.
 */
export interface RomanianCounty {
  /** Fan Courier nomenclator name — the value persisted on the order. */
  value: string;
  /** Display name with Romanian diacritics. */
  label: string;
}

export const ROMANIAN_COUNTIES: readonly RomanianCounty[] = [
  { value: "Alba", label: "Alba" },
  { value: "Arad", label: "Arad" },
  { value: "Arges", label: "Argeș" },
  { value: "Bacau", label: "Bacău" },
  { value: "Bihor", label: "Bihor" },
  { value: "Bistrita-Nasaud", label: "Bistrița-Năsăud" },
  { value: "Botosani", label: "Botoșani" },
  { value: "Braila", label: "Brăila" },
  { value: "Brasov", label: "Brașov" },
  { value: "Bucuresti", label: "București" },
  { value: "Buzau", label: "Buzău" },
  { value: "Calarasi", label: "Călărași" },
  { value: "Caras-Severin", label: "Caraș-Severin" },
  { value: "Cluj", label: "Cluj" },
  { value: "Constanta", label: "Constanța" },
  { value: "Covasna", label: "Covasna" },
  { value: "Dambovita", label: "Dâmbovița" },
  { value: "Dolj", label: "Dolj" },
  { value: "Galati", label: "Galați" },
  { value: "Giurgiu", label: "Giurgiu" },
  { value: "Gorj", label: "Gorj" },
  { value: "Harghita", label: "Harghita" },
  { value: "Hunedoara", label: "Hunedoara" },
  { value: "Ialomita", label: "Ialomița" },
  { value: "Iasi", label: "Iași" },
  { value: "Ilfov", label: "Ilfov" },
  { value: "Maramures", label: "Maramureș" },
  { value: "Mehedinti", label: "Mehedinți" },
  { value: "Mures", label: "Mureș" },
  { value: "Neamt", label: "Neamț" },
  { value: "Olt", label: "Olt" },
  { value: "Prahova", label: "Prahova" },
  { value: "Salaj", label: "Sălaj" },
  { value: "Satu Mare", label: "Satu Mare" },
  { value: "Sibiu", label: "Sibiu" },
  { value: "Suceava", label: "Suceava" },
  { value: "Teleorman", label: "Teleorman" },
  { value: "Timis", label: "Timiș" },
  { value: "Tulcea", label: "Tulcea" },
  { value: "Valcea", label: "Vâlcea" },
  { value: "Vaslui", label: "Vaslui" },
  { value: "Vrancea", label: "Vrancea" },
];

const COUNTY_VALUES = new Set(ROMANIAN_COUNTIES.map((c) => c.value));

/** Whether a county name is one Fan Courier will accept on an AWB. */
export function isKnownCounty(county: string): boolean {
  return COUNTY_VALUES.has(county);
}

/** Display name for a stored county value, falling back to the value itself. */
export function countyLabel(county: string): string {
  return ROMANIAN_COUNTIES.find((c) => c.value === county)?.label ?? county;
}
