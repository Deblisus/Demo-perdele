import { requireAdminApi } from "@/lib/admin/auth";
import { fanCourierClient } from "@/lib/integrations/fan-courier";

/**
 * Live integration probe.
 *
 * Deliberately behind a button rather than run on page load: each check is a
 * real network call to a third party, and a settings page that takes four
 * seconds to paint because Fan Courier is slow is worse than one that shows
 * configuration state instantly and verifies on demand.
 *
 * Every probe is read-only — nothing here creates an AWB, a payment or an email.
 */

type Probe = {
  id: "fanCourier" | "netopia" | "resend";
  ok: boolean;
  detail: string;
};

export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const [fanCourier, netopia, resend] = await Promise.all([
    probeFanCourier(),
    Promise.resolve(probeNetopia()),
    probeResend(),
  ]);

  return Response.json(
    { probes: [fanCourier, netopia, resend] satisfies Probe[] },
    { headers: { "cache-control": "no-store" } }
  );
}

async function probeFanCourier(): Promise<Probe> {
  if (!process.env.FAN_COURIER_CLIENT_ID || !process.env.FAN_COURIER_USERNAME) {
    return {
      id: "fanCourier",
      ok: false,
      detail: "FAN_COURIER_CLIENT_ID / FAN_COURIER_USERNAME are not set.",
    };
  }
  try {
    // getCounties() authenticates and reads the nomenclator — the cheapest call
    // that proves the credentials actually work.
    const counties = await fanCourierClient.getCounties();
    return {
      id: "fanCourier",
      ok: true,
      detail: `Authenticated · ${counties.length} counties in the nomenclator.`,
    };
  } catch (error) {
    return {
      id: "fanCourier",
      ok: false,
      detail: error instanceof Error ? error.message : "Authentication failed.",
    };
  }
}

function probeNetopia(): Probe {
  const live = process.env.NETOPIA_IS_LIVE === "true";
  const hasKeys = Boolean(
    process.env.NETOPIA_API_KEY && process.env.NETOPIA_POS_SIGNATURE
  );
  const hasPublicKey = Boolean(process.env.NETOPIA_PUBLIC_KEY);

  if (!hasKeys) {
    return {
      id: "netopia",
      ok: false,
      detail: "NETOPIA_API_KEY / NETOPIA_POS_SIGNATURE are not set.",
    };
  }
  if (!hasPublicKey) {
    return {
      id: "netopia",
      ok: false,
      detail:
        "Keys present, but NETOPIA_PUBLIC_KEY is missing — IPN callbacks cannot be verified.",
    };
  }
  return {
    id: "netopia",
    ok: true,
    detail: live
      ? "Live mode. Real cards will be charged."
      : "Sandbox mode. No real money moves.",
  };
}

async function probeResend(): Promise<Probe> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return {
      id: "resend",
      ok: false,
      detail: "RESEND_API_KEY is not set — no email is delivered at all.",
    };
  }

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    return {
      id: "resend",
      ok: false,
      detail:
        "No RESEND_FROM_EMAIL — sending falls back to Resend's sandbox sender, which only delivers to the account owner.",
    };
  }

  const domain = from.match(/@([^\s>]+)/)?.[1]?.toLowerCase();

  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { authorization: `Bearer ${key}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        id: "resend",
        ok: false,
        detail: `Resend rejected the API key (HTTP ${response.status}).`,
      };
    }

    const body = (await response.json()) as {
      data?: Array<{ name: string; status: string }>;
    };
    const match = body.data?.find(
      (item) => item.name.toLowerCase() === domain
    );

    if (!match) {
      return {
        id: "resend",
        ok: false,
        detail: `Key is valid, but ${domain} is not a domain on this Resend account.`,
      };
    }
    if (match.status !== "verified") {
      return {
        id: "resend",
        ok: false,
        detail: `${domain} is registered but ${match.status} — mail will not be delivered until it verifies.`,
      };
    }
    return {
      id: "resend",
      ok: true,
      detail: `Sending as ${from} · ${domain} verified.`,
    };
  } catch (error) {
    return {
      id: "resend",
      ok: false,
      detail: error instanceof Error ? error.message : "Could not reach Resend.",
    };
  }
}
