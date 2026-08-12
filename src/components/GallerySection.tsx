import React from 'react';
import { Heart } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  items: GalleryItem[];
  onOpenLightbox?: (url: string, title?: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items, onOpenLightbox }) => {
  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-[#0E1116] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#211A0C] border border-[#6B531F] text-[#E2B755] text-xs font-semibold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Clientes Reales</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Ellos ya confiaron en nosotros
          </h2>
          <p className="text-sm sm:text-base text-[#A89878]">
            Fotografías reales de entregas y clientes, no ilustraciones.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onOpenLightbox?.(item.imageUrl, item.caption)}
              className="relative rounded-xl overflow-hidden border border-[#3D3016]/80 hover:border-[#D4AF37]/60 transition-all aspect-square group"
            >
              <img src={item.imageUrl} alt={item.caption || 'Entrega real'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B0D10]/90 to-transparent p-2.5 text-left">
                  <span className="text-[11px] font-semibold text-[#F3E5C8] leading-tight">{item.caption}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
