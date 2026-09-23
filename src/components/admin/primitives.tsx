import * as React from "react";
import {
  CircleCheck,
  CircleDashed,
  CircleDotDashed,
  CircleX,
  Clock,
  PackageCheck,
  PackageOpen,
  Truck,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRON } from "@/lib/utils/currency";

/* ── Page head ─────────────────────────────────────────────────────────
   Index-First: a readout label, a short sentence saying what the index
   below contains, and a hairline. No display type, no hero. */

export function PageHead({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-[var(--rule-strong)] pb-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="readout">{eyebrow}</p>
          <h1 className="mt-2 text-[1.0625rem] font-semibold tracking-tight">
            {title}
          </h1>
          {lede ? (
            <p className="mt-1.5 max-w-[60ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
              {lede}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Figures ───────────────────────────────────────────────────────────
   Not cards. A label, a number, a hairline, a qualifier — the four lines
   of a gauge. They sit in a row divided by rules, so the group reads as
   one instrument rather than four floating tiles. */

export function FigureRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 xl:grid-cols-5">
      {children}
    </div>
  );
}

export function Figure({
  label,
  value,
  qualifier,
  tone = "neutral",
  emphasis = false,
}: {
  label: string;
  value: string;
  qualifier?: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger";
  emphasis?: boolean;
}) {
  const toneVar =
    tone === "ok"
      ? "var(--st-ok)"
      : tone === "warn"
        ? "var(--st-warn-ink)"
        : tone === "danger"
          ? "var(--st-danger)"
          : undefined;

  return (
    <div className="flex flex-col gap-2 bg-background px-4 py-3.5">
      <p className="readout">{label}</p>
      <p
        className={cn(
          "machine leading-none",
          emphasis ? "text-[1.375rem] font-medium" : "text-[1.25rem]"
        )}
        style={toneVar ? { color: toneVar } : undefined}
      >
        {value}
      </p>
      {qualifier ? (
        <p className="text-[0.75rem] leading-snug text-muted-foreground">
          {qualifier}
        </p>
      ) : null}
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────── */

export function Section({
  label,
  description,
  actions,
  children,
  className,
}: {
  label: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <div className="min-w-0">
          <h2 className="readout">{label}</h2>
          {description ? (
            <p className="mt-1.5 text-[0.75rem] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

/* ── Money ─────────────────────────────────────────────────────────── */

export function Money({
  value,
  className,
  muted = false,
}: {
  value: number;
  className?: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn("machine", muted && "text-muted-foreground", className)}
    >
      {formatRON(value)}
    </span>
  );
}

/* ── Status ────────────────────────────────────────────────────────────
   The validator flagged that amber sits at 2.38:1 on this paper and that
   red↔green land in the CVD floor band. Relief, per the skill's rule: every
   chip carries an icon *and* a word, so colour is only ever the third cue. */

type Tone = "ok" | "warn" | "danger" | "info" | "refund" | "idle";

const TONE_STYLE: Record<Tone, { fg: string; bg: string }> = {
  ok: { fg: "var(--st-ok)", bg: "var(--st-ok-tint)" },
  warn: { fg: "var(--st-warn-ink)", bg: "var(--st-warn-tint)" },
  danger: { fg: "var(--st-danger)", bg: "var(--st-danger-tint)" },
  info: { fg: "var(--st-info)", bg: "var(--st-info-tint)" },
  refund: { fg: "var(--st-refund)", bg: "var(--st-refund-tint)" },
  idle: { fg: "var(--st-idle)", bg: "var(--st-idle-tint)" },
};

type ChipSpec = { label: string; tone: Tone; icon: typeof CircleCheck };

const PAYMENT_SPEC: Record<string, ChipSpec> = {
  PAID: { label: "Paid", tone: "ok", icon: CircleCheck },
  PENDING: { label: "Pending", tone: "warn", icon: Clock },
  PROCESSING: { label: "Processing", tone: "info", icon: CircleDotDashed },
  FAILED: { label: "Failed", tone: "danger", icon: CircleX },
  REFUNDED: { label: "Refunded", tone: "refund", icon: Undo2 },
};

const FULFILMENT_SPEC: Record<string, ChipSpec> = {
  PENDING: { label: "Awaiting payment", tone: "idle", icon: CircleDashed },
  PAYMENT_PROCESSING: {
    label: "Payment processing",
    tone: "info",
    icon: CircleDotDashed,
  },
  PAID: { label: "To pack", tone: "warn", icon: PackageOpen },
  PROCESSING: { label: "Packing", tone: "warn", icon: PackageOpen },
  SHIPPED: { label: "Shipped", tone: "info", icon: Truck },
  DELIVERED: { label: "Delivered", tone: "ok", icon: PackageCheck },
  CANCELLED: { label: "Cancelled", tone: "danger", icon: CircleX },
  REFUNDED: { label: "Refunded", tone: "refund", icon: Undo2 },
};

function Chip({ spec, raw }: { spec: ChipSpec | undefined; raw: string }) {
  const resolved: ChipSpec = spec ?? {
    label: raw,
    tone: "idle",
    icon: CircleDashed,
  };
  const style = TONE_STYLE[resolved.tone];
  const Icon = resolved.icon;

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-sm px-1.5 py-1 text-[0.6875rem] leading-none font-medium whitespace-nowrap"
      style={{ color: style.fg, background: style.bg }}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{resolved.label}</span>
    </span>
  );
}

export function PaymentChip({ status }: { status: string }) {
  return <Chip spec={PAYMENT_SPEC[status]} raw={status} />;
}

export function FulfilmentChip({ status }: { status: string }) {
  return <Chip spec={FULFILMENT_SPEC[status]} raw={status} />;
}

/* ── Empty state ───────────────────────────────────────────────────── */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-[var(--rule-strong)] px-4 py-8">
      <p className="text-[0.8125rem] font-medium">{title}</p>
      {hint ? (
        <p className="max-w-[52ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  );
}

/** A dash that means "nothing recorded", distinct from a zero. */
export function Nil() {
  return (
    <span className="text-muted-foreground" aria-label="not recorded">
      —
    </span>
  );
}
