import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-[60vh] px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6">
        <XCircle className="w-20 h-20 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Plata a fost anulată</h1>
        
        <p className="text-muted-foreground">
          Tranzacția nu a fost finalizată. Poți încerca din nou sau poți alege altă metodă de plată.
        </p>

        <div className="pt-6">
          <Button size="lg">
            <Link href="/checkout" className="w-full h-full flex items-center justify-center">
              Încearcă din nou
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
