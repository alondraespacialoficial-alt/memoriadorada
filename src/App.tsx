import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Product, CartItem, Quotation, SiteSettings, GalleryItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_QUOTATIONS, INITIAL_SETTINGS } from './data/initialData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { GallerySection } from './components/GallerySection';
import { Benefits } from './components/Benefits';
import { WhatWeCreate } from './components/WhatWeCreate';
import { ProcessSteps } from './components/ProcessSteps';
import { NotSureWhatToChoose } from './components/NotSureWhatToChoose';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { Testimonials } from './components/Testimonials';
import { EmotionalClosing } from './components/EmotionalClosing';
import { Footer } from './components/Footer';
import { QuotationReceiptModal } from './components/QuotationReceiptModal';

// Admin panel solo lo usa el staff, se saca del bundle inicial que descargan los clientes
const AdminLoginModal = lazy(() => import('./components/admin/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  fetchProductsFromSupabase,
  fetchQuotationsFromSupabase,
  fetchSettingsFromSupabase,
  fetchGalleryItemsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  saveGalleryItemToSupabase,
  deleteGalleryItemFromSupabase,
  saveQuotationToSupabase,
  saveQuotationWithRetry,
  flushPendingQuotations,
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

  // Products are displayed in ascending sortOrder; items without one are sent to the end
  const sortProducts = (list: Product[]): Product[] =>
    [...list].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));

  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('charlitron_products');
    if (saved) {
      try { return sortProducts(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    return sortProducts(INITIAL_PRODUCTS);
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

  // Load gallery items (real delivery photos) from localStorage or default (empty until admin uploads real photos)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('charlitron_gallery');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
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

  // Lightbox Full Image/Video Zoom Modal State
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(undefined);
  const [lightboxMediaType, setLightboxMediaType] = useState<'image' | 'video'>('image');

  const handleOpenLightbox = (url: string, title?: string, mediaType: 'image' | 'video' = 'image') => {
    setLightboxImageUrl(url);
    setLightboxTitle(title);
    setLightboxMediaType(mediaType);
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
        // null = fetch failed (keep local cache); [] = cloud is empty on purpose (trust it)
        const cloudProducts = await fetchProductsFromSupabase();
        if (cloudProducts !== null) {
          setProducts(sortProducts(cloudProducts));
        }

        const cloudQuotations = await fetchQuotationsFromSupabase();
        if (cloudQuotations !== null) {
          setQuotations(cloudQuotations);
        }

        const cloudSettings = await fetchSettingsFromSupabase();
        if (cloudSettings) {
          setSettings(cloudSettings);
        }

        const cloudGalleryItems = await fetchGalleryItemsFromSupabase();
        if (cloudGalleryItems !== null) {
          setGalleryItems(cloudGalleryItems);
        }

        // Resend any quotations that failed to sync in a previous session
        flushPendingQuotations().catch((err) => console.warn('Could not flush pending quotations:', err));
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
    localStorage.setItem('charlitron_gallery', JSON.stringify(galleryItems));
  }, [galleryItems]);

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
    referenceImageUrls?: string[],
    shippingCost?: number,
    shippingDistanceKm?: number
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
      cost: 0,
      status: 'Pendiente',
      notes: notes || 'Solicitado directamente desde la tienda',
      referenceImageUrls: referenceImageUrls && referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
      shippingCost: shippingCost || undefined,
      shippingDistanceKm: shippingDistanceKm || undefined,
    };

    setQuotations((prev) => [newQuotation, ...prev]);
    saveQuotationWithRetry(newQuotation).catch((err) => console.error('Supabase quote sync err:', err));

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
      message: 'Bienvenido al panel de administración de Memoria Dorada.',
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
    let finalProduct = product;
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return sortProducts(prev.map((p) => (p.id === product.id ? product : p)));
      }
      const maxOrder = prev.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), -1);
      finalProduct = { ...product, sortOrder: product.sortOrder ?? maxOrder + 1 };
      return sortProducts([...prev, finalProduct]);
    });
    saveProductToSupabase(finalProduct)
      .then((ok) => {
        if (ok) {
          addToast({ type: 'success', title: '💾 Producto Guardado', message: `"${product.name}" guardado correctamente.` });
        } else {
          addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `"${product.name}" se guardó solo en este dispositivo. Revisa tu conexión a Supabase.` });
        }
      })
      .catch((err) => {
        console.error('Supabase product sync err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `"${product.name}" se guardó solo en este dispositivo. Revisa tu conexión a Supabase.` });
      });
  };

  // Persists a new display order after the admin moves a product up/down
  const handleReorderProducts = (reordered: Product[]) => {
    const withOrder = reordered.map((p, index) => ({ ...p, sortOrder: index }));
    setProducts(withOrder);
    Promise.all(withOrder.map((p) => saveProductToSupabase(p)))
      .then((results) => {
        if (results.every(Boolean)) {
          addToast({ type: 'success', title: '↕️ Orden Actualizado', message: 'El nuevo orden de productos se guardó correctamente.' });
        } else {
          addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'El orden se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' });
        }
      })
      .catch((err) => {
        console.error('Supabase reorder sync err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'El orden se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' });
      });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromSupabase(productId)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'info', title: '🗑️ Producto Eliminado', message: 'El producto ha sido quitado del catálogo.' }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'Se quitó en este dispositivo, pero no se borró de Supabase. Revisa tu conexión.' }
        );
      })
      .catch((err) => {
        console.error('Supabase product delete err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'Se quitó en este dispositivo, pero no se borró de Supabase. Revisa tu conexión.' });
      });
  };

  // --- GALLERY HANDLERS (Prueba Social / Entregas Reales) ---
  const handleSaveGalleryItem = (item: GalleryItem) => {
    setGalleryItems((prev) => {
      const exists = prev.some((g) => g.id === item.id);
      if (exists) return prev.map((g) => (g.id === item.id ? item : g));
      return [...prev, item];
    });
    saveGalleryItemToSupabase(item)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'success', title: '💾 Foto Guardada', message: 'La foto se agregó a la galería de entregas reales.' }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'La foto se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' }
        );
      })
      .catch((err) => {
        console.error('Supabase gallery sync err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'La foto se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' });
      });
  };

  const handleDeleteGalleryItem = (itemId: string) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== itemId));
    deleteGalleryItemFromSupabase(itemId)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'info', title: '🗑️ Foto Eliminada', message: 'La foto se quitó de la galería.' }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'Se quitó en este dispositivo, pero no de Supabase. Revisa tu conexión.' }
        );
      })
      .catch((err) => {
        console.error('Supabase gallery delete err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'Se quitó en este dispositivo, pero no de Supabase. Revisa tu conexión.' });
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
    saveQuotationToSupabase(quotation)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'success', title: '💾 Cotización Actualizada', message: `Folio ${quotation.id} guardado con estado "${quotation.status}".` }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `Folio ${quotation.id} se guardó solo en este dispositivo. Revisa tu conexión a Supabase.` }
        );
      })
      .catch((err) => {
        console.error('Supabase quotation sync err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `Folio ${quotation.id} se guardó solo en este dispositivo. Revisa tu conexión a Supabase.` });
      });
  };

  const handleDeleteQuotation = (quotationId: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
    deleteQuotationFromSupabase(quotationId)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'info', title: '🗑️ Cotización Eliminada', message: `Folio ${quotationId} ha sido eliminado.` }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `Folio ${quotationId} se quitó en este dispositivo, pero no de Supabase. Revisa tu conexión.` }
        );
      })
      .catch((err) => {
        console.error('Supabase quotation delete err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: `Folio ${quotationId} se quitó en este dispositivo, pero no de Supabase. Revisa tu conexión.` });
      });
  };

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettingsToSupabase(newSettings)
      .then((ok) => {
        addToast(
          ok
            ? { type: 'success', title: '⚙️ Configuración Guardada', message: 'Los datos de contacto y taller han sido actualizados.' }
            : { type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'La configuración se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' }
        );
      })
      .catch((err) => {
        console.error('Supabase settings sync err:', err);
        addToast({ type: 'warning', title: '⚠️ No se sincronizó con la nube', message: 'La configuración se guardó solo en este dispositivo. Revisa tu conexión a Supabase.' });
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

  const scrollToBeforeAfter = () => {
    const el = document.getElementById('antes-despues');
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
          onViewWorkClick={scrollToBeforeAfter}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Interactive Before & After Restoration Slider */}
        <BeforeAfterSlider
          originalUrl={settings.beforeAfterOriginalUrl}
          restoredUrl={settings.beforeAfterRestoredUrl}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Real delivery photos / social proof, hidden until admin uploads real photos */}
        <GallerySection items={galleryItems} onOpenLightbox={handleOpenLightbox} />

        {/* 5 Benefits Overview from flyer */}
        <Benefits settings={settings} />

        {/* What we can create for you: services + occasions merged */}
        <WhatWeCreate
          examples={settings.categoryExamples || []}
          onOpenMedia={(url, mediaType, title) => handleOpenLightbox(url, title, mediaType)}
        />

        {/* 4-step purchase process */}
        <ProcessSteps />

        {/* Simple helper to point undecided visitors toward WhatsApp */}
        <NotSureWhatToChoose settings={settings} />

        {/* Products Catalog with Filters */}
        <ProductCatalog
          products={products}
          onAddToCart={handleAddToCart}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* Client Reviews */}
        <Testimonials />

        {/* Closing brand statement */}
        <EmotionalClosing />
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

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </Suspense>
      )}

      {/* Admin Panel Dashboard */}
      {isAdminPanelOpen && (
        <Suspense fallback={null}>
          <AdminDashboard
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            products={products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onReorderProducts={handleReorderProducts}
            quotations={quotations}
            onSaveQuotation={handleSaveQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            galleryItems={galleryItems}
            onSaveGalleryItem={handleSaveGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onLogout={handleLogout}
            onResetDefaults={handleResetDefaults}
          />
        </Suspense>
      )}

      {/* Full Image/Video Zoom Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImageUrl)}
        imageUrl={lightboxImageUrl}
        title={lightboxTitle}
        mediaType={lightboxMediaType}
        onClose={() => setLightboxImageUrl(null)}
      />

    </div>
  );
}
