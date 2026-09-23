"use client";

import { useMemo, useState } from "react";
import { formatRON } from "@/lib/utils/currency";
import type { RevenueDay } from "@/lib/admin/metrics";
import { cn } from "@/lib/utils";

/**
 * Thirty days of paid revenue, one column per day.
 *
 * Columns rather than an area fill because the data is genuinely discrete —
 * each day is a closed bucket, not a sample of a continuous signal, and an
 * area chart would invent slopes between days that never existed.
 *
 * One series, so no legend: the heading names it. Direct labels are selective —
 * only the best day is annotated; a number over all thirty columns is noise.
 * Empty days are drawn as baseline ticks rather than dropped, so a quiet
 * fortnight stays visibly quiet.
 */
export function RevenueChart({ days }: { days: RevenueDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const { max, total, peakIndex, paidDays } = useMemo(() => {
    let max = 0;
    let total = 0;
    let peakIndex = -1;
    let paidDays = 0;
    days.forEach((day, index) => {
      total += day.revenue;
      if (day.revenue > 0) paidDays += 1;
      if (day.revenue > max) {
        max = day.revenue;
        peakIndex = index;
      }
    });
    return { max, total, peakIndex, paidDays };
  }, [days]);

  const active = hovered !== null ? days[hovered] : null;

  if (days.length === 0) return null;

  const summary =
    max > 0
      ? `Revenue over the last ${days.length} days: ${formatRON(total)} total across ${paidDays} trading days, peaking at ${formatRON(max)} on ${days[peakIndex].label}.`
      : `No paid revenue recorded in the last ${days.length} days.`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <div className="flex items-baseline gap-2.5">
          <span className="machine text-[1.125rem] leading-none">
            {formatRON(total)}
          </span>
          <span className="text-[0.75rem] text-muted-foreground">
            {days.length}-day total · {paidDays} trading{" "}
            {paidDays === 1 ? "day" : "days"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((value) => !value)}
          className="readout rounded-sm px-1.5 py-1 transition-colors hover:bg-secondary hover:text-foreground"
          aria-expanded={asTable}
        >
          {asTable ? "View chart" : "View as table"}
        </button>
      </div>

      {asTable ? (
        <RevenueTable days={days} />
      ) : (
        <>
          <figure className="m-0">
            <div
              className="relative"
              role="img"
              aria-label={summary}
              onPointerLeave={() => setHovered(null)}
            >
              {/* Recessive gridlines. Three is enough to read a magnitude. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[8.75rem]"
              >
                {[0, 0.5, 1].map((fraction) => (
                  <div
                    key={fraction}
                    className="absolute inset-x-0 border-t border-[var(--rule)]"
                    style={{ top: `${fraction * 100}%` }}
                  />
                ))}
              </div>

              <div className="relative flex h-[8.75rem] items-end gap-[2px]">
                {days.map((day, index) => {
                  const ratio = max > 0 ? day.revenue / max : 0;
                  const isPeak = index === peakIndex && max > 0;
                  const isActive = hovered === index;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      // The hit target is the full column height, not the drawn
                      // bar — otherwise a 12 LEI day is a 3px target.
                      className="group relative flex h-full flex-1 cursor-default items-end rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      onPointerEnter={() => setHovered(index)}
                      onFocus={() => setHovered(index)}
                      onBlur={() => setHovered(null)}
                      aria-label={`${day.label}: ${formatRON(day.revenue)}, ${day.orders} ${day.orders === 1 ? "order" : "orders"}`}
                    >
                      <span
                        className={cn(
                          "block w-full rounded-t-[3px] transition-[background-color] duration-150",
                          day.revenue > 0
                            ? isActive || isPeak
                              ? "bg-[var(--primary)]"
                              : "bg-[var(--primary)]/45 group-hover:bg-[var(--primary)]"
                            : "bg-[var(--rule-strong)]"
                        )}
                        style={{
                          height:
                            day.revenue > 0
                              ? `max(3px, ${(ratio * 100).toFixed(2)}%)`
                              : "2px",
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Tooltip. Anchored to the column, clamped so the first and last
                  days don't push it outside the panel. */}
              {active ? (
                <div
                  className="pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md border border-[var(--rule-strong)] bg-popover px-2.5 py-2 shadow-sm"
                  style={{
                    left: `${((hovered! + 0.5) / days.length) * 100}%`,
                    transform: `translate(${
                      hovered! < days.length * 0.15
                        ? "0"
                        : hovered! > days.length * 0.85
                          ? "-100%"
                          : "-50%"
                    }, -100%)`,
                  }}
                >
                  <p className="readout">{active.label}</p>
                  <p className="machine mt-1.5 text-[0.8125rem] leading-none">
                    {formatRON(active.revenue)}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] leading-none text-muted-foreground">
                    {active.orders} {active.orders === 1 ? "order" : "orders"}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--rule-strong)] pt-2">
              <span className="readout">{days[0].label}</span>
              {max > 0 ? (
                <span className="readout">
                  peak {formatRON(max)} · {days[peakIndex].label}
                </span>
              ) : null}
              <span className="readout">{days[days.length - 1].label}</span>
            </div>
          </figure>
        </>
      )}
    </div>
  );
}

function RevenueTable({ days }: { days: RevenueDay[] }) {
  const rows = days.filter((day) => day.revenue > 0);
  return (
    <div className="scroll-x max-h-[12rem] overflow-y-auto">
      <table className="ledger">
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Orders</th>
            <th scope="col" className="text-right!">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-[0.8125rem] text-muted-foreground">
                No paid revenue in this window.
              </td>
            </tr>
          ) : (
            rows.map((day) => (
              <tr key={day.key}>
                <td className="text-[0.8125rem]">{day.label}</td>
                <td className="machine text-[0.8125rem]">{day.orders}</td>
                <td className="machine text-right text-[0.8125rem]">
                  {formatRON(day.revenue)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
