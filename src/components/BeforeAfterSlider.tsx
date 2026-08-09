import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalUrl?: string;
  restoredUrl?: string;
  onOpenLightbox?: (url: string, title?: string) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  restoredUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  onOpenLightbox,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <section id="antes-despues" className="py-16 bg-[#0E1116] border-b border-[#211A0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#211A0C] border border-[#6B531F] text-[#E2B755] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Demostración de Restauración</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Mira la Magia del Antes y Después
          </h2>
          <p className="text-sm sm:text-base text-[#A89878]">
            Desliza la barra central para comparar una fotografía original maltratada con nuestro proceso de restauración digital y re-enmarcado.
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#54431B] shadow-2xl bg-[#080A0C] select-none">
            
            {/* Base Container with Touch/Mouse Events */}
            <div
              className="relative h-72 sm:h-96 md:h-[450px] w-full cursor-col-resize overflow-hidden bg-[#080A0C]"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* RESTORED IMAGE (Background Layer - Adaptive Object-Contain + Ambient Blur) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={restoredUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                />
                <img
                  src={restoredUrl}
                  alt="Foto Restaurada"
                  className="relative z-10 max-w-full max-h-full object-contain p-2 pointer-events-none"
                />
              </div>

              {/* RESTORED Label */}
              <div className="absolute top-4 right-4 bg-[#0B0D10]/85 border border-[#D4AF37] text-[#F3E5C8] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm z-30">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>RESTAURADO & ENMARCADO</span>
              </div>

              {/* ORIGINAL / DAMAGED IMAGE (Clipped Layer using polygon clip-path) */}
              <div
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={originalUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                />
                <img
                  src={originalUrl}
                  alt="Foto Original Maltratada"
                  className="relative z-10 max-w-full max-h-full object-contain p-2 filter grayscale contrast-125 sepia brightness-90"
                />
                <div className="absolute inset-0 bg-[#3B2912]/20 mix-blend-multiply pointer-events-none" />

                {/* DAMAGED Label */}
                <div className="absolute top-4 left-4 bg-[#0B0D10]/85 border border-[#524424] text-[#A89878] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm whitespace-nowrap z-30">
                  ORIGINAL DAÑADO
                </div>
              </div>

              {/* Slider Separator Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.8)] z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Center Handle Knob */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#F3E5C8] via-[#D4AF37] to-[#806112] p-0.5 shadow-2xl flex items-center justify-center border-2 border-[#0B0D10]">
                  <div className="w-full h-full bg-[#0B0D10] rounded-full flex items-center justify-center text-[#D4AF37]">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Slider Drag Instructions Footer */}
            <div className="bg-[#12151C] border-t border-[#29200F] px-4 py-3 text-center text-xs text-[#A89878] flex items-center justify-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              <span>Arrastra el divisor a la izquierda o derecha para ver la transformación</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
