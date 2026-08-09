import React from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Familia Morales Trejo',
      text: 'Restauraron la única fotografía que teníamos de la boda de mis abuelitos de 1948. Estaba partida por la mitad y quemada por el sol. Quedó espectacular, parece tomada ayer.',
      stars: 5,
      date: 'San Luis Potosí',
    },
    {
      name: 'Ing. Fernando Cavazos',
      text: 'Excelente servicio de enmarcado con hoja de oro y retoque digital. La entrega fue rapidísima y la calidad en el papel lienzo es de verdadera galería de arte.',
      stars: 5,
      date: 'Soledad de Graciano Sánchez',
    },
    {
      name: 'Sra. Beatriz Delgado',
      text: 'Pedí una recreación en óleo para el aniversario de mis padres. Les encantó ver su retrato restaurado en un marco gigante para la sala de su casa.',
      stars: 5,
      date: 'San Luis Potosí',
    },
  ];

  return (
    <section className="py-16 bg-[#0E1116] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#211A0C] border border-[#6B531F] text-[#E2B755] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Opiniones Reales</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Familias que Han Conservado sus Recuerdos
          </h2>
          <p className="text-sm text-[#A89878]">
            Cada trabajo es tratado con el respeto y la devoción que merece tu legado familiar.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-[#12151B] border border-[#3D3016] rounded-2xl p-6 relative flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all shadow-lg"
            >
              <Quote className="w-8 h-8 text-[#3D3016] absolute top-4 right-4" />

              <div className="space-y-3 z-10">
                <div className="flex gap-1">
                  {[...Array(rev.stars)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#D1C5B0] italic leading-relaxed">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#262013]">
                <span className="block font-serif text-sm font-bold text-[#F3E5C8]">
                  {rev.name}
                </span>
                <span className="block text-[10px] text-[#827258] font-sans">
                  {rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
