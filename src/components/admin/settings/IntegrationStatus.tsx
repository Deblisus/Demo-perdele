"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CircleCheck, CircleDashed, CircleX, LoaderCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export type IntegrationCard = {
  id: "fanCourier" | "netopia" | "resend";
  name: string;
  purpose: string;
  /** What we can tell from environment variables alone, without a network call. */
  configured: boolean;
  configuredDetail: string;
};

type Probe = { id: string; ok: boolean; detail: string };

/**
 * Configuration state is known instantly; *connection* state requires calling
 * three third parties, so it sits behind a button. Until the probe has run the
 * card says "not checked" rather than implying a healthy connection it has no
 * evidence for.
 */
export function IntegrationStatus({ cards }: { cards: IntegrationCard[] }) {
  const [probes, setProbes] = useState<Record<string, Probe> | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    try {
      const response = await fetch("/api/admin/settings/integrations", {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(payload.error ?? "Could not run the checks.");
        return;
      }
      const next: Record<string, Probe> = {};
      for (const probe of payload.probes as Probe[]) next[probe.id] = probe;
      setProbes(next);

      const failed = (payload.probes as Probe[]).filter((p) => !p.ok).length;
      if (failed === 0) toast.success("All three integrations responded.");
      else
        toast.warning(
          `${failed} of 3 ${failed === 1 ? "integration needs" : "integrations need"} attention.`
        );
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
          These are read from environment variables and cannot be edited here —
          change <code className="machine">.env</code> and restart.
        </p>
        <Button variant="outline" size="sm" onClick={check} disabled={checking}>
          {checking ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <Zap aria-hidden />
          )}
          {checking ? "Checking" : "Test connections"}
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--rule)] lg:grid-cols-3">
        {cards.map((card) => {
          const probe = probes?.[card.id];
          return (
            <li
              key={card.id}
              className="flex flex-col gap-2.5 bg-background px-4 py-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[0.8125rem] font-medium">{card.name}</p>
                <StatusPip
                  state={
                    probe ? (probe.ok ? "ok" : "fail") : card.configured ? "unknown" : "fail"
                  }
                />
              </div>

              <p className="text-[0.75rem] leading-snug text-muted-foreground">
                {card.purpose}
              </p>

              <p className="mt-auto pt-1 text-[0.75rem] leading-relaxed">
                {probe ? probe.detail : card.configuredDetail}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusPip({ state }: { state: "ok" | "fail" | "unknown" }) {
  const spec = {
    ok: {
      label: "Connected",
      color: "var(--st-ok)",
      bg: "var(--st-ok-tint)",
      Icon: CircleCheck,
    },
    fail: {
      label: "Attention",
      color: "var(--st-danger)",
      bg: "var(--st-danger-tint)",
      Icon: CircleX,
    },
    unknown: {
      label: "Not checked",
      color: "var(--st-idle)",
      bg: "var(--st-idle-tint)",
      Icon: CircleDashed,
    },
  }[state];

  const Icon = spec.Icon;

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm px-1.5 py-1 text-[0.6875rem] leading-none font-medium whitespace-nowrap"
      style={{ color: spec.color, background: spec.bg }}
    >
      <Icon className="size-3" aria-hidden />
      {spec.label}
    </span>
  );
}
