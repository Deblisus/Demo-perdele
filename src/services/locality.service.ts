import { fanCourierClient } from "@/lib/integrations/fan-courier";

/**
 * Localities are read from Fan Courier's nomenclator so the value the customer
 * picks at checkout is guaranteed to be one the carrier accepts on an AWB.
 *
 * The list is large (a county can hold several hundred localities) but changes
 * very rarely, so each county is cached in the server process for a day.
 * Concurrent requests for the same county share one in-flight fetch instead of
 * each hitting the carrier.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  localities: string[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string[]>>();

async function fetchLocalities(county: string): Promise<string[]> {
  const localities = await fanCourierClient.getLocalities(county);

  // The nomenclator lists one row per agency, so the same locality can appear
  // more than once; the form only needs distinct names.
  const names = Array.from(new Set(localities.map((l) => l.name.trim()).filter(Boolean)));

  return names.sort((a, b) => a.localeCompare(b, "ro"));
}

/** Distinct locality names for a county, sorted for display. */
export async function getLocalitiesForCounty(county: string): Promise<string[]> {
  const cached = cache.get(county);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.localities;
  }

  const pending = inFlight.get(county);
  if (pending) {
    return pending;
  }

  const request = fetchLocalities(county)
    .then((localities) => {
      cache.set(county, { localities, expiresAt: Date.now() + CACHE_TTL_MS });
      return localities;
    })
    .finally(() => {
      inFlight.delete(county);
    });

  inFlight.set(county, request);
  return request;
}
