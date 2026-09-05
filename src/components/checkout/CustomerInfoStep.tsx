'use client';

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationFields } from "./LocationFields";
import { billingSchema, shippingSchema, type BillingInfo, type ShippingInfo } from "@/lib/validation";
import { useState } from "react";
import { z } from "zod";

interface CustomerInfoStepProps {
  onNext: (billing: BillingInfo, shipping: ShippingInfo, sameAsShipping: boolean) => void;
  onBack: () => void;
  defaultBilling?: Partial<BillingInfo>;
  defaultShipping?: Partial<ShippingInfo>;
  defaultSameAsShipping?: boolean;
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

  // `shipping` is validated with `z.any()` while the addresses match, so its
  // errors arrive untyped; name them once instead of casting at each field.
  const shippingErrors = errors.shipping as FieldErrors<ShippingInfo> | undefined;

  const onSubmit = (data: CombinedFormValues) => {
    const finalShipping = sameAsShipping ? data.billing : data.shipping;
    onNext(data.billing, finalShipping as ShippingInfo, sameAsShipping);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Date de facturare</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing.firstName">Prenume</Label>
            <Input id="billing.firstName" {...register("billing.firstName")} />
            {(errors.billing as any)?.firstName && <p className="text-sm text-destructive">{(errors.billing as any)?.message?.toString()}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing.lastName">Nume</Label>
            <Input id="billing.lastName" {...register("billing.lastName")} />
            {(errors.billing as any)?.lastName && <p className="text-sm text-destructive">{(errors.billing as any)?.message?.toString()}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing.email">Email</Label>
            <Input id="billing.email" type="email" {...register("billing.email")} />
            {(errors.billing as any)?.email && <p className="text-sm text-destructive">{(errors.billing as any)?.message?.toString()}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing.phone">Telefon</Label>
            <Input id="billing.phone" placeholder="07xxxxxxxx" {...register("billing.phone")} />
            {(errors.billing as any)?.phone && <p className="text-sm text-destructive">{(errors.billing as any)?.message?.toString()}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="billing.address">Adresă</Label>
            <Input id="billing.address" {...register("billing.address")} />
            {(errors.billing as any)?.address && <p className="text-sm text-destructive">{(errors.billing as any)?.message?.toString()}</p>}
          </div>
          <LocationFields
            namePrefix="billing"
            control={control}
            countyError={errors.billing?.county}
            cityError={errors.billing?.city}
          />
          <div className="space-y-2">
            <Label htmlFor="billing.zipCode">Cod Poștal (opțional)</Label>
            <Input id="billing.zipCode" {...register("billing.zipCode")} />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="sameAsShipping" 
          checked={sameAsShipping} 
          onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
        />
        <Label htmlFor="sameAsShipping">
          Adresa de livrare este aceeași cu cea de facturare
        </Label>
      </div>

      {!sameAsShipping && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Date de livrare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping.firstName">Prenume</Label>
              <Input id="shipping.firstName" {...register("shipping.firstName")} />
              {(errors.shipping as any)?.firstName && <p className="text-sm text-destructive">{(errors.shipping as any)?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping.lastName">Nume</Label>
              <Input id="shipping.lastName" {...register("shipping.lastName")} />
              {(errors.shipping as any)?.lastName && <p className="text-sm text-destructive">{(errors.shipping as any)?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping.phone">Telefon</Label>
              <Input id="shipping.phone" placeholder="07xxxxxxxx" {...register("shipping.phone")} />
              {(errors.shipping as any)?.phone && <p className="text-sm text-destructive">{(errors.shipping as any)?.message?.toString()}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shipping.address">Adresă</Label>
              <Input id="shipping.address" {...register("shipping.address")} />
              {(errors.shipping as any)?.address && <p className="text-sm text-destructive">{(errors.shipping as any)?.message?.toString()}</p>}
            </div>
            <LocationFields
              namePrefix="shipping"
              control={control}
              countyError={shippingErrors?.county}
              cityError={shippingErrors?.city}
            />
            <div className="space-y-2">
              <Label htmlFor="shipping.zipCode">Cod Poștal (opțional)</Label>
              <Input id="shipping.zipCode" {...register("shipping.zipCode")} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Înapoi
        </Button>
        <Button type="submit">
          Continuă
        </Button>
      </div>
    </form>
  );
}
