import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, MessageCircle, Frame, CheckCircle2, ZoomIn } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
  onOpenLightbox?: (url: string, title?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick, onOpenLightbox }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B0D10] via-[#12151B] to-[#0B0D10] pt-12 pb-20 border-b border-[#2D2412]">
      {/* Background Decorative Gold Gradients & Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#D4AF37]/10 via-[#806112]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-[#C59B27]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#211A0C] border border-[#6B531F] text-[#E2B755] text-xs sm:text-sm font-medium tracking-wide">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{settings.heroTagline}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27] leading-[1.15] tracking-tight">
              {settings.heroTitle}
            </h1>

            {/* Subtitle / Persuasive Text */}
            <p className="text-base sm:text-xl text-[#C7BBA3] max-w-2xl font-sans font-normal leading-relaxed">
              {settings.heroSubtitle}
            </p>

            {/* Quick Slogans Checklist */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#DFD5C0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Restauración digital de manchas y rasgaduras</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Enmarcado profesional en fino acabado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Impresión HD en todas las medidas estándar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Recreaciones en lienzo efecto óleo</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#8F6C13] text-[#0B0D10] font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-3 group"
                id="hero-explore-btn"
              >
                <span>{settings.heroCtaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría cotizar la restauración y enmarcado de una fotografía antigua.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#141A14] border border-[#25D366]/40 text-[#25D366] font-semibold text-base hover:bg-[#1C271C] transition-all flex items-center justify-center gap-2.5"
                id="hero-whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#8A7C62]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Garantía de Satisfacción</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Frame className="w-4 h-4 text-[#D4AF37]" />
                <span>Materiales de Galería</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Frame Showcase */}
          <div className="lg:col-span-5 relative">
            
            {/* Elegant Outer Frame Shadow Effect */}
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-gradient-to-b from-[#2E2412] via-[#1A150B] to-[#0F0D09] p-3 border border-[#695221] shadow-2xl shadow-[#D4AF37]/10">
              
              {/* Inner Frame */}
              <div className="relative rounded-xl overflow-hidden border-4 border-[#3D3016] bg-[#0E1116] group h-80 sm:h-[420px] flex items-center justify-center">
                {/* Ambient Blurred Background Layer so empty spaces look like ambient studio reflections */}
                <img
                  src={settings.heroImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                />

                {/* Main Foreground Image - Adapts 100% without cropping */}
                <img
                  src={settings.heroImageUrl}
                  alt="Restauración y Enmarcado de Fotos"
                  className="relative z-10 max-w-full max-h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Zoom Lightbox Trigger Button */}
                {onOpenLightbox && (
                  <button
                    onClick={() => onOpenLightbox(settings.heroImageUrl, 'Flyer / Galería Principal')}
                    className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-[#0B0D10]/80 backdrop-blur-md border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0D10] transition-all opacity-0 group-hover:opacity-100 shadow-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Ver imagen completa sin recortes"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver Completa</span>
                  </button>
                )}

                {/* Decorative Gold Corner Accents */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none z-20" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none z-20" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none z-20" />

                {/* Floating Badge */}
                <div className="absolute bottom-3 left-3 right-3 z-20 bg-[#0B0D10]/90 backdrop-blur-md border border-[#54431B] rounded-lg p-2.5 text-center">
                  <span className="block font-serif text-xs sm:text-sm font-bold text-[#F3E5C8]">
                    11 Medidas Disponibles
                  </span>
                  <span className="block text-[10px] sm:text-xs text-[#A89878]">
                    Desde 10x15 cm hasta 50x76 cm con Enmarcado Incluido
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
