import type { TailoringType } from "@/lib/validation";

export interface TailoringOption {
  type: TailoringType;
  label: string;
  description: string;
  pricePerUnit: number;
  icon: string; // lucide-react icon name
}

/**
 * Available tailoring options for curtain products.
 * Pricing is per linear meter (LEI/ml) or per piece (LEI/buc).
 */
export const TAILORING_OPTIONS: readonly TailoringOption[] = [
  {
    type: "none",
    label: "Fără manoperă",
    description: "Doar material tăiat la dimensiune",
    pricePerUnit: 0,
    icon: "scissors",
  },
  {
    type: "rejansa_6cm",
    label: "Rejansă standard 6cm",
    description: "Bandă de rejansă cusută pentru agățare pe galerie cu cârlige",
    pricePerUnit: 10,
    icon: "ruler",
  },
  {
    type: "rejansa_bara",
    label: "Rejansă pentru bară",
    description: "Rejansă specială pentru montare directă pe bară/galerie",
    pricePerUnit: 15,
    icon: "grip-horizontal",
  },
  {
    type: "capse",
    label: "Capse metalice",
    description: "Inele metalice pentru montare pe bară – aspect modern și elegant",
    pricePerUnit: 30,
    icon: "circle-dot",
  },
] as const;

/**
 * Get tailoring option by type.
 */
export function getTailoringOption(type: TailoringType): TailoringOption {
  const option = TAILORING_OPTIONS.find((o) => o.type === type);
  if (!option) {
    throw new Error(`Unknown tailoring type: ${type}`);
  }
  return option;
}

/**
 * Get the tailoring label for display purposes.
 */
export function getTailoringLabel(type: TailoringType): string {
  return getTailoringOption(type).label;
}
