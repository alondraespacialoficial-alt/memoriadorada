import React from 'react';
import { Eye } from 'lucide-react';
import { CREATION_CATEGORIES } from '../data/categories';
import { CategoryExample } from '../types';

interface WhatWeCreateProps {
  examples: CategoryExample[];
  onOpenMedia: (url: string, mediaType: 'image' | 'video', title?: string) => void;
}

export const WhatWeCreate: React.FC<WhatWeCreateProps> = ({ examples, onOpenMedia }) => {
  const findExample = (key: string) => examples.find((e) => e.key === key && e.mediaUrl);

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
            Trae tu idea, casi siempre podemos hacerla realidad. Toca una categoría para ver un ejemplo.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {CREATION_CATEGORIES.map((item) => {
            const example = findExample(item.key);
            return (
              <button
                key={item.key}
                onClick={() => example && onOpenMedia(example.mediaUrl!, example.mediaType || 'image', item.label)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#12151B] border transition-all ${
                  example
                    ? 'border-[#D4AF37]/70 hover:bg-[#181D26] cursor-pointer'
                    : 'border-[#3D3016]/80 cursor-default opacity-80'
                }`}
                title={example ? `Ver ejemplo: ${item.label}` : item.label}
              >
                <item.icon className="w-4 h-4 text-[#E2B755] shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[#DFD5C0]">{item.label}</span>
                {example && <Eye className="w-3 h-3 text-[#D4AF37] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
