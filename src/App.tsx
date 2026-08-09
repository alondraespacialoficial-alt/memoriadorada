import React, { useState, useEffect } from 'react';
import { Product, CartItem, Quotation, SiteSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_QUOTATIONS, INITIAL_SETTINGS } from './data/initialData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { Benefits } from './components/Benefits';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QuotationReceiptModal } from './components/QuotationReceiptModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  fetchProductsFromSupabase,
  fetchQuotationsFromSupabase,
  fetchSettingsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  saveQuotationToSupabase,
  deleteQuotationFromSupabase,
  saveSettingsToSupabase,
  getSupabaseClient,
  getAdminSession,
  onAdminAuthStateChange,
  signOutAdmin
} from './lib/supabase';

export default function App() {
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('charlitron_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  // Load quotations from localStorage or default
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('charlitron_quotations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_QUOTATIONS;
  });

  // Load settings from localStorage or default
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('charlitron_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SETTINGS;
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('charlitron_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Client Receipt Modal State
  const [clientReceiptQuotation, setClientReceiptQuotation] = useState<Quotation | null>(null);
  const [isClientReceiptOpen, setIsClientReceiptOpen] = useState(false);

  // Lightbox Full Image Zoom Modal State
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(undefined);

  const handleOpenLightbox = (url: string, title?: string) => {
    setLightboxImageUrl(url);
    setLightboxTitle(title);
  };

  // Admin Modals & Auth State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Restore/track admin session from Supabase Auth (source of truth, not a local flag)
  useEffect(() => {
    getAdminSession().then((session) => setIsAdminLoggedIn(!!session));
    const unsubscribe = onAdminAuthStateChange((loggedIn) => setIsAdminLoggedIn(loggedIn));
    return unsubscribe;
  }, []);

  // Load from Supabase on Mount if configured
  useEffect(() => {
    const loadFromSupabase = async () => {
      const client = getSupabaseClient();
      if (!client) return;

      try {
        const cloudProducts = await fetchProductsFromSupabase();
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        }

        const cloudQuotations = await fetchQuotationsFromSupabase();
        if (cloudQuotations && cloudQuotations.length > 0) {
          setQuotations(cloudQuotations);
        }

        const cloudSettings = await fetchSettingsFromSupabase();
        if (cloudSettings) {
          setSettings(cloudSettings);
        }
      } catch (err) {
        console.warn('Could not auto-fetch from Supabase:', err);
      }
    };

    loadFromSupabase();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('charlitron_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('charlitron_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('charlitron_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('charlitron_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- CART HANDLERS ---
  const handleAddToCart = (product: Product, customNote?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        if (customNote) updated[existingIndex].customNote = customNote;
        return updated;
      }
      return [...prev, { product, quantity: 1, customNote }];
    });

    addToast({
      type: 'success',
      title: '🛒 Agregado al carrito',
      message: `"${product.name}" (${product.dimensions}) agregado con éxito.`,
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Record quote automatically when requested via WhatsApp or PDF download
  const handleRecordQuotationFromCart = (
    customerName: string,
    customerPhone: string,
    items: CartItem[],
    total: number,
    notes?: string,
    referenceImageUrl?: string
  ): Quotation => {
    const newQuotation: Quotation = {
      id: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      date: new Date().toISOString().split('T')[0],
      items: items.map((i) => ({
        productName: i.product.name,
        dimensions: i.product.dimensions,
        quantity: i.quantity,
        unitPrice: i.product.discountPrice ?? i.product.originalPrice,
      })),
      deposit: 0,
      totalAmount: total,
      status: 'Pendiente',
      notes: notes || 'Solicitado directamente desde la tienda',
      referenceImageUrl: referenceImageUrl || undefined,
    };

    setQuotations((prev) => [newQuotation, ...prev]);
    saveQuotationToSupabase(newQuotation).catch((err) => console.error('Supabase quote sync err:', err));

    addToast({
      type: 'success',
      title: '📋 Cotización Registrada',
      message: `Folio ${newQuotation.id} guardado correctamente.`,
    });

    return newQuotation;
  };

  // --- ADMIN HANDLERS ---
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminPanelOpen(true);
    addToast({
      type: 'success',
      title: '🔓 Sesión Iniciada',
      message: 'Bienvenido al panel de administración de Charlitron Foto Estudio.',
    });
  };

  const handleLogout = () => {
    signOutAdmin().catch((err) => console.error('Supabase sign-out err:', err));
    setIsAdminLoggedIn(false);
    setIsAdminPanelOpen(false);
    addToast({
      type: 'info',
      title: '🔒 Sesión Cerrada',
      message: 'Has salido del panel administrativo.',
    });
  };

  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    saveProductToSupabase(product).catch((err) => console.error('Supabase product sync err:', err));
    addToast({
      type: 'success',
      title: '💾 Producto Guardado',
      message: `"${product.name}" guardado correctamente.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromSupabase(productId).catch((err) => console.error('Supabase product delete err:', err));
    addToast({
      type: 'info',
      title: '🗑️ Producto Eliminado',
      message: 'El producto ha sido quitado del catálogo.',
    });
  };

  const handleSaveQuotation = (quotation: Quotation) => {
    setQuotations((prev) => {
      const exists = prev.some((q) => q.id === quotation.id);
      if (exists) {
        return prev.map((q) => (q.id === quotation.id ? quotation : q));
      }
      return [quotation, ...prev];
    });
    saveQuotationToSupabase(quotation).catch((err) => console.error('Supabase quotation sync err:', err));
    addToast({
      type: 'success',
      title: '💾 Cotización Actualizada',
      message: `Folio ${quotation.id} guardado con estado "${quotation.status}".`,
    });
  };

  const handleDeleteQuotation = (quotationId: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
    deleteQuotationFromSupabase(quotationId).catch((err) => console.error('Supabase quotation delete err:', err));
    addToast({
      type: 'info',
      title: '🗑️ Cotización Eliminada',
      message: `Folio ${quotationId} ha sido eliminado.`,
    });
  };

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettingsToSupabase(newSettings).catch((err) => console.error('Supabase settings sync err:', err));
    addToast({
      type: 'success',
      title: '⚙️ Configuración Guardada',
      message: 'Los datos de contacto y taller han sido actualizados.',
    });
  };

  const handleResetDefaults = () => {
    if (confirm('¿Estás seguro de restablecer todos los datos a la versión original?')) {
      setProducts(INITIAL_PRODUCTS);
      setQuotations(INITIAL_QUOTATIONS);
      setSettings(INITIAL_SETTINGS);
      localStorage.removeItem('charlitron_products');
      localStorage.removeItem('charlitron_quotations');
      localStorage.removeItem('charlitron_settings');
      addToast({
        type: 'warning',
        title: '🔄 Datos Restablecidos',
        message: 'Se cargaron los valores predeterminados iniciales.',
      });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3E5C8] font-sans selection:bg-[#D4AF37] selection:text-[#0B0D10]">
      
      {/* Toast Notifications Overlay */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} onCloseToast={removeToast} />

      {/* Header */}
      <Header
        settings={settings}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Landing Content */}
      <main>
        {/* Hero Section */}
        <Hero
          settings={settings}
          onExploreClick={scrollToCatalog}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Interactive Before & After Restoration Slider */}
        <BeforeAfterSlider
          originalUrl={settings.beforeAfterOriginalUrl}
          restoredUrl={settings.beforeAfterRestoredUrl}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* 5 Benefits Overview from flyer */}
        <Benefits settings={settings} />

        {/* Products Catalog with Filters */}
        <ProductCatalog
          products={products}
          onAddToCart={handleAddToCart}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Client Reviews */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
        onRecordQuotation={handleRecordQuotationFromCart}
        onOpenReceipt={(q) => {
          setClientReceiptQuotation(q);
          setIsClientReceiptOpen(true);
        }}
        onShowToast={addToast}
      />

      {/* Client Receipt Printable PDF Modal */}
      {isClientReceiptOpen && clientReceiptQuotation && (
        <QuotationReceiptModal
          isOpen={isClientReceiptOpen}
          onClose={() => setIsClientReceiptOpen(false)}
          quotation={clientReceiptQuotation}
          settings={settings}
        />
      )}

      {/* Admin Login Modal (ventas@charlitron.com / 2003) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel Dashboard */}
      <AdminDashboard
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        quotations={quotations}
        onSaveQuotation={handleSaveQuotation}
        onDeleteQuotation={handleDeleteQuotation}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onLogout={handleLogout}
        onResetDefaults={handleResetDefaults}
      />

      {/* Full Image Zoom Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImageUrl)}
        imageUrl={lightboxImageUrl}
        title={lightboxTitle}
        onClose={() => setLightboxImageUrl(null)}
      />

    </div>
  );
}
