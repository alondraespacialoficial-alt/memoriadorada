import { Product, Quotation, SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  logoTitle: 'MEMORIA DORADA',
  logoSubtitle: 'Recuerdos que permanecen',
  logoImageUrl: 'https://wfirzhgszrxszktmewgr.supabase.co/storage/v1/object/public/product-images/e5f32da0-afd2-49a2-93b4-109c0feea245.png',
  heroTitle: 'Tus recuerdos merecen un lugar para quedarse.',
  heroSubtitle: 'Transformamos fotografías, historias y momentos especiales en obras que puedes volver a mirar todos los días.',
  heroTagline: 'Porque los momentos pasan... los recuerdos permanecen.',
  heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  beforeAfterOriginalUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  beforeAfterRestoredUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  heroCtaText: 'Cuéntanos tu idea',
  whatsappNumber: '5214442026872',
  whatsappDisplayPhone: '+52 1 444 202 6872',
  primaryColor: 'gold',
  enableGlobalBanner: true,
  globalBannerText: '✨ ¡Descuentos especiales en restauración + enmarcado completo! Solicita tu cotización por WhatsApp.',
  footerAddress: 'San Luis Potosí, S.L.P. - Envíos a todo México',
  footerHours: 'Lunes a Sábado: 9:00 AM - 7:00 PM',
  footerPhone: '+52 1 444 202 6872',
  benefits: [
    {
      title: 'Mejoramos colores y detalles',
      description: 'Recuperamos tonos vibrantes y nitidez perdida por el paso del tiempo.',
      icon: 'Sparkles'
    },
    {
      title: 'Eliminamos rasgaduras, manchas y daños',
      description: 'Reconstrucción minuciosa de rostros, fondos y pliegues maltratados.',
      icon: 'ImagePlus'
    },
    {
      title: 'Impresión de alta calidad',
      description: 'Papeles fotográficos fine-art con tintas duraderas anti-desvanecimiento.',
      icon: 'Printer'
    },
    {
      title: 'Enmarcado profesional listo para exhibir',
      description: 'Marcos de madera fina y molduras hechas a la medida de tu fotografía.',
      icon: 'Frame'
    },
    {
      title: 'Recuerdos que perduran para siempre',
      description: 'Preserva el legado histórico de tu familia con acabado de galería.',
      icon: 'Heart'
    }
  ],
  categoryExamples: []
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-50x76',
    name: 'Restauración / Enmarcado Gigante',
    category: 'restauracion_enmarcado',
    dimensions: '50x76 cm',
    originalPrice: 1450,
    discountPrice: 1190,
    hasDiscountBanner: true,
    discountBannerText: '🔥 18% DESCUENTO',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Restaura y viste tu fotografía panorámica o retrato grande familiar. Incluye retiro de grietas, restauración de color y marco de gala a elegir.',
    isPopular: true
  },
  {
    id: 'prod-50x60',
    name: 'Restauración / Enmarcado Gran Formato',
    category: 'restauracion_enmarcado',
    dimensions: '50x60 cm',
    originalPrice: 1250,
    discountPrice: 990,
    hasDiscountBanner: true,
    discountBannerText: 'OFERTA ESPECIAL',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    description: 'Ideal para cuadros familiares de sala o reconocimientos antiguos. Retoque digital exhaustivo e impresión fine art enmarcada.',
    isPopular: true
  },
  {
    id: 'prod-40x50',
    name: 'Restauración / Enmarcado Mediano Plus',
    category: 'restauracion_enmarcado',
    dimensions: '40x50 cm',
    originalPrice: 980,
    discountPrice: 820,
    hasDiscountBanner: true,
    discountBannerText: 'POPULAR',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    description: 'Dimensiones ideales para pared. Eliminación de hongos, manchas de humedad y re-enfocado de facciones de época.',
    isPopular: true
  },
  {
    id: 'prod-30x40',
    name: 'Restauración / Enmarcado Estándar',
    category: 'restauracion_enmarcado',
    dimensions: '30x40 cm',
    originalPrice: 780,
    discountPrice: 650,
    hasDiscountBanner: true,
    discountBannerText: 'AHORRA $130',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Nuestra medida estándar preferida para retratos individuales y bodas antiguas. Excelente balance visual.'
  },
  {
    id: 'prod-29x42',
    name: 'Restauración / Enmarcado Oficio (A3)',
    category: 'restauracion_enmarcado',
    dimensions: '29.7x42 cm',
    originalPrice: 720,
    discountPrice: 590,
    hasDiscountBanner: false,
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=800&q=80',
    description: 'Perfecto para diplomas, actas antiguas y retratos institucionales que requieren enmarcado sobrio y limpio.'
  },
  {
    id: 'prod-24x30',
    name: 'Restauración / Enmarcado Galería',
    category: 'restauracion_enmarcado',
    dimensions: '24x30 cm',
    originalPrice: 580,
    discountPrice: 480,
    hasDiscountBanner: true,
    discountBannerText: 'DESCUENTO',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    description: 'Formato mediano clásico para mesas de centro, repisas y bufeteros. Incluye paspartú opcional.'
  },
  {
    id: 'prod-21x29',
    name: 'Restauración / Enmarcado Carta (A4)',
    category: 'restauracion_enmarcado',
    dimensions: '21x29.7 cm',
    originalPrice: 490,
    discountPrice: 390,
    hasDiscountBanner: true,
    discountBannerText: 'RECOMENDADO',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Restaura tus cartas, retratos escolares antiguos y documentos antiguos con vidrio antirreflejo.'
  },
  {
    id: 'prod-20x25',
    name: 'Restauración / Enmarcado Familiar',
    category: 'restauracion_enmarcado',
    dimensions: '20x25 cm',
    originalPrice: 420,
    discountPrice: 350,
    hasDiscountBanner: false,
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    description: 'Medida 8x10 pulgadas tradicional. Excelente para fotografías de abuelos o eventos memorables.'
  },
  {
    id: 'prod-15x20',
    name: 'Restauración / Enmarcado Recuerdo',
    category: 'restauracion_enmarcado',
    dimensions: '15x20 cm',
    originalPrice: 350,
    discountPrice: 280,
    hasDiscountBanner: false,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Formato ideal para fotos de buró, mesitas de noche y escrituras. Retoque completo de arrugas.'
  },
  {
    id: 'prod-13x18',
    name: 'Restauración / Enmarcado Retrato',
    category: 'restauracion_enmarcado',
    dimensions: '13x18 cm',
    originalPrice: 290,
    discountPrice: 230,
    hasDiscountBanner: false,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    description: 'Tamaño 5x7 pulgadas. Ideal para retratos personales antiguos dañados por luz o raspaduras.'
  },
  {
    id: 'prod-10x15',
    name: 'Restauración / Enmarcado Estándar Pequeño',
    category: 'restauracion_enmarcado',
    dimensions: '10x15 cm',
    originalPrice: 220,
    discountPrice: 180,
    hasDiscountBanner: true,
    discountBannerText: 'BÁSICO',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Fotografía en tamaño postal tradicional. Reparación de rasgaduras sencillas e impresión enmarcada.'
  },
  {
    id: 'prod-recreacion-oleo',
    name: 'Recreación Artística Efecto Óleo en Lienzo Canvas',
    category: 'recreacion_digital',
    dimensions: '40x50 cm',
    originalPrice: 1650,
    discountPrice: 1350,
    hasDiscountBanner: true,
    discountBannerText: 'PREMIUM ART',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Convertimos tu fotografía antigua o desgastada en un cuadro tipo pintura al óleo digital impreso sobre lienzo genuino y montado en bastidor de madera.',
    isPopular: true
  },
  {
    id: 'prod-marco-dorado',
    name: 'Marco Tallado en Madera Fina con Hoja de Oro',
    category: 'cuadros_marcos',
    dimensions: 'Varios tamaños',
    originalPrice: 850,
    discountPrice: 690,
    hasDiscountBanner: true,
    discountBannerText: 'EDICIÓN ESPECIAL',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    description: 'Marco estilo clásico de lujo con detalles labrados y acabado dorado mate. Incluye cristal y marialuisa.'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'COT-1001',
    customerName: 'María Fernanda Gómez',
    customerPhone: '4441234567',
    customerEmail: 'mfgomez@email.com',
    date: '2026-08-05',
    items: [
      {
        productName: 'Restauración / Enmarcado Gran Formato',
        dimensions: '50x60 cm',
        quantity: 1,
        unitPrice: 990
      },
      {
        productName: 'Restauración Foto Retrato',
        dimensions: '13x18 cm',
        quantity: 2,
        unitPrice: 230
      }
    ],
    deposit: 500,
    totalAmount: 1450,
    status: 'En Proceso',
    notes: 'Fotografía de bodas de sus abuelitos año 1952. Requiere coloreado sepia.'
  },
  {
    id: 'COT-1002',
    customerName: 'Carlos Eduardo Ramírez',
    customerPhone: '4449876543',
    date: '2026-08-06',
    items: [
      {
        productName: 'Restauración / Enmarcado Gigante',
        dimensions: '50x76 cm',
        quantity: 1,
        unitPrice: 1190
      }
    ],
    deposit: 600,
    totalAmount: 1190,
    status: 'Listo',
    notes: 'Foto de bautizo vintage. Marco dorado clásico.'
  },
  {
    id: 'COT-1003',
    customerName: 'Lucía Alarcón',
    customerPhone: '4445558822',
    date: '2026-08-07',
    items: [
      {
        productName: 'Recreación Artística Efecto Óleo en Lienzo Canvas',
        dimensions: '40x50 cm',
        quantity: 1,
        unitPrice: 1350
      }
    ],
    deposit: 1350,
    totalAmount: 1350,
    status: 'Entregado',
    notes: 'Pago total en una sola exhibición. Cliente muy satisfecha.'
  }
];
