import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Quotation, SiteSettings } from '../types';

// Retrieve credentials from environment variables or custom localStorage values
export function getSupabaseCredentials(): { url: string; key: string } {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  let customUrl = (localStorage.getItem('supabase_custom_url') || envUrl).trim();
  let customKey = (localStorage.getItem('supabase_custom_key') || envKey).trim();

  if (customUrl) {
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      customUrl = `https://${customUrl}`;
    }
    // Remove /rest/v1 or /rest/v1/ if user accidentally pasted REST endpoint URL
    customUrl = customUrl.replace(/\/rest\/v1\/?$/i, '');
    // Clean trailing slashes
    customUrl = customUrl.replace(/\/+$/, '');
  }

  return {
    url: customUrl,
    key: customKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  let cleanUrl = url.trim();
  if (cleanUrl) {
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/i, '');
    cleanUrl = cleanUrl.replace(/\/+$/, '');
    localStorage.setItem('supabase_custom_url', cleanUrl);
  } else {
    localStorage.removeItem('supabase_custom_url');
  }

  if (key) localStorage.setItem('supabase_custom_key', key.trim());
  else localStorage.removeItem('supabase_custom_key');

  resetSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  try {
    if (!supabaseInstance || lastUsedUrl !== url || lastUsedKey !== key) {
      supabaseInstance = createClient(url, key);
      lastUsedUrl = url;
      lastUsedKey = key;
    }
    return supabaseInstance;
  } catch (error) {
    console.error('Error al instanciar cliente de Supabase:', error);
    return null;
  }
}

// Reset instance when keys are changed in admin UI
export function resetSupabaseClient() {
  supabaseInstance = null;
  lastUsedUrl = '';
  lastUsedKey = '';
}

// Test connection
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const creds = getSupabaseCredentials();
    let url = customUrl !== undefined ? customUrl.trim() : creds.url;
    const key = customKey !== undefined ? customKey.trim() : creds.key;

    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      url = url.replace(/\/rest\/v1\/?$/i, '');
      url = url.replace(/\/+$/, '');
    }

    if (!url || !key) {
      return { success: false, message: 'Ingresa la URL y la Anon Key de Supabase para conectar.' };
    }

    const testClient = createClient(url, key);
    const { error } = await testClient.from('products').select('id').limit(1);

    if (error) {
      // Check if table missing vs auth error
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Conexión exitosa, pero la tabla "products" no existe. Ejecuta el script SQL en el SQL Editor de Supabase.',
        };
      }
      return { success: false, message: `Error de conexión: ${error.message}` };
    }

    return { success: true, message: '¡Conexión exitosa con Supabase! Tablas detectadas correctamente.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error desconocido al probar conexión.' };
  }
}

// --- PRODUCTS API ---

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return null;
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      dimensions: row.dimensions,
      originalPrice: Number(row.original_price),
      discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
      hasDiscountBanner: Boolean(row.has_discount_banner),
      discountBannerText: row.discount_banner_text || undefined,
      imageUrl: row.image_url || '',
      description: row.description || '',
      isPopular: Boolean(row.is_popular),
    }));
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = {
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      original_price: product.originalPrice,
      discount_price: product.discountPrice ?? null,
      has_discount_banner: product.hasDiscountBanner ?? false,
      discount_banner_text: product.discountBannerText ?? null,
      image_url: product.imageUrl,
      description: product.description,
      is_popular: product.isPopular ?? false,
    };

    const { error } = await client.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving product to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Save product error:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete product error:', err);
    return false;
  }
}

// --- QUOTATIONS API ---

export async function fetchQuotationsFromSupabase(): Promise<Quotation[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('quotations').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching quotations from Supabase:', error);
      return null;
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || undefined,
      customerEmail: row.customer_email || undefined,
      date: row.date,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      deposit: Number(row.deposit || 0),
      totalAmount: Number(row.total_amount || 0),
      status: row.status as Quotation['status'],
      notes: row.notes || undefined,
    }));
  } catch (err) {
    console.error('Supabase quotations fetch error:', err);
    return null;
  }
}

export async function saveQuotationToSupabase(quotation: Quotation): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = {
      id: quotation.id,
      customer_name: quotation.customerName,
      customer_phone: quotation.customerPhone ?? null,
      customer_email: quotation.customerEmail ?? null,
      date: quotation.date,
      items: quotation.items,
      deposit: quotation.deposit,
      total_amount: quotation.totalAmount,
      status: quotation.status,
      notes: quotation.notes ?? null,
    };

    const { error } = await client.from('quotations').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving quotation to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Save quotation error:', err);
    return false;
  }
}

export async function deleteQuotationFromSupabase(quotationId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('quotations').delete().eq('id', quotationId);
    if (error) {
      console.error('Error deleting quotation from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete quotation error:', err);
    return false;
  }
}

// --- SITE SETTINGS API ---

export async function fetchSettingsFromSupabase(): Promise<SiteSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('site_settings').select('*').eq('id', 'main_settings').maybeSingle();

    if (error) {
      console.error('Error fetching settings from Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      logoTitle: data.logo_title || '',
      logoSubtitle: data.logo_subtitle || '',
      logoImageUrl: data.logo_image_url || undefined,
      heroTitle: data.hero_title || '',
      heroSubtitle: data.hero_subtitle || '',
      heroTagline: data.hero_tagline || '',
      heroImageUrl: data.hero_image_url || '',
      heroCtaText: data.hero_cta_text || '',
      whatsappNumber: data.whatsapp_number || '',
      whatsappDisplayPhone: data.whatsapp_display_phone || '',
      primaryColor: data.primary_color || 'gold',
      enableGlobalBanner: Boolean(data.enable_global_banner),
      globalBannerText: data.global_banner_text || '',
      footerAddress: data.footer_address || '',
      footerHours: data.footer_hours || '',
      footerPhone: data.footer_phone || '',
      benefits: typeof data.benefits === 'string' ? JSON.parse(data.benefits) : data.benefits || [],
    };
  } catch (err) {
    console.error('Supabase settings fetch error:', err);
    return null;
  }
}

export async function saveSettingsToSupabase(settings: SiteSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = {
      id: 'main_settings',
      logo_title: settings.logoTitle,
      logo_subtitle: settings.logoSubtitle,
      logo_image_url: settings.logoImageUrl ?? null,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      hero_tagline: settings.heroTagline,
      hero_image_url: settings.heroImageUrl,
      hero_cta_text: settings.heroCtaText,
      whatsapp_number: settings.whatsappNumber,
      whatsapp_display_phone: settings.whatsappDisplayPhone,
      primary_color: settings.primaryColor,
      enable_global_banner: settings.enableGlobalBanner,
      global_banner_text: settings.globalBannerText,
      footer_address: settings.footerAddress,
      footer_hours: settings.footerHours,
      footer_phone: settings.footerPhone,
      benefits: settings.benefits,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('site_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving settings to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Save settings error:', err);
    return false;
  }
}

// --- BULK SYNC / UPLOAD ---

export async function syncAllToSupabase(products: Product[], quotations: Quotation[], settings: SiteSettings): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Cliente de Supabase no configurado.' };

  try {
    let savedProdCount = 0;
    for (const p of products) {
      const ok = await saveProductToSupabase(p);
      if (ok) savedProdCount++;
    }

    let savedQuotCount = 0;
    for (const q of quotations) {
      const ok = await saveQuotationToSupabase(q);
      if (ok) savedQuotCount++;
    }

    const settingsOk = await saveSettingsToSupabase(settings);

    return {
      success: true,
      message: `¡Sincronización completada! ${savedProdCount} productos, ${savedQuotCount} cotizaciones y configuraciones subidos exitosamente a Supabase.`,
    };
  } catch (err: any) {
    return { success: false, message: `Error durante la sincronización: ${err.message}` };
  }
}

// --- SUPABASE STORAGE API ---

export async function uploadImageToSupabase(
  file: File,
  bucketName = 'product-images'
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { url: null, error: 'Supabase no está configurado. Conecta tus claves primero.' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error: `Error al subir a Supabase Storage: ${error.message}` };
    }

    const { data: publicData } = client.storage.from(bucketName).getPublicUrl(data.path);

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Upload catch error:', err);
    return { url: null, error: err.message || 'Error inesperado al subir la imagen.' };
  }
}

