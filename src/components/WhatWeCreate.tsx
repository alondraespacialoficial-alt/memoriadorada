import React from 'react';
import { Camera, ImagePlus, Layers, Grid3x3, Frame, PawPrint, Baby, Heart, GraduationCap, Award, Gift, Users, UserRound, PartyPopper } from 'lucide-react';

const ITEMS = [
  { label: 'Fotografías personalizadas', icon: Camera },
  { label: 'Restauración de fotos antiguas', icon: ImagePlus },
  { label: 'Fotomontajes', icon: Layers },
  { label: 'Collages', icon: Grid3x3 },
  { label: 'Marcos decorativos', icon: Frame },
  { label: 'Mascotas', icon: PawPrint },
  { label: 'Bebés y maternidad', icon: Baby },
  { label: 'Bodas y aniversarios', icon: Heart },
  { label: 'Graduaciones', icon: GraduationCap },
  { label: 'Homenajes', icon: Award },
  { label: 'Regalos personalizados', icon: Gift },
  { label: 'Familia', icon: Users },
  { label: 'Abuelos', icon: UserRound },
  { label: 'Cumpleaños', icon: PartyPopper },
];

export const WhatWeCreate: React.FC = () => {
  return (
    <section className="py-16 bg-[#0E1116] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#A89878]">
            Para cualquier momento de tu vida
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            ¿Qué podemos crear para ti?
          </h2>
          <p className="text-sm sm:text-base text-[#A89878]">
            Trae tu idea, casi siempre podemos hacerla realidad.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#12151B] border border-[#3D3016]/80 hover:border-[#D4AF37]/60 hover:bg-[#181D26] transition-all"
            >
              <item.icon className="w-4 h-4 text-[#E2B755] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-[#DFD5C0]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
