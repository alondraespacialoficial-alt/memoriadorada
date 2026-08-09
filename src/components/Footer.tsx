import React from 'react';
import { MessageCircle, MapPin, Clock, Phone, Lock, Sparkles, Heart } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdminModal,
  isAdminLoggedIn,
  onOpenAdminPanel,
}) => {
  return (
    <footer id="contacto" className="bg-[#080A0C] border-t border-[#3D3016] text-[#A89878] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#211A0D]">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8F6C13] p-0.5">
                <div className="w-full h-full bg-[#0B0D10] rounded-[10px] flex items-center justify-center text-[#E2B755]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="block font-serif text-lg font-bold text-[#F3E5C8]">
                  {settings.logoTitle}
                </span>
                <span className="block text-[10px] tracking-wider font-sans text-[#827258] uppercase">
                  {settings.logoSubtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#8A7C62] leading-relaxed max-w-sm">
              Especialistas en restauración digital de fotografías antiguas, retratos dañados y confección de marcos de fina madera con acabados clásicos y contemporáneos.
            </p>

            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp: {settings.whatsappDisplayPhone}</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-serif font-bold text-[#F3E5C8] text-sm">Secciones</h4>
            <ul className="space-y-2">
              <li>
                <a href="#catalogo" className="hover:text-[#F3E5C8] transition-colors">
                  Catálogo de Medidas
                </a>
              </li>
              <li>
                <a href="#antes-despues" className="hover:text-[#F3E5C8] transition-colors">
                  Demostración Antes y Después
                </a>
              </li>
              <li>
                <a href="#proceso" className="hover:text-[#F3E5C8] transition-colors">
                  Nuestros Servicios
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#F3E5C8] transition-colors">
                  Ubicación y Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-serif font-bold text-[#F3E5C8] text-sm">Información de Contacto</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.footerAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.footerHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.footerPhone}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Admin Access */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6048]">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} {settings.logoTitle}. Cuidado y restauración con</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] inline fill-[#D4AF37]" />
          </div>

          <div className="flex items-center gap-4">
            {isAdminLoggedIn ? (
              <button
                onClick={onOpenAdminPanel}
                className="text-[#E2B755] hover:underline flex items-center gap-1 font-bold"
                id="footer-admin-panel-link"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Panel Admin Activo</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="hover:text-[#E2B755] transition-colors flex items-center gap-1"
                id="footer-admin-login-link"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Administrador</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
