import { cn } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/validation';

interface TrustSignalsProps {
  /** Kept for callers; the tailoring notice now lives in the configurator. */
  hasTailoring?: boolean;
  className?: string;
}

/** Delivery and payment facts as a plain list — no icon column. */
export function TrustSignals({ className }: TrustSignalsProps) {
  const rows = [
    { label: 'Livrare', value: 'Fan Courier, 1–3 zile lucrătoare pentru material fără manoperă' },
    { label: 'Transport', value: `Gratuit la comenzi peste ${FREE_SHIPPING_THRESHOLD} lei` },
    { label: 'Atelier', value: 'Confecționare în atelier propriu, 7–8 zile lucrătoare' },
    { label: 'Plată', value: 'Card bancar, securizat prin Netopia' },
  ];

  return (
    <dl className={cn('border-t border-border text-sm', className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-border py-3"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
