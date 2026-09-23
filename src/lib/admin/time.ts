/**
 * Day bucketing for the shop's own clock.
 *
 * "Revenue today" has to mean today in Bucharest, not today in whatever zone
 * the server happens to run in — otherwise the figure jumps by a day's takings
 * every evening once the app is deployed to a UTC host. Everything here works
 * in `Europe/Bucharest` regardless of the process timezone.
 */

export const SHOP_TIME_ZONE = "Europe/Bucharest";

const DAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_LABEL = new Intl.DateTimeFormat("ro-RO", {
  timeZone: SHOP_TIME_ZONE,
  day: "numeric",
  month: "short",
});

const DATE_TIME_LABEL = new Intl.DateTimeFormat("ro-RO", {
  timeZone: SHOP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_LABEL = new Intl.DateTimeFormat("ro-RO", {
  timeZone: SHOP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** `2026-09-22` in shop time — sortable and safe as an object key. */
export function dayKey(date: Date): string {
  return DAY_KEY.format(date);
}

/** `22 sept.` — the chart's axis label. */
export function dayLabel(date: Date): string {
  return DAY_LABEL.format(date);
}

/** `22.09.2026, 14:02` — table and timeline stamps. */
export function dateTimeLabel(date: Date): string {
  return DATE_TIME_LABEL.format(date);
}

/** `22.09.2026` */
export function dateLabel(date: Date): string {
  return DATE_LABEL.format(date);
}

/**
 * The UTC instant at which the given shop-local day begins.
 *
 * Found by reading the zone's offset at that moment and subtracting it, then
 * re-reading once — the second pass is what makes the two DST switchovers a
 * year come out right instead of an hour off.
 */
export function startOfShopDay(date: Date, dayOffset = 0): Date {
  const key = dayKey(new Date(date.getTime() + dayOffset * 86_400_000));
  const [year, month, day] = key.split("-").map(Number);

  let guess = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  for (let pass = 0; pass < 2; pass++) {
    guess -= zoneOffsetMs(new Date(guess));
    const check = dayKey(new Date(guess));
    if (check === key) break;
  }
  return new Date(guess);
}

/** Offset of `Europe/Bucharest` from UTC, in milliseconds, at a given instant. */
function zoneOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return asUtc - at.getTime();
}

/** First instant of the current shop month. */
export function startOfShopMonth(now = new Date()): Date {
  const [year, month] = dayKey(now).split("-").map(Number);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1, 12));
  return startOfShopDay(firstOfMonth);
}

/** The last `count` shop days, oldest first, as `{ key, label, start }`. */
export function recentShopDays(
  count: number,
  now = new Date()
): Array<{ key: string; label: string; start: Date }> {
  const days: Array<{ key: string; label: string; start: Date }> = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const start = startOfShopDay(now, -offset);
    days.push({ key: dayKey(start), label: dayLabel(start), start });
  }
  return days;
}
