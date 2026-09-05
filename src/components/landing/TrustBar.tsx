import { Truck, Scissors, Award, ShieldCheck } from "lucide-react";

export function TrustBar() {
  const items = [
    {
      icon: Truck,
      title: "Transport Gratuit",
      subtitle: "Comenzi peste 600 lei",
    },
    {
      icon: Scissors,
      title: "Confecționare",
      subtitle: "Profesională la comandă",
    },
    {
      icon: Award,
      title: "Materiale Premium",
      subtitle: "Calitate garantată",
    },
    {
      icon: ShieldCheck,
      title: "Plăți Securizate",
      subtitle: "Prin Netopia",
    },
  ];

  return (
    <section className="bg-secondary py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center space-y-2 ${index > 1 ? "pt-6 lg:pt-0" : ""} ${index % 2 !== 0 ? "lg:px-4" : ""}`}
              >
                <Icon className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-medium text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
