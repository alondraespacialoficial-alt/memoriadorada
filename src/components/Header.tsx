import React, { useState } from 'react';
import { ShoppingBag, Lock, MessageCircle, Sparkles, Image as ImageIcon, Menu, X, ChevronRight, Layers, PhoneCall, ShieldCheck } from 'lucide-react';
import { SiteSettings, CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  settings: SiteSettings;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartItems,
  onOpenCart,
  onOpenAdminModal,
  isAdminLoggedIn,
  onOpenAdminPanel,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartSum = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.originalPrice;
    return acc + price * item.quantity;
  }, 0);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#332A15]/60 shadow-xl">
      {/* Global Promotion Banner */}
      {settings.enableGlobalBanner && settings.globalBannerText && (
        <div className="bg-gradient-to-r from-[#211A0C] via-[#3D3016] to-[#211A0C] border-b border-[#614E23]/50 text-[#F5E6C8] text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E2B755] shrink-0 animate-pulse" />
          <span>{settings.globalBannerText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#B38F2B] to-[#594310] p-[1.5px] shadow-lg shadow-[#D4AF37]/10 group-hover:shadow-[#D4AF37]/20 transition-all shrink-0">
              <div className="w-full h-full bg-[#0E1116] rounded-[7px] flex items-center justify-center">
                {settings.logoImageUrl ? (
                  <img src={settings.logoImageUrl} alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                ) : (
                  <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E2B755]" />
                )}
              </div>
            </div>

            <div>
              <span className="block font-serif text-base sm:text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5C8] via-[#D4AF37] to-[#C59B27] leading-tight">
                {settings.logoTitle}
              </span>
              <span className="block text-[9px] sm:text-xs tracking-wider font-sans text-[#A89878] uppercase">
                {settings.logoSubtitle}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#C2B59B]">
            <a href="#catalogo" className="hover:text-[#F3E5C8] transition-colors">
              Catálogo de Medidas
            </a>
            <a href="#antes-despues" className="hover:text-[#F3E5C8] transition-colors">
              Antes y Después
            </a>
            <a href="#proceso" className="hover:text-[#F3E5C8] transition-colors">
              Nuestros Servicios
            </a>
            <a href="#contacto" className="hover:text-[#F3E5C8] transition-colors">
              Contacto
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp direct link (Desktop / Tablet) */}
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all"
              title="Contacto directo por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{settings.whatsappDisplayPhone}</span>
            </a>

            {/* Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#211A0B] to-[#382D13] border border-[#735A22]/60 text-[#F5E6C8] hover:border-[#D4AF37] hover:bg-[#322710] transition-all shadow-md group cursor-pointer"
              id="header-cart-btn"
            >
              <ShoppingBag className="w-5 h-5 text-[#E2B755] group-hover:scale-110 transition-transform" />
              <div className="text-left hidden xs:block">
                <span className="block text-[10px] uppercase tracking-wider text-[#A39272]">Cotización</span>
                <span className="block text-xs font-bold text-[#F3E5C8]">{formatCurrency(totalCartSum)}</span>
              </div>
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border border-[#0B0D10]">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin Login or Panel Access (Desktop) */}
            {isAdminLoggedIn ? (
              <button
                onClick={onOpenAdminPanel}
                className="hidden sm:flex px-3 py-2 text-xs font-medium rounded-xl bg-[#3D3016] text-[#E2B755] border border-[#8C6D27] hover:bg-[#52411E] transition-all items-center gap-1.5 cursor-pointer"
                title="Panel de Administración"
                id="header-admin-panel-btn"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="hidden sm:flex p-2.5 text-[#8A7B5F] hover:text-[#E2B755] transition-colors rounded-xl hover:bg-[#1A1E26] cursor-pointer"
                title="Acceso Administrador"
                id="header-admin-login-btn"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#141821] border border-[#3D3016] text-[#E2B755] hover:text-[#F3E5C8] hover:border-[#D4AF37] transition-all md:hidden cursor-pointer flex items-center justify-center"
              aria-label="Abrir menú"
              id="header-mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="relative z-40 bg-[#0E1116] border-b border-[#382E18] shadow-2xl md:hidden px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            
            <p className="text-[10px] font-bold text-[#A89878] uppercase tracking-widest px-2">
              Navegación del Sitio
            </p>

            <nav className="space-y-1">
              <a
                href="#catalogo"
                onClick={handleNavClick}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141821]/80 border border-[#29200F] text-[#F3E5C8] hover:bg-[#211A0C] hover:border-[#614E23] transition-all text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                  <span>Catálogo de Medidas y Precios</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89878]" />
              </a>

              <a
                href="#antes-despues"
                onClick={handleNavClick}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141821]/80 border border-[#29200F] text-[#F3E5C8] hover:bg-[#211A0C] hover:border-[#614E23] transition-all text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#E2B755]"></span>
                  <span>Muestras Antes y Después</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89878]" />
              </a>

              <a
                href="#proceso"
                onClick={handleNavClick}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141821]/80 border border-[#29200F] text-[#F3E5C8] hover:bg-[#211A0C] hover:border-[#614E23] transition-all text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#B38F2B]"></span>
                  <span>Nuestros Servicios de Restauración</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89878]" />
              </a>

              <a
                href="#contacto"
                onClick={handleNavClick}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141821]/80 border border-[#29200F] text-[#F3E5C8] hover:bg-[#211A0C] hover:border-[#614E23] transition-all text-sm font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                  <span>Contacto y Horarios</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89878]" />
              </a>
            </nav>

            {/* Quick Action Buttons in Mobile Drawer */}
            <div className="pt-2 border-t border-[#29200F] space-y-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="w-full p-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#25D366]/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escribir por WhatsApp ({settings.whatsappDisplayPhone})</span>
              </a>

              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    handleNavClick();
                    onOpenAdminPanel();
                  }}
                  className="w-full p-3 rounded-xl bg-[#3D3016] border border-[#8C6D27] text-[#E2B755] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#52411E] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Panel Administrador</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleNavClick();
                    onOpenAdminModal();
                  }}
                  className="w-full p-3 rounded-xl bg-[#141821] border border-[#3D3016] text-[#A89878] hover:text-[#F3E5C8] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#E2B755]" />
                  <span>Acceso para Administrador</span>
                </button>
              )}
            </div>

          </div>
        </>
      )}
    </header>
  );
};

