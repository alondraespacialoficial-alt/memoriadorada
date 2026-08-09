import React from 'react';
import { Sparkles, ImagePlus, Printer, Frame, Heart, ShieldCheck, Eye, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface BenefitsProps {
  settings: SiteSettings;
}

export const Benefits: React.FC<BenefitsProps> = ({ settings }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#E2B755]" />;
      case 'ImagePlus':
        return <ImagePlus className="w-6 h-6 text-[#E2B755]" />;
      case 'Printer':
        return <Printer className="w-6 h-6 text-[#E2B755]" />;
      case 'Frame':
        return <Frame className="w-6 h-6 text-[#E2B755]" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-[#E2B755]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#E2B755]" />;
    }
  };

  return (
    <section id="proceso" className="py-16 bg-[#0B0D10] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner header from flyer */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#A89878] mb-2">
            Restaura tus Recuerdos
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Restauramos y Recreamos tus Fotografías con Cuidado y Profesionalismo
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        {/* PROMINENT: Garantía de Satisfacción Digital */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A150B] via-[#261E0F] to-[#1A150B] border-2 border-[#D4AF37]/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#D4AF37]/10">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0B0D10] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0D10] border border-[#524424] text-[#E2B755] text-xs font-bold uppercase tracking-wider mb-1">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Muestra Previa Garantizada</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F3E5C8]">
                Garantía de satisfacción digital
              </h3>
              <p className="text-sm sm:text-base text-[#D8CBBA] leading-relaxed max-w-3xl">
                Revisamos tu diseño contigo hasta que quedes conforme y producimos el trabajo final con cuidado y profesionalismo. Siempre verás una muestra previa antes de terminar tu cuadro.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 text-xs text-[#E2B755] font-semibold bg-[#0B0D10]/80 p-4 rounded-xl border border-[#3D3016]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Revisión interactiva</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Aprobación antes de imprimir</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Acabado 100% profesional</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {settings.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-[#12151B] border border-[#3D3016]/80 rounded-xl p-6 text-center hover:border-[#D4AF37]/60 hover:bg-[#181D26] transition-all group shadow-lg flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-full bg-[#211A0C] border border-[#6B531F] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all">
                {getIcon(benefit.icon)}
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-base font-bold text-[#F3E5C8] leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#A89878] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

