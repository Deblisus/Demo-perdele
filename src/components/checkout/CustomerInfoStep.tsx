'use client';

import { useForm, type FieldError, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationFields } from "./LocationFields";
import { billingSchema, shippingSchema, type BillingInfo, type ShippingInfo } from "@/lib/validation";
import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface CustomerInfoStepProps {
  onNext: (billing: BillingInfo, shipping: ShippingInfo, sameAsShipping: boolean) => void;
  onBack: () => void;
  defaultBilling?: Partial<BillingInfo>;
  defaultShipping?: Partial<ShippingInfo>;
  defaultSameAsShipping?: boolean;
}

const inputClass = "h-11 rounded-sm text-base";

/** Label, input and its own error message, stacked. */
function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: FieldError;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
      {children}
      {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

export function CustomerInfoStep({
  onNext,
  onBack,
  defaultBilling,
  defaultShipping,
  defaultSameAsShipping = true
}: CustomerInfoStepProps) {
  const [sameAsShipping, setSameAsShipping] = useState(defaultSameAsShipping);

  const combinedSchema = z.object({
    billing: billingSchema,
    shipping: sameAsShipping ? z.any() : shippingSchema,
  });

  type CombinedFormValues = z.infer<typeof combinedSchema>;

  const { register, control, handleSubmit, formState: { errors } } = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      billing: defaultBilling as any,
      shipping: defaultShipping as any,
    }
  });

  const billingErrors = errors.billing;
  // `shipping` is validated with `z.any()` while the addresses match, so its
  // errors arrive untyped; name them once instead of casting at each field.
  const shippingErrors = errors.shipping as FieldErrors<ShippingInfo> | undefined;

  const onSubmit = (data: CombinedFormValues) => {
    const finalShipping = sameAsShipping ? data.billing : data.shipping;
    onNext(data.billing, finalShipping as ShippingInfo, sameAsShipping);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="border-t border-foreground pt-6">
        <legend className="sr-only">Date de facturare</legend>
        <h2 className="font-display text-2xl font-medium tracking-tight">Date de facturare</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
          <Field id="billing.firstName" label="Prenume" error={billingErrors?.firstName}>
            <Input id="billing.firstName" autoComplete="given-name" className={inputClass} {...register("billing.firstName")} />
          </Field>
          <Field id="billing.lastName" label="Nume" error={billingErrors?.lastName}>
            <Input id="billing.lastName" autoComplete="family-name" className={inputClass} {...register("billing.lastName")} />
          </Field>
          <Field id="billing.email" label="Email" error={billingErrors?.email}>
            <Input id="billing.email" type="email" autoComplete="email" className={inputClass} {...register("billing.email")} />
          </Field>
          <Field id="billing.phone" label="Telefon" error={billingErrors?.phone}>
            <Input id="billing.phone" type="tel" autoComplete="tel" placeholder="07xx xxx xxx" className={inputClass} {...register("billing.phone")} />
          </Field>
          <Field id="billing.address" label="Adresă (stradă, număr, bloc, apartament)" error={billingErrors?.address} className="md:col-span-2">
            <Input id="billing.address" autoComplete="street-address" className={inputClass} {...register("billing.address")} />
          </Field>
          <LocationFields
            namePrefix="billing"
            control={control}
            countyError={billingErrors?.county}
            cityError={billingErrors?.city}
          />
          <Field id="billing.zipCode" label="Cod poștal (opțional)">
            <Input id="billing.zipCode" autoComplete="postal-code" className={inputClass} {...register("billing.zipCode")} />
          </Field>
        </div>
      </fieldset>

      <div className="mt-8 flex items-start gap-3 border-y border-border py-4">
        <Checkbox
          id="sameAsShipping"
          checked={sameAsShipping}
          onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
          className="mt-0.5"
        />
        <Label htmlFor="sameAsShipping" className="font-normal leading-snug">
          Livrăm la aceeași adresă
        </Label>
      </div>

      {!sameAsShipping && (
        <fieldset className="mt-8">
          <legend className="sr-only">Date de livrare</legend>
          <h2 className="font-display text-2xl font-medium tracking-tight">Adresa de livrare</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
            <Field id="shipping.firstName" label="Prenume" error={shippingErrors?.firstName}>
              <Input id="shipping.firstName" autoComplete="shipping given-name" className={inputClass} {...register("shipping.firstName")} />
            </Field>
            <Field id="shipping.lastName" label="Nume" error={shippingErrors?.lastName}>
              <Input id="shipping.lastName" autoComplete="shipping family-name" className={inputClass} {...register("shipping.lastName")} />
            </Field>
            <Field id="shipping.phone" label="Telefon" error={shippingErrors?.phone}>
              <Input id="shipping.phone" type="tel" autoComplete="shipping tel" placeholder="07xx xxx xxx" className={inputClass} {...register("shipping.phone")} />
            </Field>
            <Field id="shipping.address" label="Adresă (stradă, număr, bloc, apartament)" error={shippingErrors?.address} className="md:col-span-2">
              <Input id="shipping.address" autoComplete="shipping street-address" className={inputClass} {...register("shipping.address")} />
            </Field>
            <LocationFields
              namePrefix="shipping"
              control={control}
              countyError={shippingErrors?.county}
              cityError={shippingErrors?.city}
            />
            <Field id="shipping.zipCode" label="Cod poștal (opțional)">
              <Input id="shipping.zipCode" autoComplete="shipping postal-code" className={inputClass} {...register("shipping.zipCode")} />
            </Field>
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
        <button type="button" onClick={onBack} className="text-sm underline-offset-4 hover:underline">
          ← Înapoi la coș
        </button>
        <Button type="submit" className="h-12 rounded-sm px-8 text-[0.95rem]">
          Continuă spre livrare
        </Button>
      </div>
    </form>
  );
}
