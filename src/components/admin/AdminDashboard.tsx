import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  FileSpreadsheet,
  Palette,
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  Search,
  DollarSign,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Database,
  CloudUpload,
  CloudDownload,
  Copy,
  ExternalLink,
  AlertCircle,
  Upload,
  Printer,
  FileText
} from 'lucide-react';
import { Product, Quotation, SiteSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { QuotationReceiptModal } from '../QuotationReceiptModal';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  resetSupabaseClient,
  testSupabaseConnection,
  syncAllToSupabase,
  fetchProductsFromSupabase,
  fetchQuotationsFromSupabase,
  fetchSettingsFromSupabase,
  uploadImageToSupabase
} from '../../lib/supabase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  quotations: Quotation[];
  onSaveQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (quotationId: string) => void;
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => void;
  onLogout: () => void;
  onResetDefaults: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  quotations,
  onSaveQuotation,
  onDeleteQuotation,
  settings,
  onSaveSettings,
  onLogout,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'quotations' | 'settings' | 'banner' | 'database'>('products');

  // Supabase State
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [supabaseStatus, setSupabaseStatus] = useState<{ tested: boolean; success: boolean; message: string }>({
    tested: false,
    success: false,
    message: ''
  });
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isPullingSupabase, setIsPullingSupabase] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Auto-test connection on opening database tab if credentials exist
  useEffect(() => {
    if (activeTab === 'database' && supabaseUrl && supabaseKey && !supabaseStatus.tested) {
      handleTestSupabase(supabaseUrl, supabaseKey);
    }
  }, [activeTab]);

  const handleTestSupabase = async (urlToTest?: string, keyToTest?: string) => {
    setIsTestingSupabase(true);
    let targetUrl = (urlToTest ?? supabaseUrl).trim();
    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }
      targetUrl = targetUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    }
    setSupabaseUrl(targetUrl);

    const result = await testSupabaseConnection(targetUrl, keyToTest ?? supabaseKey);
    setSupabaseStatus({ tested: true, success: result.success, message: result.message });
    setIsTestingSupabase(false);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = supabaseUrl.trim();
    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }
      targetUrl = targetUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    }
    setSupabaseUrl(targetUrl);

    saveSupabaseCredentials(targetUrl, supabaseKey);
    resetSupabaseClient();
    await handleTestSupabase(targetUrl, supabaseKey);
  };

  const handleSyncDataToSupabase = async () => {
    setIsSyncingSupabase(true);
    setSyncFeedback(null);
    const res = await syncAllToSupabase(products, quotations, settings);
    setSyncFeedback(res.message);
    setIsSyncingSupabase(false);
  };

  const handlePullDataFromSupabase = async () => {
    setIsPullingSupabase(true);
    setSyncFeedback(null);
    try {
      const prods = await fetchProductsFromSupabase();
      const quots = await fetchQuotationsFromSupabase();
      const setts = await fetchSettingsFromSupabase();

      if (prods && prods.length > 0) {
        prods.forEach((p) => onSaveProduct(p));
      }
      if (quots && quots.length > 0) {
        quots.forEach((q) => onSaveQuotation(q));
      }
      if (setts) {
        onSaveSettings(setts);
      }

      setSyncFeedback('¡Datos descargados desde Supabase e integrados al sitio localmente con éxito!');
    } catch (e: any) {
      setSyncFeedback(`Error al descargar datos: ${e.message}`);
    } finally {
      setIsPullingSupabase(false);
    }
  };

  const handleCopySQL = () => {
    const sqlCode = `-- SCRIPT DE INICIALIZACIÓN DE TABLAS EN SUPABASE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  original_price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  has_discount_banner BOOLEAN DEFAULT false,
  discount_banner_text TEXT,
  image_url TEXT,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  deposit NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pendiente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  logo_title TEXT,
  logo_subtitle TEXT,
  logo_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_tagline TEXT,
  hero_image_url TEXT,
  before_original_url TEXT,
  before_restored_url TEXT,
  hero_cta_text TEXT,
  whatsapp_number TEXT,
  whatsapp_display_phone TEXT,
  primary_color TEXT,
  enable_global_banner BOOLEAN DEFAULT true,
  global_banner_text TEXT,
  footer_address TEXT,
  footer_hours TEXT,
  footer_phone TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla site_settings ya existía antes de esta actualización, agrega las columnas faltantes
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS before_original_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS before_restored_url TEXT;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
CREATE POLICY "Permitir lectura publica de productos" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir insercion/actualizacion de productos" ON public.products;
CREATE POLICY "Permitir insercion/actualizacion de productos" ON public.products FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir lectura de cotizaciones" ON public.quotations;
CREATE POLICY "Permitir lectura de cotizaciones" ON public.quotations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir insercion/actualizacion de cotizaciones" ON public.quotations;
CREATE POLICY "Permitir insercion/actualizacion de cotizaciones" ON public.quotations FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir lectura de configuraciones" ON public.site_settings;
CREATE POLICY "Permitir lectura de configuraciones" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir actualizacion de configuraciones" ON public.site_settings;
CREATE POLICY "Permitir actualizacion de configuraciones" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- BUCKET Y POLÍTICAS DE ALMACENAMIENTO DE IMÁGENES (STORAGE)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Permitir lectura publica de imagenes" ON storage.objects;
CREATE POLICY "Permitir lectura publica de imagenes" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Permitir subida de imagenes" ON storage.objects;
CREATE POLICY "Permitir subida de imagenes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Permitir edicion de imagenes" ON storage.objects;
CREATE POLICY "Permitir edicion de imagenes" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Permitir eliminacion de imagenes" ON storage.objects;
CREATE POLICY "Permitir eliminacion de imagenes" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');`;

    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  // Supabase Storage Image Upload
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleImageUpload = async (
    file: File | null,
    target: 'product' | 'logo' | 'hero' | 'before_original' | 'before_restored' | 'test'
  ) => {
    if (!file) return;
    setUploadingTarget(target);
    setUploadNotice(null);

    let finalUrl: string | null = null;

    try {
      const res = await uploadImageToSupabase(file, 'product-images');
      if (res.url) {
        finalUrl = res.url;
        setUploadNotice('¡Imagen subida a Supabase Storage con éxito!');
      } else {
        console.warn('Supabase Storage no configurado o falló, usando lector de archivo local base64:', res.error);
      }
    } catch (err) {
      console.warn('Error intentando subir imagen:', err);
    }

    // Always fallback to Base64 Data URL if cloud storage isn't active, so upload works 100% on PC / Mobile
    if (!finalUrl) {
      finalUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setUploadNotice(`📷 Imagen "${file.name}" cargada correctamente desde tu dispositivo.`);
    }

    if (target === 'product' && editingProduct) {
      setEditingProduct((prev) => (prev ? { ...prev, imageUrl: finalUrl! } : null));
    } else if (target === 'logo') {
      setLocalSettings((prev) => ({ ...prev, logoImageUrl: finalUrl! }));
    } else if (target === 'hero') {
      setLocalSettings((prev) => ({ ...prev, heroImageUrl: finalUrl! }));
    } else if (target === 'before_original') {
      setLocalSettings((prev) => ({ ...prev, beforeAfterOriginalUrl: finalUrl! }));
    } else if (target === 'before_restored') {
      setLocalSettings((prev) => ({ ...prev, beforeAfterRestoredUrl: finalUrl! }));
    }

    setUploadingTarget(null);
  };

  // Product Editing Modal / Form State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Quotation Editing Modal / Form State
  const [editingQuotation, setEditingQuotation] = useState<Partial<Quotation> | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

  // Receipt / Printable PDF Modal State
  const [selectedReceiptQuotation, setSelectedReceiptQuotation] = useState<Quotation | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Local copy of Site Settings for editing in settings tab
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [quotationSearch, setQuotationSearch] = useState('');

  if (!isOpen) return null;

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      category: 'restauracion_enmarcado',
      dimensions: '30x40 cm',
      originalPrice: 500,
      discountPrice: 400,
      hasDiscountBanner: true,
      discountBannerText: 'DESCUENTO',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      description: '',
      isPopular: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;
    onSaveProduct(editingProduct as Product);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // --- QUOTATION HANDLERS ---
  const handleOpenAddQuotation = () => {
    setEditingQuotation({
      id: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          productName: 'Restauración / Enmarcado Estándar',
          dimensions: '30x40 cm',
          quantity: 1,
          unitPrice: 650,
        },
      ],
      deposit: 300,
      totalAmount: 650,
      status: 'Pendiente',
      notes: '',
    });
    setIsQuotationModalOpen(true);
  };

  const handleOpenEditQuotation = (q: Quotation) => {
    setEditingQuotation({ ...q });
    setIsQuotationModalOpen(true);
  };

  const handleSaveQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotation || !editingQuotation.customerName) return;
    onSaveQuotation(editingQuotation as Quotation);
    setIsQuotationModalOpen(false);
    setEditingQuotation(null);
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.dimensions.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredQuotations = quotations.filter(
    (q) =>
      q.customerName.toLowerCase().includes(quotationSearch.toLowerCase()) ||
      q.id.toLowerCase().includes(quotationSearch.toLowerCase())
  );

  // Financial Stats
  const totalSales = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
  const totalDeposits = quotations.reduce((sum, q) => sum + q.deposit, 0);
  const pendingBalance = totalSales - totalDeposits;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080A0C] text-[#F3E5C8] font-sans">
      
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 bg-[#12151B] border-b border-[#3D3016] px-4 sm:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8F6C13] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0B0D10] rounded-[10px] flex items-center justify-center text-[#E2B755]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] to-[#D4AF37]">
              Panel de Administración
            </h1>
            <p className="text-xs text-[#A89878]">
              Charlitron Restauraciones • {settings.whatsappDisplayPhone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-[#211A0C] border border-[#524424] text-xs font-semibold text-[#A89878] hover:text-[#F3E5C8] transition-colors flex items-center gap-1.5"
            title="Restablecer catálogo y configuraciones por defecto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer Datos</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-xs font-semibold text-red-300 hover:bg-red-900/50 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-[#A89878] hover:text-[#F3E5C8] hover:bg-[#211A0C] rounded-lg transition-colors ml-2"
            title="Volver a la Tienda"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#3D3016] pb-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-lg'
                : 'bg-[#12151B] text-[#A89878] hover:text-[#F3E5C8] border border-[#3D3016]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos y Banners ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'quotations'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-lg'
                : 'bg-[#12151B] text-[#A89878] hover:text-[#F3E5C8] border border-[#3D3016]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cotizaciones Aceptadas ({quotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-lg'
                : 'bg-[#12151B] text-[#A89878] hover:text-[#F3E5C8] border border-[#3D3016]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Personalizar Landing</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'banner'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-lg'
                : 'bg-[#12151B] text-[#A89878] hover:text-[#F3E5C8] border border-[#3D3016]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Banner Promocional</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'database'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] shadow-lg'
                : 'bg-[#12151B] text-[#A89878] hover:text-[#F3E5C8] border border-[#3D3016]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Base de Datos / Supabase</span>
            {supabaseStatus.tested && supabaseStatus.success && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Conectado a Supabase" />
            )}
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827258]" />
                <input
                  type="text"
                  placeholder="Buscar producto o medida..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#12151B] border border-[#3D3016] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3E5C8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
                id="admin-add-product-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Producto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-[#12151B] border border-[#3D3016] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0D10] border-b border-[#3D3016] text-xs font-mono uppercase text-[#A89878]">
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Medidas</th>
                      <th className="py-3 px-4">Precio Regular</th>
                      <th className="py-3 px-4">Precio Oferta</th>
                      <th className="py-3 px-4">Banner Descuento</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262013] text-sm text-[#F3E5C8]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#181D26] transition-colors">
                        <td className="py-3.5 px-4 font-serif font-semibold flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#3D3016]"
                          />
                          <div>
                            <span className="block">{p.name}</span>
                            <span className="block text-[10px] text-[#A89878] font-sans">
                              ID: {p.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#E2B755]">
                          {p.dimensions}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#A89878]">
                          {formatCurrency(p.originalPrice)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#25D366]">
                          {p.discountPrice ? formatCurrency(p.discountPrice) : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.hasDiscountBanner ? (
                            <span className="bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B755] text-[10px] font-bold px-2 py-0.5 rounded">
                              Activo: {p.discountBannerText || 'OFERTA'}
                            </span>
                          ) : (
                            <span className="text-[#6B5A40] text-xs">Inactivo</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-2 rounded-lg bg-[#211A0C] border border-[#524424] text-[#E2B755] hover:bg-[#3D3016] transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 transition-colors"
                            title="Borrar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACCEPTED QUOTATIONS (REGISTRO DE COTIZACIONES) */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            
            {/* Stats Summary Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#12151B] border border-[#3D3016] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A89878] block">Total de Ventas Cotizadas</span>
                  <span className="font-serif text-2xl font-bold text-[#F3E5C8]">
                    {formatCurrency(totalSales)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#211A0C] border border-[#6B531F] flex items-center justify-center text-[#E2B755]">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#12151B] border border-[#3D3016] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A89878] block">Anticipos Recibidos</span>
                  <span className="font-serif text-2xl font-bold text-[#25D366]">
                    {formatCurrency(totalDeposits)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#1C271C] border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#12151B] border border-[#3D3016] p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A89878] block">Saldo Pendiente por Cobrar</span>
                  <span className="font-serif text-2xl font-bold text-[#D4AF37]">
                    {formatCurrency(pendingBalance)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#211A0C] border border-[#6B531F] flex items-center justify-center text-[#D4AF37]">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827258]" />
                <input
                  type="text"
                  placeholder="Buscar cliente o folio..."
                  value={quotationSearch}
                  onChange={(e) => setQuotationSearch(e.target.value)}
                  className="w-full bg-[#12151B] border border-[#3D3016] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3E5C8] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                onClick={handleOpenAddQuotation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 shadow-lg"
                id="admin-add-quotation-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nueva Cotización</span>
              </button>
            </div>

            {/* Quotations List Table */}
            <div className="bg-[#12151B] border border-[#3D3016] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0D10] border-b border-[#3D3016] text-xs font-mono uppercase text-[#A89878]">
                      <th className="py-3 px-4">Folio / Fecha</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Artículos</th>
                      <th className="py-3 px-4">Anticipo</th>
                      <th className="py-3 px-4">Pago Total</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262013] text-sm text-[#F3E5C8]">
                    {filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-[#181D26] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#E2B755]">
                          <div>{q.id}</div>
                          <div className="text-[10px] text-[#A89878]">{q.date}</div>
                        </td>
                        <td className="py-3.5 px-4 font-serif font-semibold">
                          <div>{q.customerName}</div>
                          <div className="text-[11px] text-[#A89878] font-sans">{q.customerPhone || 'Sin teléfono'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#C7BBA3]">
                          {q.items.map((i, idx) => (
                            <div key={idx}>
                              • {i.quantity}x {i.productName} ({i.dimensions})
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {q.deposit > 0 ? (
                            <span className="text-[#25D366] font-bold">{formatCurrency(q.deposit)}</span>
                          ) : (
                            <span className="text-[#A89878] text-[11px] font-sans italic">$0 (Sin Anticipo)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F3E5C8]">
                          {formatCurrency(q.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              q.status === 'Entregado'
                                ? 'bg-[#1C271C] border-[#25D366]/40 text-[#25D366]'
                                : q.status === 'En Proceso'
                                ? 'bg-[#211A0C] border-[#D4AF37]/50 text-[#E2B755]'
                                : 'bg-[#1A1D24] border-[#524424] text-[#A89878]'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReceiptQuotation(q);
                              setIsReceiptModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-[#211A0C] border border-[#D4AF37] text-[#D4AF37] hover:bg-[#3D3016] transition-colors inline-flex items-center gap-1"
                            title="Ver / Descargar Comprobante PDF o Recibo de Anticipo"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-[10px] font-bold">Comprobante</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditQuotation(q)}
                            className="p-2 rounded-lg bg-[#211A0C] border border-[#524424] text-[#E2B755] hover:bg-[#3D3016] transition-colors"
                            title="Editar cotización"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteQuotation(q.id)}
                            className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 transition-colors"
                            title="Borrar cotización"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LANDING PAGE CUSTOMIZATION (TEXTS, HERO, LOGO, BENEFITS) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
            
            {settingsSaved && (
              <div className="p-4 bg-[#1C271C] border border-[#25D366]/40 text-[#25D366] rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>¡Cambios guardados con éxito! Los textos e imágenes de la portada se han actualizado.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Branding Section */}
              <div className="bg-[#12151B] border border-[#3D3016] p-6 rounded-2xl space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#E2B755] border-b border-[#29200F] pb-2">
                  Identidad y Logo
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Título del Logo / Negocio
                  </label>
                  <input
                    type="text"
                    value={localSettings.logoTitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, logoTitle: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Subtítulo del Logo
                  </label>
                  <input
                    type="text"
                    value={localSettings.logoSubtitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, logoSubtitle: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Teléfono / WhatsApp de Recepción
                  </label>
                  <input
                    type="text"
                    value={localSettings.whatsappNumber}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Hero Portada Section */}
              <div className="bg-[#12151B] border border-[#3D3016] p-6 rounded-2xl space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#E2B755] border-b border-[#29200F] pb-2">
                  Textos Principales de la Portada (Hero)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Etiqueta / Tagline Superior
                  </label>
                  <input
                    type="text"
                    value={localSettings.heroTagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, heroTagline: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={localSettings.heroTitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Subtítulo / Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={localSettings.heroSubtitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1">
                    Imagen Principal de Portada
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={localSettings.heroImageUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroImageUrl: e.target.value })}
                      className="flex-1 bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                      placeholder="https://... o subir archivo"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] rounded-xl text-[#F3E5C8] flex items-center gap-1.5 text-xs font-bold shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{uploadingTarget === 'hero' ? 'Subiendo...' : 'Subir'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'hero');
                        }}
                      />
                    </label>
                  </div>
                  {localSettings.heroImageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={localSettings.heroImageUrl} alt="Hero preview" className="w-16 h-10 object-cover rounded-lg border border-[#3D3016]" />
                      <span className="text-[10px] text-[#A89878]">Vista previa de portada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Before & After Slider Customization Section */}
              <div className="bg-[#12151B] border border-[#3D3016] p-6 rounded-2xl space-y-4 lg:col-span-2">
                <h3 className="font-serif text-lg font-bold text-[#E2B755] border-b border-[#29200F] pb-2 flex items-center justify-between">
                  <span>Fotos del Deslizador "Antes y Después"</span>
                  <span className="text-xs font-sans text-[#A89878] font-normal">Sube tus ejemplos reales desde PC o Celular</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#A89878]">
                      1. Foto Original / Maltratada (Lado Izquierdo - Antes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={localSettings.beforeAfterOriginalUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, beforeAfterOriginalUrl: e.target.value })}
                        className="flex-1 bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                        placeholder="https://... o subir archivo"
                      />
                      <label className="cursor-pointer px-3.5 py-2 bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] rounded-xl text-[#F3E5C8] flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{uploadingTarget === 'before_original' ? 'Subiendo...' : 'Subir PC / Cel'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'before_original');
                          }}
                        />
                      </label>
                    </div>
                    {localSettings.beforeAfterOriginalUrl && (
                      <div className="mt-2 flex items-center gap-3 bg-[#080A0C] p-2 rounded-xl border border-[#3D3016]">
                        <img
                          src={localSettings.beforeAfterOriginalUrl}
                          alt="Original preview"
                          className="w-14 h-14 object-cover rounded-lg border border-[#3D3016]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#E2B755]">Vista previa "Antes"</p>
                          <p className="text-[10px] text-[#A89878]">Foto sin restaurar</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* After Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#A89878]">
                      2. Foto Restaurada & Enmarcada (Lado Derecho - Después)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={localSettings.beforeAfterRestoredUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, beforeAfterRestoredUrl: e.target.value })}
                        className="flex-1 bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                        placeholder="https://... o subir archivo"
                      />
                      <label className="cursor-pointer px-3.5 py-2 bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] rounded-xl text-[#F3E5C8] flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{uploadingTarget === 'before_restored' ? 'Subiendo...' : 'Subir PC / Cel'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'before_restored');
                          }}
                        />
                      </label>
                    </div>
                    {localSettings.beforeAfterRestoredUrl && (
                      <div className="mt-2 flex items-center gap-3 bg-[#080A0C] p-2 rounded-xl border border-[#3D3016]">
                        <img
                          src={localSettings.beforeAfterRestoredUrl}
                          alt="Restored preview"
                          className="w-14 h-14 object-cover rounded-lg border border-[#3D3016]"
                        />
                        <div>
                          <p className="text-xs font-bold text-emerald-400">Vista previa "Después"</p>
                          <p className="text-[10px] text-[#A89878]">Resultado final restaurado</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#8F6C13] text-[#0B0D10] font-extrabold text-sm hover:brightness-110 shadow-lg flex items-center gap-2"
              id="admin-save-settings-btn"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de la Landing</span>
            </button>

          </form>
        )}

        {/* TAB 4: GLOBAL PROMO BANNER */}
        {activeTab === 'banner' && (
          <form onSubmit={handleSaveSettingsSubmit} className="bg-[#12151B] border border-[#3D3016] p-6 rounded-2xl space-y-6 max-w-2xl">
            <h3 className="font-serif text-lg font-bold text-[#E2B755] border-b border-[#29200F] pb-2">
              Configuración del Banner Superior de Oferta
            </h3>

            <div className="flex items-center gap-3 bg-[#080A0C] p-4 rounded-xl border border-[#3D3016]">
              <input
                type="checkbox"
                id="enableGlobalBanner"
                checked={localSettings.enableGlobalBanner}
                onChange={(e) => setLocalSettings({ ...localSettings, enableGlobalBanner: e.target.checked })}
                className="w-5 h-5 accent-[#D4AF37] rounded"
              />
              <label htmlFor="enableGlobalBanner" className="text-sm font-bold text-[#F3E5C8] cursor-pointer">
                Mostrar Banner Promocional en la parte superior de toda la web
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A89878] mb-1">
                Texto del Banner Promocional
              </label>
              <input
                type="text"
                value={localSettings.globalBannerText}
                onChange={(e) => setLocalSettings({ ...localSettings, globalBannerText: e.target.value })}
                className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2.5 text-xs text-[#F3E5C8] focus:border-[#D4AF37]"
                placeholder="🔥 ¡Aprovecha hasta 20% de descuento en restauración esta semana!"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#8F6C13] text-[#0B0D10] font-extrabold text-sm hover:brightness-110 shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Actualizar Banner Promocional</span>
            </button>
          </form>
        )}

        {/* TAB 5: SUPABASE DATABASE CONNECTION & SYNC */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            
            {/* Status & Quick Actions Bar */}
            <div className="bg-[#12151B] border border-[#3D3016] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#29200F] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#211A0C] border border-[#524424] text-[#E2B755]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#F3E5C8] flex items-center gap-2">
                      <span>Integración con Supabase Cloud</span>
                      {supabaseStatus.tested && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            supabaseStatus.success
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {supabaseStatus.success ? 'Conectado' : 'Sin Configurar / Error'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#A89878]">
                      Sincroniza tus productos, cotizaciones y configuraciones en tiempo real con tu base de datos de Supabase.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => handleTestSupabase()}
                    disabled={isTestingSupabase}
                    className="px-4 py-2 rounded-xl bg-[#211A0C] border border-[#524424] text-xs font-bold text-[#F3E5C8] hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isTestingSupabase ? 'Verificando...' : 'Probar Conexión'}</span>
                  </button>

                  <button
                    onClick={handleSyncDataToSupabase}
                    disabled={isSyncingSupabase || !supabaseUrl || !supabaseKey}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] font-extrabold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
                  >
                    <CloudUpload className={`w-4 h-4 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingSupabase ? 'Subiendo datos...' : 'Subir Todo a Supabase'}</span>
                  </button>

                  <button
                    onClick={handlePullDataFromSupabase}
                    disabled={isPullingSupabase || !supabaseUrl || !supabaseKey}
                    className="px-4 py-2 rounded-xl bg-[#1A222D] border border-[#2E3F54] text-[#7FB3D5] font-bold text-xs hover:border-[#4299E1] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <CloudDownload className={`w-4 h-4 ${isPullingSupabase ? 'animate-pulse' : ''}`} />
                    <span>{isPullingSupabase ? 'Descargando...' : 'Cargar desde Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {supabaseStatus.tested && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-3 ${
                    supabaseStatus.success
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                  }`}
                >
                  {supabaseStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{supabaseStatus.message}</p>
                    {!supabaseStatus.success && (
                      <p className="mt-1 text-[11px] text-amber-400/80">
                        Asegúrate de copiar el código SQL de abajo e ingresarlo en el SQL Editor de tu proyecto en Supabase para crear las tablas necesarias.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Feedback Message */}
              {syncFeedback && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>{syncFeedback}</span>
                </div>
              )}
            </div>

            {/* Grid with Instructions & Credentials */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Credentials Form */}
              <div className="lg:col-span-6 bg-[#12151B] border border-[#3D3016] rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-serif text-base font-bold text-[#E2B755] flex items-center gap-2 border-b border-[#29200F] pb-2">
                  <span>1. Ingresa tus Claves de Supabase</span>
                </h3>
                <p className="text-xs text-[#A89878]">
                  Puedes obtener la URL y la Anon Key desde tu proyecto en{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D4AF37] underline inline-flex items-center gap-1 hover:text-[#FFF6E5]"
                  >
                    Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  ir a <strong>Project Settings &gt; API</strong>.
                </p>

                <form onSubmit={handleSaveCredentials} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89878] mb-1">
                      Supabase Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      required
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://abcdefghijklm.supabase.co"
                      className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2.5 text-xs text-[#F3E5C8] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89878] mb-1">
                      Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2.5 text-xs text-[#F3E5C8] focus:border-[#D4AF37] focus:outline-none resize-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0D10] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Claves y Conectar</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: SQL Schema Instructions */}
              <div className="lg:col-span-6 bg-[#12151B] border border-[#3D3016] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#29200F] pb-2">
                  <h3 className="font-serif text-base font-bold text-[#E2B755] flex items-center gap-2">
                    <span>2. Script SQL para Crear Tablas</span>
                  </h3>
                  <button
                    onClick={handleCopySQL}
                    className="px-3 py-1.5 rounded-lg bg-[#211A0C] border border-[#524424] text-xs font-bold text-[#D4AF37] hover:bg-[#322712] transition-colors flex items-center gap-1.5"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#A89878]">
                  Copia este código, entra a tu dashboard de Supabase &gt; <strong>SQL Editor</strong>, pega y haz clic en <strong>RUN</strong>:
                </p>

                <div className="bg-[#080A0C] border border-[#3D3016] rounded-xl p-3 overflow-x-auto max-h-56 font-mono text-[11px] text-amber-200/80 leading-relaxed">
                  <pre>{`-- CREACIÓN DE TABLAS EN SUPABASE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  original_price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  has_discount_banner BOOLEAN DEFAULT false,
  discount_banner_text TEXT,
  image_url TEXT,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  deposit NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pendiente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  logo_title TEXT,
  logo_subtitle TEXT,
  logo_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_tagline TEXT,
  hero_image_url TEXT,
  hero_cta_text TEXT,
  whatsapp_number TEXT,
  whatsapp_display_phone TEXT,
  primary_color TEXT,
  enable_global_banner BOOLEAN DEFAULT true,
  global_banner_text TEXT,
  footer_address TEXT,
  footer_hours TEXT,
  footer_phone TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}</pre>
                </div>

                <div className="p-3 bg-[#1A160E] border border-[#423315] rounded-xl text-[11px] text-[#C9B17E] space-y-1">
                  <p className="font-bold text-[#F3E5C8]">Pasos rápidos en Supabase:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Haz clic en el botón <strong>Copiar Código SQL</strong> de arriba.</li>
                    <li>Ve a tu proyecto en Supabase &gt; Abre el menú <strong>SQL Editor</strong>.</li>
                    <li>Pega el código en la ventana de consulta y haz clic en <strong>RUN</strong>.</li>
                    <li>Regresa aquí y presiona <strong>Subir Todo a Supabase</strong> para migrar tus datos actualizados.</li>
                  </ol>
                </div>
              </div>

            </div>

            {/* Storage Bucket Setup Card */}
            <div className="bg-[#12151B] border border-[#3D3016] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-base font-bold text-[#E2B755] flex items-center gap-2 border-b border-[#29200F] pb-2">
                <Upload className="w-5 h-5 text-[#D4AF37]" />
                <span>3. Configurar Supabase Storage para Almacenar Imágenes</span>
              </h3>

              <p className="text-xs text-[#A89878] leading-relaxed">
                Para subir fotos de tus productos o imágenes de portada directamente desde el panel de administración, crea un bucket llamado <strong className="text-[#F3E5C8]">product-images</strong> con acceso público en Supabase.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#080A0C] border border-[#3D3016] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#F3E5C8]">Opción A: Crear Bucket desde el Dashboard</h4>
                  <ol className="list-decimal list-inside space-y-1 text-[#A89878] text-[11px]">
                    <li>Abre Supabase &gt; Menú lateral <strong>Storage</strong>.</li>
                    <li>Haz clic en <strong>New Bucket</strong>.</li>
                    <li>Nombre exacto: <code className="text-[#D4AF37] font-bold">product-images</code></li>
                    <li>Activa la casilla <strong className="text-[#F3E5C8]">Public Bucket</strong>.</li>
                    <li>Haz clic en <strong>Save</strong>.</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#080A0C] border border-[#3D3016] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#F3E5C8] flex items-center justify-between">
                    <span>Opción B: Crear con SQL</span>
                  </h4>
                  <pre className="text-[10px] font-mono text-amber-200/80 bg-[#12151B] p-2.5 rounded-lg overflow-x-auto leading-relaxed">
{`INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Permitir subida publica de imagenes"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Permitir lectura publica de imagenes"
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');`}
                  </pre>
                </div>
              </div>

              {/* Upload Test Box */}
              <div className="pt-2 border-t border-[#29200F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#F3E5C8]">Probar Subida a Storage</h4>
                  <p className="text-[11px] text-[#A89878]">Prueba subir una imagen de prueba a tu bucket de Supabase.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="cursor-pointer px-4 py-2 bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] rounded-xl text-[#F3E5C8] text-xs font-bold flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>{uploadingTarget === 'test' ? 'Subiendo...' : 'Probar Subir Imagen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'test');
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadNotice && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs font-semibold">
                  {uploadNotice}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* PRODUCT EDIT/ADD MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="bg-[#12151B] border-2 border-[#54431B] rounded-2xl p-6 max-w-lg w-full text-[#F3E5C8] space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#29200F] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#E2B755]">
                {editingProduct.id ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[#A89878] hover:text-[#F3E5C8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89878] mb-1 font-semibold">Nombre del Servicio/Producto *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                  placeholder="Restauración / Enmarcado Mediano"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Medidas (cm) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.dimensions || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                    placeholder="30x40 cm"
                  />
                </div>

                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Categoría</label>
                  <select
                    value={editingProduct.category || 'restauracion_enmarcado'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                  >
                    <option value="restauracion_enmarcado">Restauración y Enmarcado</option>
                    <option value="recreacion_digital">Recreación Digital / Lienzo Óleo</option>
                    <option value="cuadros_marcos">Marcos y Cuadros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Precio Regular ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.originalPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                  />
                </div>

                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Precio Oferta ($ MXN)</label>
                  <input
                    type="number"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Discount Banner Toggle */}
              <div className="p-3 bg-[#080A0C] rounded-xl border border-[#3D3016] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasDiscountBanner"
                    checked={editingProduct.hasDiscountBanner || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, hasDiscountBanner: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <label htmlFor="hasDiscountBanner" className="font-bold text-[#F3E5C8] cursor-pointer">
                    Activar Badge de Descuento
                  </label>
                </div>

                {editingProduct.hasDiscountBanner && (
                  <div>
                    <label className="block text-[#A89878] mb-1">Texto del Badge</label>
                    <input
                      type="text"
                      value={editingProduct.discountBannerText || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discountBannerText: e.target.value })}
                      className="w-full bg-[#12151B] border border-[#3D3016] rounded-lg px-2.5 py-1.5 text-[#F3E5C8]"
                      placeholder="🔥 15% DESCUENTO"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#A89878] mb-1 font-semibold">Imagen del Producto / Servicio</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="flex-1 bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                    placeholder="URL o sube un archivo..."
                  />
                  <label className="cursor-pointer px-3 py-2 bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] rounded-xl text-[#F3E5C8] flex items-center gap-1.5 text-xs font-bold shrink-0">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{uploadingTarget === 'product' ? 'Subiendo...' : 'Subir'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'product');
                      }}
                    />
                  </label>
                </div>
                {editingProduct.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editingProduct.imageUrl} alt="Vista previa" className="w-12 h-12 object-cover rounded-lg border border-[#3D3016]" />
                    <span className="text-[10px] text-[#A89878]">Vista previa de la foto</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#A89878] mb-1 font-semibold">Descripción del Servicio</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#211A0C] text-[#A89878] hover:text-[#F3E5C8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-[#0B0D10] font-bold hover:brightness-110"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTATION EDIT/ADD MODAL */}
      {isQuotationModalOpen && editingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D10]/85 backdrop-blur-md">
          <div className="bg-[#12151B] border-2 border-[#54431B] rounded-2xl p-6 max-w-lg w-full text-[#F3E5C8] space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#29200F] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#E2B755]">
                {editingQuotation.id ? `Cotización ${editingQuotation.id}` : 'Registrar Cotización'}
              </h3>
              <button onClick={() => setIsQuotationModalOpen(false)} className="text-[#A89878] hover:text-[#F3E5C8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89878] mb-1 font-semibold">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={editingQuotation.customerName || ''}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, customerName: e.target.value })}
                  className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Teléfono</label>
                  <input
                    type="text"
                    value={editingQuotation.customerPhone || ''}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, customerPhone: e.target.value })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                  />
                </div>

                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Estado de la Cotización</label>
                  <select
                    value={editingQuotation.status || 'Pendiente'}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, status: e.target.value as any })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Listo">Listo para Entregar</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Anticipo ($ MXN)</label>
                  <input
                    type="number"
                    value={editingQuotation.deposit || 0}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, deposit: Number(e.target.value) })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#25D366] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#A89878] mb-1 font-semibold">Pago Total ($ MXN)</label>
                  <input
                    type="number"
                    value={editingQuotation.totalAmount || 0}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, totalAmount: Number(e.target.value) })}
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#E2B755] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A89878] mb-1 font-semibold">Notas de Trabajo</label>
                <textarea
                  rows={2}
                  value={editingQuotation.notes || ''}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, notes: e.target.value })}
                  className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3 py-2 text-[#F3E5C8] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#211A0C] text-[#A89878] hover:text-[#F3E5C8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-[#0B0D10] font-bold hover:brightness-110"
                >
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt / Printable PDF Modal */}
      {isReceiptModalOpen && selectedReceiptQuotation && (
        <QuotationReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          quotation={selectedReceiptQuotation}
          settings={settings}
          isAdminView={true}
          onUpdateDeposit={(id, newDeposit) => {
            const updated = { ...selectedReceiptQuotation, deposit: newDeposit };
            setSelectedReceiptQuotation(updated);
            onSaveQuotation(updated);
          }}
          onUpdateStatus={(id, newStatus) => {
            const updated = { ...selectedReceiptQuotation, status: newStatus };
            setSelectedReceiptQuotation(updated);
            onSaveQuotation(updated);
          }}
        />
      )}

    </div>
  );
};
