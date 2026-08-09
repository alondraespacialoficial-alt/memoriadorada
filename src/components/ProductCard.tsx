import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Info, ZoomIn } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, customNote?: string) => void;
  onOpenLightbox?: (url: string, title?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpenLightbox }) => {
  const [added, setAdded] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const finalPrice = product.discountPrice ?? product.originalPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.originalPrice;
  const savings = hasDiscount ? product.originalPrice - product.discountPrice! : 0;

  const handleAdd = () => {
    onAddToCart(product, customNote);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setShowNoteInput(false);
    setCustomNote('');
  };

  return (
    <div className="relative bg-[#12151B] border border-[#3D3016]/90 rounded-2xl overflow-hidden hover:border-[#D4AF37]/80 transition-all duration-300 shadow-xl hover:shadow-[#D4AF37]/10 flex flex-col justify-between group">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Discount Badge */}
        {product.hasDiscountBanner && (
          <span className="bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg border border-[#FFE8A3]">
            {product.discountBannerText || 'OFERTA'}
          </span>
        )}

        {/* Popular Tag */}
        {product.isPopular && (
          <span className="ml-auto bg-[#0B0D10]/90 backdrop-blur-md border border-[#D4AF37] text-[#E2B755] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            ★ Más Solicitado
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative h-52 sm:h-60 overflow-hidden bg-[#080A0C] flex items-center justify-center cursor-pointer group/img">
        {/* Ambient Blurred Background Layer */}
        <img
          src={product.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
        />

        {/* Foreground Adaptive Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="relative z-10 max-w-full max-h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-500"
          onClick={() => onOpenLightbox && onOpenLightbox(product.imageUrl, `${product.name} (${product.dimensions})`)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151B] via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Zoom Overlay Hint */}
        {onOpenLightbox && (
          <button
            onClick={() => onOpenLightbox(product.imageUrl, `${product.name} (${product.dimensions})`)}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-[#0B0D10]/80 backdrop-blur-md border border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0D10] transition-all opacity-0 group-hover/img:opacity-100 shadow-md"
            title="Ver imagen completa"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}
        
        {/* Dimensions Badge Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#0B0D10]/90 backdrop-blur-md border border-[#524424] text-[#F3E5C8] font-mono text-xs font-bold px-2.5 py-1 rounded-md">
          {product.dimensions}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#F3E5C8] group-hover:text-[#D4AF37] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-[#A89878] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-[#262013]">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#A89878] block">Precio:</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl font-extrabold text-[#F3E5C8]">
                  {formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-[#827258] line-through font-mono">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount && (
              <span className="text-[11px] font-semibold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 px-2 py-0.5 rounded">
                Ahorras {formatCurrency(savings)}
              </span>
            )}
          </div>

          {/* Optional Note Toggle */}
          {showNoteInput ? (
            <div className="mt-3 pt-2 border-t border-[#332A15] space-y-2">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ej: Foto en blanco y negro muy rayada..."
                className="w-full bg-[#080A0C] border border-[#524424] rounded-lg px-3 py-1.5 text-xs text-[#F3E5C8] placeholder-[#73654D] focus:outline-none focus:border-[#D4AF37]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#D4AF37] text-[#0B0D10] text-xs font-bold py-1.5 rounded-lg hover:brightness-110"
                >
                  Confirmar y Agregar
                </button>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-2 py-1.5 text-xs text-[#A89878] hover:text-[#F3E5C8]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleAdd}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  added
                    ? 'bg-[#25D366] text-[#0B0D10]'
                    : 'bg-gradient-to-r from-[#2B220F] via-[#4A3A19] to-[#2B220F] text-[#F3E5C8] border border-[#7A6026] hover:border-[#D4AF37] hover:bg-[#52411C]'
                }`}
                id={`add-to-cart-${product.id}`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#E2B755]" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowNoteInput(true)}
                className="p-2.5 rounded-xl bg-[#1A1E26] border border-[#3D3016] text-[#A89878] hover:text-[#E2B755] hover:border-[#806424] transition-all"
                title="Agregar nota especial para esta foto"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
