import { Search, Ruler, PackageCheck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Alege Materialul",
      description: "Răsfoiește catalogul nostru și găsește materialul și culoarea perfecte pentru spațiul tău.",
    },
    {
      icon: Ruler,
      title: "Configurează Dimensiunile",
      description: "Introduce metrii liniari, înălțimea dorită și alege tipul de manoperă.",
    },
    {
      icon: PackageCheck,
      title: "Comandă & Primește",
      description: "Plătește securizat online și primește comanda acasă cu Fan Courier.",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">Cum Funcționează?</h2>
        
        <div className="relative">
          {/* Subtle dashed line connecting steps on desktop */}
          <div className="hidden lg:block absolute top-8 left-[16.66%] right-[16.66%] h-[2px] border-t-2 border-dashed border-primary/20" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 z-10 relative">
                    <Icon className="w-8 h-8" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
