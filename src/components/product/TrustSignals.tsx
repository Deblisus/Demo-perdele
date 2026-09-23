import { cn } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/validation';

interface TrustSignalsProps {
  /** Kept for callers; the tailoring notice now lives in the configurator. */
  hasTailoring?: boolean;
  className?: string;
}

/** Delivery and payment facts as a compact 2×2 grid under the buy button. */
export function TrustSignals({ className }: TrustSignalsProps) {
  const rows = [
    { label: 'Livrare', value: 'Fan Courier, 1–3 zile' },
    { label: 'Transport', value: `Gratuit peste ${FREE_SHIPPING_THRESHOLD} lei` },
    { label: 'Confecționare', value: '7–8 zile lucrătoare' },
    { label: 'Plată', value: 'Card, prin Netopia' },
  ];

  return (
    <dl className={cn('grid grid-cols-2 gap-x-4 gap-y-3 text-sm', className)}>
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{row.label}</dt>
          <dd className="mt-0.5">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
