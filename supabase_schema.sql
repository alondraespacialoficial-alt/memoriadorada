-- ============================================================
-- SCRIPT DE INICIALIZACIÓN PARA SUPABASE
-- Proyecto: Restauración y Enmarcado de Fotografías
-- ============================================================
-- Instrucciones de instalación:
-- 1. Ve a tu Dashboard de Supabase (https://app.supabase.com)
-- 2. Selecciona tu proyecto y abre el "SQL Editor" en el menú izquierdo
-- 3. Crea una "New Query", pega este código completo y haz clic en "RUN"
-- ============================================================

-- 1. TABLA DE PRODUCTOS
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
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla products ya existía antes de esta actualización, agrega la columna faltante
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. TABLA DE COTIZACIONES
CREATE TABLE IF NOT EXISTS public.quotations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  deposit NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pendiente',
  notes TEXT,
  reference_image_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla quotations ya existía antes de esta actualización, agrega la columna faltante
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS reference_image_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0;

-- 3. TABLA DE CONFIGURACIÓN DEL SITIO
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
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS category_examples JSONB DEFAULT '[]'::jsonb;

-- ============================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- Habilita acceso de lectura y escritura pública para la anon key
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para Products
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
CREATE POLICY "Permitir lectura publica de productos" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion/actualizacion de productos" ON public.products;
CREATE POLICY "Permitir insercion/actualizacion de productos" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Políticas para Quotations
DROP POLICY IF EXISTS "Permitir lectura de cotizaciones" ON public.quotations;
CREATE POLICY "Permitir lectura de cotizaciones" ON public.quotations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion/actualizacion de cotizaciones" ON public.quotations;
CREATE POLICY "Permitir insercion/actualizacion de cotizaciones" ON public.quotations FOR ALL USING (true) WITH CHECK (true);

-- Políticas para Site Settings
DROP POLICY IF EXISTS "Permitir lectura de configuraciones" ON public.site_settings;
CREATE POLICY "Permitir lectura de configuraciones" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion de configuraciones" ON public.site_settings;
CREATE POLICY "Permitir actualizacion de configuraciones" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DATOS INICIALES (SEMILLA / SEED DATA)
-- Inserta el catálogo base si las tablas están vacías
-- ============================================================

INSERT INTO public.products (id, name, category, dimensions, original_price, discount_price, has_discount_banner, discount_banner_text, image_url, description, is_popular)
VALUES
  ('prod-50x76', 'Restauración / Enmarcado Gigante', 'restauracion_enmarcado', '50x76 cm', 1450, 1190, true, '🔥 18% DESCUENTO', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 'Restaura y viste tu fotografía panorámica o retrato grande familiar. Incluye retiro de grietas, restauración de color y marco de gala a elegir.', true),
  ('prod-50x60', 'Restauración / Enmarcado Gran Formato', 'restauracion_enmarcado', '50x60 cm', 1250, 990, true, 'OFERTA ESPECIAL', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80', 'Ideal para cuadros familiares de sala o reconocimientos antiguos. Retoque digital exhaustivo e impresión fine art enmarcada.', true),
  ('prod-40x50', 'Restauración / Enmarcado Mediano Plus', 'restauracion_enmarcado', '40x50 cm', 980, 820, true, 'POPULAR', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Dimensiones ideales para pared. Eliminación de hongos, manchas de humedad y re-enfocado de facciones de época.', true),
  ('prod-30x40', 'Restauración / Enmarcado Estándar', 'restauracion_enmarcado', '30x40 cm', 780, 650, true, 'AHORRA $130', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', 'Nuestra medida estándar preferida para retratos individuales y bodas antiguas. Excelente balance visual.', false),
  ('prod-recreacion-oleo', 'Recreación Artística Efecto Óleo en Lienzo Canvas', 'recreacion_digital', '40x50 cm', 1650, 1350, true, 'PREMIUM ART', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', 'Convertimos tu fotografía antigua o desgastada en un cuadro tipo pintura al óleo digital impreso sobre lienzo genuino.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (
  id, logo_title, logo_subtitle, hero_title, hero_subtitle, hero_tagline, hero_image_url, hero_cta_text, whatsapp_number, whatsapp_display_phone, primary_color, enable_global_banner, global_banner_text, footer_address, footer_hours, footer_phone, benefits
)
VALUES (
  'main_settings',
  'CELEBRA TU EVENTO',
  'RESTAURACIÓN Y RECREACIÓN DE FOTOGRAFÍAS',
  'Restauración y Recreación de Fotografías, Cuadros y Marcos',
  'Damos nueva vida a tus recuerdos más preciados con cuidado artesanal y la más alta calidad digital y enmarcado.',
  'Tus recuerdos merecen ser conservados para siempre',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  'Ver Catálogo de Medidas',
  '5214442026872',
  '+52 1 444 202 6872',
  'gold',
  true,
  '✨ ¡Descuentos especiales en restauración + enmarcado completo! Solicita tu cotización por WhatsApp.',
  'San Luis Potosí, S.L.P. - Envíos a todo México',
  'Lunes a Sábado: 9:00 AM - 7:00 PM',
  '+52 1 444 202 6872',
  '[
    {"title": "Mejoramos colores y detalles", "description": "Recuperamos tonos vibrantes y nitidez perdida.", "icon": "Sparkles"},
    {"title": "Eliminamos rasgaduras y daños", "description": "Reconstrucción minuciosa de rostros y pliegues.", "icon": "ImagePlus"},
    {"title": "Impresión de alta calidad", "description": "Papeles fine-art con tintas duraderas anti-desvanecimiento.", "icon": "Printer"},
    {"title": "Enmarcado profesional listo para exhibir", "description": "Marcos de madera fina a la medida.", "icon": "Frame"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. TABLA DE GALERÍA (Prueba Social / Entregas Reales)
-- Fotos reales de trabajos entregados y clientes con sus cuadros,
-- administrables desde el panel admin sin necesidad de un desarrollador.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de galeria" ON public.gallery_items;
CREATE POLICY "Permitir lectura publica de galeria" ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion/actualizacion de galeria" ON public.gallery_items;
CREATE POLICY "Permitir insercion/actualizacion de galeria" ON public.gallery_items FOR ALL USING (true) WITH CHECK (true);

