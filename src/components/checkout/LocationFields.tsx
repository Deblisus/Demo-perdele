'use client';

import { useEffect, useState } from "react";
import {
  useController,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ROMANIAN_COUNTIES, countyLabel } from "@/lib/constants/romania";

/**
 * Localities are the same for every customer, so a county fetched once is
 * reused for the rest of the session — including the second copy of these
 * fields when the shipping address differs from the billing one.
 */
const localityCache = new Map<string, string[]>();

type LocalityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; localities: string[] }
  | { status: "error" };

function useLocalities(county: string): LocalityState {
  /** The outcome of the last completed request, tagged with the county it was for. */
  const [result, setResult] = useState<{
    county: string;
    state: LocalityState;
  } | null>(null);

  useEffect(() => {
    if (!county || localityCache.has(county)) return;

    // A customer can change the county again while a request is in flight;
    // only the latest one is allowed to publish its result.
    let active = true;

    fetch(`/api/localities?county=${encodeURIComponent(county)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data: { localities: string[] } = await res.json();
        localityCache.set(county, data.localities);
        if (active) {
          setResult({
            county,
            state: { status: "ready", localities: data.localities },
          });
        }
      })
      .catch(() => {
        if (active) setResult({ county, state: { status: "error" } });
      });

    return () => {
      active = false;
    };
  }, [county]);

  // Derived during render so a cached county shows its list immediately, with
  // no intermediate loading pass.
  if (!county) return { status: "idle" };

  const cached = localityCache.get(county);
  if (cached) return { status: "ready", localities: cached };

  if (result?.county === county) return result.state;

  return { status: "loading" };
}

interface LocationFieldsProps<TFieldValues extends FieldValues> {
  /** `billing` or `shipping` — the form section these fields belong to. */
  namePrefix: string;
  control: Control<TFieldValues>;
  countyError?: FieldError;
  cityError?: FieldError;
}

/**
 * County and city pickers backed by Fan Courier's nomenclator, so the address
 * saved on the order is always one the carrier can deliver to. If the locality
 * list can't be loaded, the city falls back to a free-text input rather than
 * blocking checkout.
 */
export function LocationFields<TFieldValues extends FieldValues>({
  namePrefix,
  control,
  countyError,
  cityError,
}: LocationFieldsProps<TFieldValues>) {
  const countyField = useController({
    name: `${namePrefix}.county` as Path<TFieldValues>,
    control,
  });
  const cityField = useController({
    name: `${namePrefix}.city` as Path<TFieldValues>,
    control,
  });

  const county: string = countyField.field.value ?? "";
  const city: string = cityField.field.value ?? "";
  const localities = useLocalities(county);

  const countyId = `${namePrefix}.county`;
  const cityId = `${namePrefix}.city`;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={countyId}>Județ</Label>
        <Select
          items={ROMANIAN_COUNTIES}
          value={county || null}
          onValueChange={(value) => {
            countyField.field.onChange(value ?? "");
            // The previous city belongs to the previous county.
            cityField.field.onChange("");
          }}
        >
          <SelectTrigger
            id={countyId}
            className="w-full"
            onBlur={countyField.field.onBlur}
            aria-invalid={countyError ? true : undefined}
          >
            <SelectValue>
              {(value: string | null) =>
                value ? countyLabel(value) : "Selectează județul"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ROMANIAN_COUNTIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countyError && (
          <p className="text-sm text-destructive">{countyError.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={cityId}>Localitate</Label>
        {localities.status === "error" ? (
          <Input
            id={cityId}
            value={city}
            placeholder="Introdu localitatea"
            aria-invalid={cityError ? true : undefined}
            onChange={(event) => cityField.field.onChange(event.target.value)}
            onBlur={cityField.field.onBlur}
          />
        ) : (
          <Combobox
            items={localities.status === "ready" ? localities.localities : []}
            value={city || null}
            onValueChange={(value) => cityField.field.onChange(value ?? "")}
            disabled={localities.status !== "ready"}
            limit={100}
          >
            <ComboboxInputGroup>
              <ComboboxInput
                id={cityId}
                placeholder={
                  localities.status === "idle"
                    ? "Alege întâi județul"
                    : localities.status === "loading"
                      ? "Se încarcă localitățile…"
                      : "Caută localitatea"
                }
                aria-invalid={cityError ? true : undefined}
                onBlur={cityField.field.onBlur}
              />
              <ComboboxTrigger aria-label="Deschide lista de localități" />
            </ComboboxInputGroup>
            <ComboboxContent>
              <ComboboxEmpty>Nicio localitate găsită</ComboboxEmpty>
              <ComboboxList>
                {(locality: string) => (
                  <ComboboxItem key={locality} value={locality}>
                    {locality}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )}
        {cityError && (
          <p className="text-sm text-destructive">{cityError.message}</p>
        )}
      </div>
    </>
  );
}
