import type { NextRequest } from "next/server";
import { isKnownCounty } from "@/lib/constants/romania";
import { getLocalitiesForCounty } from "@/services/locality.service";

/**
 * Localities for one county, used by the city dropdown in checkout.
 *
 * The Fan Courier credentials stay server-side, so the browser talks to this
 * route instead of the carrier. The response is cacheable: the nomenclator
 * changes at most a few times a year.
 */
export async function GET(request: NextRequest) {
  const county = request.nextUrl.searchParams.get("county");

  if (!county || !isKnownCounty(county)) {
    return Response.json({ message: "Județ invalid" }, { status: 400 });
  }

  try {
    const localities = await getLocalitiesForCounty(county);

    return Response.json(
      { localities },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error(`Failed to load localities for county "${county}":`, error);
    return Response.json(
      { message: "Lista de localități nu este disponibilă momentan" },
      { status: 502 }
    );
  }
}
