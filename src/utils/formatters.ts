import { CartItem } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppLink(
  phoneNumber: string,
  customerName: string,
  customerPhone: string,
  cartItems: CartItem[],
  customNotes?: string,
  uploadedPhotoNames?: string[]
): string {
  // Clean phone number (remove spaces, plus sign, etc.)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  let totalBeforeDiscount = 0;
  let totalWithDiscount = 0;

  const itemDetails = cartItems
    .map((item, index) => {
      const price = item.product.discountPrice ?? item.product.originalPrice;
      const originalTotal = item.product.originalPrice * item.quantity;
      const finalTotal = price * item.quantity;

      totalBeforeDiscount += originalTotal;
      totalWithDiscount += finalTotal;

      let line = `${index + 1}. *${item.product.name}*`;
      if (item.product.dimensions) {
        line += ` (${item.product.dimensions})`;
      }
      line += `\n   • Cantidad: ${item.quantity}`;
      if (item.product.discountPrice) {
        line += `\n   • Precio: ~${formatCurrency(item.product.originalPrice)}~ *${formatCurrency(item.product.discountPrice)}* c/u`;
      } else {
        line += `\n   • Precio: ${formatCurrency(item.product.originalPrice)} c/u`;
      }
      line += `\n   • Subtotal: *${formatCurrency(finalTotal)}*`;

      if (item.customNote) {
        line += `\n   • Nota ítem: _${item.customNote}_`;
      }
      return line;
    })
    .join('\n\n');

  const savings = totalBeforeDiscount - totalWithDiscount;

  let message = `🖼️ *SOLICITUD DE PEDIDO - RESTAURACIÓN Y RECREACIÓN*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *Cliente:* ${customerName.trim()}\n`;
  if (customerPhone.trim()) {
    message += `📞 *Teléfono:* ${customerPhone.trim()}\n`;
  }
  if (uploadedPhotoNames && uploadedPhotoNames.length > 0) {
    message += `📷 *Imágenes adjuntas (${uploadedPhotoNames.length}):* _(${uploadedPhotoNames.join(', ')})_\n`;
  }
  if (customNotes && customNotes.trim()) {
    message += `📝 *Notas generales:* _${customNotes.trim()}_\n`;
  }
  message += `\n🛒 *ARTÍCULOS SOLICITADOS:* (${cartItems.reduce((acc, i) => acc + i.quantity, 0)}):\n\n${itemDetails}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (savings > 0) {
    message += `🎉 *Descuento total aplicado:* ${formatCurrency(savings)}\n`;
  }
  message += `💰 *TOTAL ESTIMADO:* *${formatCurrency(totalWithDiscount)} MXN*\n\n`;
  message += `Hola, me gustaría solicitar estos artículos y cotizar la restauración/enmarcado de mis fotografías. ¿Cuál es el procedimiento para enviar las imágenes físicas o digitales?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
