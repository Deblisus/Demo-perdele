"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductBulkAction } from "@/lib/admin/product-schema";

const ACTIONS: Array<{ action: ProductBulkAction; label: string }> = [
  { action: "feature", label: "Feature" },
  { action: "unfeature", label: "Unfeature" },
  { action: "out_of_stock", label: "Out of stock" },
  { action: "in_stock", label: "In stock" },
  { action: "on_sale", label: "On sale" },
  { action: "off_sale", label: "Off sale" },
];

/**
 * Appears only when rows are selected, pinned to the bottom of the viewport.
 *
 * Deliberately a bar and not a row of always-visible buttons: bulk actions hit
 * many products at once, and keeping them out of reach until something is
 * actually selected removes the "clicked it with nothing selected" class of
 * mistake entirely.
 */
export function BulkBar({
  ids,
  onClear,
}: {
  ids: string[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ProductBulkAction | null>(null);

  if (ids.length === 0) return null;

  async function apply(action: ProductBulkAction) {
    setPending(action);
    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(payload.error ?? "Bulk action failed.");
        return;
      }
      const label = ACTIONS.find((item) => item.action === action)?.label;
      toast.success(
        `${payload.updated} ${payload.updated === 1 ? "product" : "products"} · ${label?.toLowerCase()}`
      );
      onClear();
      router.refresh();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-4 z-20 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-[var(--rule-strong)] bg-popover px-3 py-2.5 shadow-sm"
    >
      <p className="readout">
        {ids.length} selected
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIONS.map(({ action, label }) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            disabled={pending !== null}
            onClick={() => apply(action)}
          >
            {pending === action ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : null}
            {label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={onClear}
        disabled={pending !== null}
      >
        <X aria-hidden />
        Clear
      </Button>
    </div>
  );
}
