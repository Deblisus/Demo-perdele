import { Truck, Scissors, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustSignalsProps {
  hasTailoring?: boolean;
  className?: string;
}

export function TrustSignals({ hasTailoring = false, className }: TrustSignalsProps) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3 bg-card", className)}>
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <span className="text-sm font-medium">Transport gratuit la comenzi peste 600 lei</span>
      </div>
      
      <div className="flex items-start gap-3">
        <Scissors className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <span className="text-sm font-medium">Confecționare profesională în atelier propriu</span>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <span className="text-sm font-medium">
          {hasTailoring 
            ? 'Livrare: 7-8 zile lucrătoare (include confecționare)' 
            : 'Livrare: 1-3 zile lucrătoare'}
        </span>
      </div>

      {hasTailoring && (
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-sm font-medium text-amber-800">
            Produsele confecționate pe măsură nu pot fi returnate (OUG 34/2014)
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <span className="text-sm font-medium">Plăți securizate prin Netopia</span>
      </div>
    </div>
  );
}
