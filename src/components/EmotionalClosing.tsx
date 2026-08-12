import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmotionalClosing: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0B0D10] via-[#12151B] to-[#0B0D10] border-b border-[#211A0D]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto" />
        <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27] leading-snug">
          No hacemos solamente cuadros.
          <br />
          Conservamos historia.
        </p>
        <p className="text-sm sm:text-base text-[#A89878]">
          MEMORIA DORADA · Porque los momentos pasan... los recuerdos permanecen.
        </p>
      </div>
    </section>
  );
};
