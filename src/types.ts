export interface Product {
  id: string;
  name: string;
  category: 'restauracion_enmarcado' | 'recreacion_digital' | 'cuadros_marcos' | 'lienzo_oleo';
  dimensions: string; // e.g. "50x76 cm", "30x40 cm"
  originalPrice: number;
  discountPrice?: number;
  hasDiscountBanner: boolean;
  discountBannerText?: string;
  imageUrl: string;
  description: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customNote?: string;
}

export interface Quotation {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string; // ISO date string or formatted date
  items: {
    productName: string;
    dimensions: string;
    quantity: number;
    unitPrice: number;
  }[];
  deposit: number; // Anticipo
  totalAmount: number; // Pago total
  status: 'Pendiente' | 'En Proceso' | 'Listo' | 'Entregado' | 'Cancelado';
  notes?: string;
  referenceImageUrl?: string;
}

export interface SiteSettings {
  logoTitle: string;
  logoSubtitle: string;
  logoImageUrl?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroImageUrl: string;
  beforeAfterOriginalUrl?: string;
  beforeAfterRestoredUrl?: string;
  heroCtaText: string;
  whatsappNumber: string; // e.g. "5214442026872"
  whatsappDisplayPhone: string; // e.g. "+52 1 444 202 6872"
  primaryColor: string; // e.g. "gold"
  enableGlobalBanner: boolean;
  globalBannerText: string;
  footerAddress: string;
  footerHours: string;
  footerPhone: string;
  benefits: {
    title: string;
    description: string;
    icon: string;
  }[];
}
