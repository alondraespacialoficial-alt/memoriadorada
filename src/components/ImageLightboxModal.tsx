import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  mediaType?: 'image' | 'video';
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  title,
  mediaType = 'image',
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080A0C]/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-[#12151B] border border-[#524424] rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#2D2412] mb-3">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-serif text-sm font-bold text-[#F3E5C8] truncate">
              {title || 'Vista Completa de Imagen'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 rounded-xl bg-[#211A0C] border border-[#524424] text-[#D4AF37] hover:border-[#D4AF37] transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Abrir o descargar imagen original"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Abrir Original</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#211A0C] border border-[#524424] text-[#A89878] hover:text-[#F3E5C8] hover:border-[#D4AF37] transition-all cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image Display Container */}
        <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl bg-[#080A0C] border border-[#29200F]">
          {mediaType === 'video' ? (
            <video
              src={imageUrl}
              controls
              autoPlay
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          ) : (
            <img
              src={imageUrl}
              alt={title || 'Vista ampliada'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg transition-transform duration-300"
            />
          )}
        </div>

        <p className="mt-3 text-[11px] text-[#A89878] text-center">
          💡 La imagen se adapta al 100% de su tamaño original sin recortes. Haz clic fuera para cerrar.
        </p>
      </div>
    </div>
  );
};
