"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SHOP_TIME_ZONE } from "@/lib/admin/time";

const FORMAT = new Intl.DateTimeFormat("ro-RO", {
  timeZone: SHOP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Shop-local wall clock in the instrument bar.
 *
 * Rendered empty on the server and filled after mount: the server's clock and
 * the operator's clock are never the same to the minute, and a hydration
 * mismatch on the very first paint of every admin page is not worth the
 * timestamp. Ticks on the minute, not the second — nothing here is a stopwatch.
 */
export function ShopClock({ className }: { className?: string }) {
  const [stamp, setStamp] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setStamp(FORMAT.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      className={cn("readout tabular-nums", className)}
      suppressHydrationWarning
    >
      {stamp ?? " "}
    </span>
  );
}
