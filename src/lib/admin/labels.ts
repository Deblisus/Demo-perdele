import { TAILORING_OPTIONS } from "@/lib/constants/tailoring";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/validation";

/**
 * Admin chrome is English (CLAUDE.md rule 6) while stored values stay Romanian,
 * so these maps translate only the *labels* the panel draws — never the data.
 *
 * `TAILORING_LABELS` is the one exception that stays Romanian: it names a
 * finishing option the customer chose and the workshop will sew, and those
 * names are what the order form, the invoice and the bench all use.
 */
export const TAILORING_LABELS: Record<string, string> = Object.fromEntries(
  TAILORING_OPTIONS.map((option) => [option.type, option.label])
);

function paymentLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PROCESSING":
      return "Processing";
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

/** Payment-status options for the orders filter, "any" first. */
export const PAYMENT_FILTER_OPTIONS = [
  { value: "all", label: "Any payment" },
  ...PAYMENT_STATUSES.map((status) => ({
    value: status,
    label: paymentLabel(status),
  })),
];

/** Fulfilment stages, phrased as the operator thinks about them. */
export const FULFILMENT_FILTER_OPTIONS = [
  { value: "all", label: "Any stage" },
  { value: "to_pack", label: "To pack" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled / refunded" },
];

/** Every order status, for completeness where a raw value must be rendered. */
export const ORDER_STATUS_VALUES = ORDER_STATUSES;
