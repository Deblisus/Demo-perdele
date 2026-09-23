"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type StoreDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type ShippingDraft = {
  freeShippingThreshold: string;
  shippingFee: string;
  defaultPackageWeightKg: string;
};

function useSave() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function save(group: "store" | "shipping", value: unknown) {
    setSaving(true);
    setFieldErrors({});
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group, value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFieldErrors(payload.fields ?? {});
        toast.error(payload.error ?? "Could not save.");
        return false;
      }
      toast.success("Saved");
      router.refresh();
      return true;
    } catch {
      toast.error("Could not reach the server.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, fieldErrors, setFieldErrors };
}

export function StoreInfoForm({ initial }: { initial: StoreDraft }) {
  const [draft, setDraft] = useState(initial);
  const { save, saving, fieldErrors } = useSave();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save("store", draft);
      }}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <Field label="Store name" id="s-name" errors={fieldErrors.name}>
          <Input
            id="s-name"
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            className="h-8 text-[0.8125rem]"
          />
        </Field>
        <Field label="Contact email" id="s-email" errors={fieldErrors.email}>
          <Input
            id="s-email"
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
            className="machine h-8 text-[0.8125rem]"
          />
        </Field>
        <Field label="Phone" id="s-phone" errors={fieldErrors.phone}>
          <Input
            id="s-phone"
            value={draft.phone}
            onChange={(event) =>
              setDraft({ ...draft, phone: event.target.value })
            }
            className="machine h-8 text-[0.8125rem]"
          />
        </Field>
        <Field
          label="Address"
          id="s-address"
          hint="The pickup address printed on AWBs."
          errors={fieldErrors.address}
          className="sm:col-span-2"
        >
          <Textarea
            id="s-address"
            rows={2}
            value={draft.address}
            onChange={(event) =>
              setDraft({ ...draft, address: event.target.value })
            }
            className="text-[0.8125rem]"
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
          Save store info
        </Button>
      </div>
    </form>
  );
}

export function ShippingForm({
  initial,
  clientEnv,
}: {
  initial: ShippingDraft;
  clientEnv: { freeShippingThreshold: number; shippingFee: number };
}) {
  const [draft, setDraft] = useState(initial);
  const { save, saving, fieldErrors } = useSave();

  const threshold = Number(draft.freeShippingThreshold.replace(",", "."));
  const fee = Number(draft.shippingFee.replace(",", "."));
  const thresholdDrift =
    Number.isFinite(threshold) && threshold !== clientEnv.freeShippingThreshold;
  const feeDrift = Number.isFinite(fee) && fee !== clientEnv.shippingFee;
  const drifting = thresholdDrift || feeDrift;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save("shipping", draft);
      }}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
        <Field
          label="Free shipping above"
          id="s-threshold"
          hint="LEI. Subtotals at or above this ship free."
          errors={fieldErrors.freeShippingThreshold}
        >
          <Input
            id="s-threshold"
            inputMode="decimal"
            value={draft.freeShippingThreshold}
            onChange={(event) =>
              setDraft({ ...draft, freeShippingThreshold: event.target.value })
            }
            className="machine h-8 text-[0.8125rem]"
          />
        </Field>
        <Field
          label="Shipping fee"
          id="s-fee"
          hint="LEI, charged below the threshold."
          errors={fieldErrors.shippingFee}
        >
          <Input
            id="s-fee"
            inputMode="decimal"
            value={draft.shippingFee}
            onChange={(event) =>
              setDraft({ ...draft, shippingFee: event.target.value })
            }
            className="machine h-8 text-[0.8125rem]"
          />
        </Field>
        <Field
          label="Default parcel weight"
          id="s-weight"
          hint="kg, sent to Fan Courier when booking an AWB."
          errors={fieldErrors.defaultPackageWeightKg}
        >
          <Input
            id="s-weight"
            inputMode="decimal"
            value={draft.defaultPackageWeightKg}
            onChange={(event) =>
              setDraft({
                ...draft,
                defaultPackageWeightKg: event.target.value,
              })
            }
            className="machine h-8 text-[0.8125rem]"
          />
        </Field>
      </div>

      {drifting ? (
        <div className="rounded-md border border-[var(--st-warn)]/40 bg-[var(--st-warn-tint)] px-3 py-2.5">
          <p className="readout text-[var(--st-warn-ink)]">
            Storefront mismatch
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--st-warn-ink)]">
            The cart calculates shipping in the browser from{" "}
            <code className="machine">NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD</code>{" "}
            ({clientEnv.freeShippingThreshold}) and{" "}
            <code className="machine">NEXT_PUBLIC_SHIPPING_FEE</code> (
            {clientEnv.shippingFee}), which it cannot read from the database.
            Saving here changes what customers are{" "}
            <strong>charged</strong> but not what the cart{" "}
            <strong>shows</strong>. Update <code className="machine">.env</code>{" "}
            to match and restart, or customers will see one number and pay
            another.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
          Save shipping
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  hint,
  errors,
  className,
  children,
}: {
  label: string;
  id?: string;
  hint?: string;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="readout">
        {label}
      </Label>
      {children}
      {errors?.length ? (
        <p role="alert" className="text-[0.75rem] text-destructive">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="text-[0.75rem] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
