import React from 'react';
import { Gift, Home, Heart } from 'lucide-react';
import { SiteSettings } from '../types';

interface NotSureWhatToChooseProps {
  settings: SiteSettings;
}

const OPTIONS = [
  {
    icon: Gift,
    label: 'Quiero hacer un regalo',
    message: 'Hola, quiero hacer un regalo especial con una fotografía o recuerdo, ¿me pueden orientar?',
  },
  {
    icon: Home,
    label: 'Quiero decorar mi hogar',
    message: 'Hola, me gustaría decorar mi hogar con fotografías o cuadros personalizados, ¿qué me recomiendan?',
  },
  {
    icon: Heart,
    label: 'Quiero conservar un recuerdo',
    message: 'Hola, tengo una fotografía o recuerdo que quiero conservar, ¿cómo es el proceso?',
  },
];

export const NotSureWhatToChoose: React.FC<NotSureWhatToChooseProps> = ({ settings }) => {
  return (
    <section className="py-16 bg-[#0B0D10] border-b border-[#211A0D]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            ¿No sabes qué elegir?
          </h2>
          <p className="text-sm sm:text-base text-[#A89878]">
            Cuéntanos qué buscas y te ayudamos a decidir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {OPTIONS.map((option) => (
            <a
              key={option.label}
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(option.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center gap-3 bg-[#12151B] border border-[#3D3016]/80 rounded-2xl p-6 hover:border-[#D4AF37]/60 hover:bg-[#181D26] transition-all shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-[#211A0C] border border-[#6B531F] flex items-center justify-center">
                <option.icon className="w-6 h-6 text-[#E2B755]" />
              </div>
              <span className="font-serif text-base font-bold text-[#F3E5C8]">{option.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
