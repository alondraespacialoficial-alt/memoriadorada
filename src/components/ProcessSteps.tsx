import React from 'react';
import { ImagePlus, PenTool, CheckCircle2, Truck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: ImagePlus,
    title: 'Nos envías tu fotografía',
    description: 'Por WhatsApp, en digital o físico. Tú nos cuentas la idea o el recuerdo que quieres conservar.',
  },
  {
    number: '02',
    icon: PenTool,
    title: 'Diseñamos tu propuesta',
    description: 'Preparamos una muestra digital de cómo quedaría tu pieza terminada.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Tú la apruebas',
    description: 'Ajustamos contigo el diseño hasta que quedes satisfecho, antes de producir nada.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Producimos y coordinamos tu entrega',
    description: 'Con el diseño aprobado, elaboramos tu pieza final y coordinamos cómo la recibes.',
  },
];

export const ProcessSteps: React.FC = () => {
  return (
    <section id="como-funciona" className="py-16 bg-[#0B0D10] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#A89878]">
            Así de simple
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            ¿Cómo funciona?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-[#12151B] border border-[#3D3016]/80 rounded-2xl p-6 text-center hover:border-[#D4AF37]/60 hover:bg-[#181D26] transition-all shadow-lg flex flex-col items-center gap-3"
            >
              <span className="font-serif text-4xl font-bold text-[#3D3016]">{step.number}</span>
              <div className="w-14 h-14 rounded-full bg-[#211A0C] border border-[#6B531F] flex items-center justify-center -mt-2">
                <step.icon className="w-6 h-6 text-[#E2B755]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#F3E5C8] leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-[#A89878] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
