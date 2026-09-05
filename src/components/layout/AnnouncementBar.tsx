import { Phone, Mail } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground py-1.5 px-4 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center lg:justify-between">
        <div className="hidden lg:flex items-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          <span>0770 123 456</span>
        </div>
        
        <div className="text-center font-medium">
          🚚 Transport gratuit la comenzi peste 600 lei
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          <span>contact@perdeleshop.ro</span>
        </div>
      </div>
    </div>
  );
}
