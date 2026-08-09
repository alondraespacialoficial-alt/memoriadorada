import React from 'react';
import { X, Printer, MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Download, DollarSign, Image as ImageIcon, ExternalLink, FileText } from 'lucide-react';
import { Quotation, SiteSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ToastMessage } from './Toast';

interface QuotationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  settings: SiteSettings;
  onUpdateDeposit?: (quotationId: string, deposit: number) => void;
  onUpdateStatus?: (quotationId: string, status: Quotation['status']) => void;
  isAdminView?: boolean;
  onShowToast?: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const QuotationReceiptModal: React.FC<QuotationReceiptModalProps> = ({
  isOpen,
  onClose,
  quotation,
  settings,
  onUpdateDeposit,
  onUpdateStatus,
  isAdminView = false,
  onShowToast,
}) => {
  if (!isOpen || !quotation) return null;

  const total = Number(quotation.totalAmount || 0);
  const deposit = Number(quotation.deposit || 0);
  const remaining = Math.max(0, total - deposit);

  const isPaidDeposit = deposit > 0;

  const handleDownloadPDF = async () => {
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: '📄 Generando PDF...',
        message: 'Creando la cotización en archivo PDF...',
      });
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      let y = 16;

      // Dark brown/black header block
      doc.setFillColor(25, 20, 12);
      doc.rect(14, y, pageWidth - 28, 22, 'F');

      // Title & Subtitle in Gold/White
      doc.setTextColor(212, 175, 55); // #D4AF37 Gold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(settings.logoTitle || 'MEMORIA DORADA', 20, y + 9);

      doc.setTextColor(230, 220, 200);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(settings.logoSubtitle || 'Restaura tus Recuerdos | Taller de Enmarcado', 20, y + 15);

      // Folio and Badge on right side of header block
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`FOLIO #${quotation.id}`, pageWidth - 20, y + 9, { align: 'right' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(212, 175, 55);
      doc.text(isPaidDeposit ? 'COMPROBANTE DE ANTICIPO' : 'COTIZACIÓN DE SERVICIO', pageWidth - 20, y + 15, { align: 'right' });

      y += 28;

      // Contact & Address
      doc.setTextColor(90, 90, 90);
      doc.setFontSize(8);
      doc.text(`${settings.footerAddress} | Tel: ${settings.whatsappDisplayPhone} | Fecha: ${quotation.date}`, 14, y);

      y += 8;

      // Customer Info Box
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y, pageWidth - 28, 18, 'F');
      doc.setDrawColor(220, 225, 230);
      doc.rect(14, y, pageWidth - 28, 18, 'S');

      doc.setTextColor(110, 110, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('DATOS DEL CLIENTE', 18, y + 5);

      doc.setTextColor(17, 17, 17);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(quotation.customerName || 'Cliente', 18, y + 11);

      if (quotation.customerPhone || quotation.customerEmail) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const contactInfo = [quotation.customerPhone && `Tel: ${quotation.customerPhone}`, quotation.customerEmail && `Email: ${quotation.customerEmail}`].filter(Boolean).join(' | ');
        doc.text(contactInfo, 18, y + 15);
      }

      // Order Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(160, 120, 20);
      doc.text(`ESTADO: ${quotation.status.toUpperCase()}`, pageWidth - 18, y + 11, { align: 'right' });

      y += 24;

      // Table Header
      doc.setFillColor(235, 238, 242);
      doc.rect(14, y, pageWidth - 28, 8, 'F');

      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      doc.text('SERVICIO / PRODUCTO', 18, y + 5.5);
      doc.text('MEDIDAS', 100, y + 5.5, { align: 'center' });
      doc.text('CANT.', 130, y + 5.5, { align: 'center' });
      doc.text('P. UNITARIO', 160, y + 5.5, { align: 'right' });
      doc.text('SUBTOTAL', pageWidth - 18, y + 5.5, { align: 'right' });

      y += 8;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      quotation.items.forEach((item) => {
        const name = (item as any).productName || item.product?.name || 'Servicio de Restauración/Enmarcado';
        const dimensions = item.dimensions || item.product?.dimensions || '-';
        const unitPrice = item.unitPrice ?? item.product?.discountPrice ?? item.product?.originalPrice ?? 0;
        const itemSubtotal = unitPrice * item.quantity;

        doc.setTextColor(17, 17, 17);
        doc.text(name.length > 40 ? name.substring(0, 38) + '...' : name, 18, y + 5);

        doc.setTextColor(80, 80, 80);
        doc.text(dimensions, 100, y + 5, { align: 'center' });

        doc.setTextColor(17, 17, 17);
        doc.text(item.quantity.toString(), 130, y + 5, { align: 'center' });

        doc.text(formatCurrency(unitPrice), 160, y + 5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(itemSubtotal), pageWidth - 18, y + 5, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        doc.setDrawColor(230, 230, 230);
        doc.line(14, y + 7, pageWidth - 14, y + 7);

        y += 8;
      });

      y += 4;

      // Totals Box (Right Side)
      const totalsWidth = 75;
      const totalsX = pageWidth - 14 - totalsWidth;
      doc.setFillColor(250, 250, 252);
      doc.rect(totalsX, y, totalsWidth, 28, 'F');
      doc.setDrawColor(220, 220, 225);
      doc.rect(totalsX, y, totalsWidth, 28, 'S');

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Monto Total:', totalsX + 4, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 17, 17);
      doc.text(formatCurrency(total), pageWidth - 18, y + 6, { align: 'right' });

      if (isPaidDeposit) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(6, 95, 70);
        doc.text('(-) Anticipo Recibido:', totalsX + 4, y + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(deposit), pageWidth - 18, y + 12, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 120, 20);
        doc.text('Anticipo Requerido (50%):', totalsX + 4, y + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(Math.round(total * 0.5)), pageWidth - 18, y + 12, { align: 'right' });
      }

      doc.setDrawColor(180, 140, 30);
      doc.line(totalsX + 4, y + 17, pageWidth - 18, y + 17);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(160, 120, 20);
      doc.text(isPaidDeposit ? 'SALDO PENDIENTE:' : 'SALDO RESTANTE:', totalsX + 4, y + 23);
      doc.text(formatCurrency(remaining), pageWidth - 18, y + 23, { align: 'right' });

      // Guarantee & Conditions Box (Left Side)
      const termsWidth = pageWidth - 28 - totalsWidth - 6;
      doc.setFillColor(250, 250, 252);
      doc.rect(14, y, termsWidth, 42, 'F');
      doc.setDrawColor(220, 220, 225);
      doc.rect(14, y, termsWidth, 42, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(160, 120, 20);
      doc.text('GARANTÍA Y CONDICIONES DEL TRABAJO', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(60, 60, 60);

      const termLines = [
        '• Todos nuestros trabajos cuentan con revisión digital para aprobación previa.',
        '• La muestra es únicamente para revisión visual y no autoriza su uso por terceros.',
        '• Incluye hasta dos ajustes menores. Cambios adicionales se cotizan por separado.',
        '• El saldo restante se liquida al recibir el trabajo terminado.'
      ];

      let termY = y + 11;
      termLines.forEach((line) => {
        doc.text(line, 18, termY);
        termY += 5;
      });

      y += 48;

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('¡Gracias por elegirnos para preservar la historia de tu familia!', 14, y);

      doc.setFont('helvetica', 'bold');
      doc.text(settings.logoTitle || 'MEMORIA DORADA', pageWidth - 14, y, { align: 'right' });

      const cleanCustomerName = (quotation.customerName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Cotizacion_#${quotation.id}_${cleanCustomerName}.pdf`;

      doc.save(filename);

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: '✅ PDF Descargado',
          message: `El archivo ${filename} se ha guardado en tu equipo.`,
        });
      }
    } catch (err) {
      console.error('Error al generar PDF vectorial con jsPDF:', err);
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Error al crear PDF',
          message: 'Abriendo ventana de impresión para guardar como PDF...',
        });
      }
      handlePrint();
    }
  };

  const handlePrint = () => {
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: '📄 Generando comprobante PDF',
        message: 'Selecciona "Guardar como PDF" en la ventana de impresión que se abrirá.',
      });
    }

    const printElement = document.getElementById('printable-receipt-content');
    if (printElement) {
      const printWin = window.open('', '_blank', 'width=850,height=950');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cotizacion_${quotation.id}_${(quotation.customerName || 'Cliente').replace(/\s+/g, '_')}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                body {
                  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                  background: #ffffff;
                  color: #111111;
                  margin: 0;
                  padding: 30px;
                  line-height: 1.5;
                }
                .logo-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #111; margin: 0; }
                .sub-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9a7b2c; font-weight: 700; margin-top: 2px; }
                .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
                .folio-badge { background: #f3f4f6; border: 1px solid #d1d5db; padding: 10px 16px; border-radius: 12px; text-align: right; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f9fafb; padding: 14px 18px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid #e5e7eb; color: #374151; }
                td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .total-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin-left: auto; width: 280px; margin-bottom: 20px; }
                .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
                .total-grand { font-size: 16px; font-weight: 800; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; color: #9a7b2c; }
                .attached-img { max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 10px; }
                @media print {
                  body { padding: 0; }
                  button { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div style="max-width: 800px; margin: 0 auto;">
                ${printElement.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 400);
                }
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    }

    try {
      window.print();
    } catch (e) {
      console.error('Print trigger failed:', e);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    const phone = quotation.customerPhone || settings.whatsappNumber;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    let text = isPaidDeposit
      ? `*COMPROBANTE OFICIAL DE ANTICIPO Y ORDEN DE TRABAJO*\n`
      : `*COTIZACIÓN OFICIAL Y PROPUESTA DE SERVICIO*\n`;
    text += `*${settings.logoTitle} - ${settings.logoSubtitle}*\n`;
    text += `-----------------------------------\n`;
    text += `*Folio:* #${quotation.id}\n`;
    text += `*Cliente:* ${quotation.customerName}\n`;
    text += `*Fecha:* ${quotation.date}\n`;
    text += `*Estado:* ${quotation.status}\n\n`;
    text += `*DETALLE DE SERVICIOS:*\n`;
    
    quotation.items.forEach((item, idx) => {
      const name = (item as any).productName || item.product?.name || 'Servicio';
      const dimensions = item.dimensions || item.product?.dimensions || '';
      const unitPrice = item.unitPrice ?? item.product?.discountPrice ?? item.product?.originalPrice ?? 0;
      text += `${idx + 1}. ${name} (${dimensions}) x${item.quantity} - ${formatCurrency(unitPrice * item.quantity)}\n`;
    });

    text += `\n-----------------------------------\n`;
    text += `*Monto Total:* ${formatCurrency(total)}\n`;
    if (isPaidDeposit) {
      text += `*Anticipo Confirmado (Admin):* ${formatCurrency(deposit)}\n`;
      text += `*Saldo Pendiente a la Entrega:* ${formatCurrency(remaining)}\n`;
    } else {
      text += `*Anticipo Requerido (50%):* ${formatCurrency(Math.round(total * 0.5))}\n`;
      text += `*Anticipo Recibido:* $0.00 MXN (Pendiente de pago/confirmación)\n`;
    }
    if (quotation.referenceImageUrl) {
      text += `*Imagen de muestra:* ${quotation.referenceImageUrl}\n`;
    }
    text += `\n-----------------------------------\n`;
    text += `*GARANTÍA Y CONDICIONES DEL TRABAJO*\n`;
    text += `Todos nuestros trabajos de restauración y recreación de fotografías cuentan con revisión digital para que el cliente pueda aprobar el diseño antes de producirlo.\n\n`;
    text += `La muestra enviada es únicamente para revisión visual y no autoriza su uso, reproducción, impresión o edición por terceros. El archivo final se libera solo una vez aceptada la cotización y confirmado el anticipo o pago acordado.\n\n`;
    text += `Esta cotización incluye hasta dos ajustes menores sobre la propuesta inicial. Cualquier cambio adicional o modificación que implique un nuevo diseño se cotización por separado.\n\n`;
    text += `El saldo restante se liquida al recibir el trabajo terminado, según las condiciones acordadas por mensaje de WhatsApp con el cliente.\n`;
    text += `-----------------------------------\n`;
    text += isPaidDeposit
      ? `¡Gracias por tu pago de anticipo! Tu trabajo está en proceso en nuestro taller.`
      : `Para autorizar tu pedido y enviar tu anticipo, contáctanos por WhatsApp.`;

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: '💬 Abriendo WhatsApp',
        message: 'Se abrirá WhatsApp con el resumen de la cotización.',
      });
    }

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div id="printable-receipt-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md print:p-0 print:bg-white print:static">
      
      {/* Container - Designed for Screen & Print */}
      <div id="printable-receipt-container" className="relative w-full max-w-2xl bg-[#0F1217] border border-[#3D3016] text-[#F3E5C8] rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* Screen Top Bar (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-[#141821] border-b border-[#29200F] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#211A0C] border border-[#6B531F] flex items-center justify-center text-[#E2B755]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#F3E5C8]">
                {isPaidDeposit ? 'Comprobante Oficial de Anticipo y Trabajo' : 'Cotización Formal de Servicio'}
              </h2>
              <p className="text-[11px] text-[#A89878]">Folio: #{quotation.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-[#0B0D10] font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
              title="Descargar cotización directa en archivo PDF"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-[#211A0C] border border-[#524424] text-[#F3E5C8] font-bold text-xs hover:border-[#D4AF37] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Abrir diálogo de impresión"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#211A0C] border border-[#3D3016] text-[#A89878] hover:text-[#F3E5C8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div id="printable-receipt-content" className="p-6 sm:p-8 space-y-6 print:p-8 print:text-black">
          
          {/* Header section with branding */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-[#3D3016] print:border-black pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {settings.logoImageUrl ? (
                  <img src={settings.logoImageUrl} alt="Logo" className="w-8 h-8 object-contain print:invert-0" />
                ) : (
                  <Sparkles className="w-6 h-6 text-[#D4AF37] print:text-black" />
                )}
                <h1 className="font-serif text-xl font-bold tracking-tight text-[#F3E5C8] print:text-black">
                  {settings.logoTitle}
                </h1>
              </div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] print:text-gray-700 font-semibold">
                {settings.logoSubtitle}
              </p>
              <p className="text-[11px] text-[#A89878] print:text-gray-600 mt-1">
                {settings.footerAddress} | Tel: {settings.whatsappDisplayPhone}
              </p>
            </div>

            <div className="text-left sm:text-right bg-[#181D26] print:bg-gray-100 p-3 sm:p-4 rounded-2xl border border-[#3D3016] print:border-gray-300 min-w-[200px]">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                isPaidDeposit
                  ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-400 print:bg-black print:text-white'
                  : 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B755] print:bg-gray-200 print:text-black'
              }`}>
                {isPaidDeposit ? 'COMPROBANTE DE ANTICIPO' : 'COTIZACIÓN Y PRESUPUESTO'}
              </span>
              <p className="font-mono text-sm font-bold text-[#F3E5C8] print:text-black">
                FOLIO: #{quotation.id}
              </p>
              <p className="text-xs text-[#A89878] print:text-gray-600">Fecha: {quotation.date}</p>
            </div>
          </div>

          {/* Customer & Order Status Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141821] print:bg-gray-50 p-4 rounded-2xl border border-[#29200F] print:border-gray-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A89878] print:text-gray-500 mb-1">Datos del Cliente</p>
              <p className="text-sm font-bold text-[#F3E5C8] print:text-black">{quotation.customerName}</p>
              {quotation.customerPhone && (
                <p className="text-xs text-[#A89878] print:text-gray-700">Tel: {quotation.customerPhone}</p>
              )}
              {quotation.customerEmail && (
                <p className="text-xs text-[#A89878] print:text-gray-700">Email: {quotation.customerEmail}</p>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A89878] print:text-gray-500 mb-1">Estado de la Orden</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                quotation.status === 'Completada'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800 print:bg-emerald-100 print:text-emerald-800'
                  : quotation.status === 'En Proceso'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800 print:bg-amber-100 print:text-amber-800'
                  : 'bg-blue-950/80 text-blue-400 border border-blue-800 print:bg-blue-100 print:text-blue-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{quotation.status}</span>
              </span>
            </div>
          </div>

          {/* Customer Reference Image Section (if exists) */}
          {quotation.referenceImageUrl && (
            <div className="p-4 rounded-2xl bg-[#141821] print:bg-gray-50 border border-[#3D3016] print:border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#D4AF37] print:text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Foto / Imagen de Muestra Adjunta</span>
                </p>
                <a
                  href={quotation.referenceImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#E2B755] hover:underline print:hidden flex items-center gap-1"
                >
                  <span>Abrir en tamaño completo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={quotation.referenceImageUrl}
                  alt="Muestra del cliente"
                  className="w-28 h-28 object-cover rounded-xl border border-[#3D3016] print:border-gray-300 shadow-md"
                />
                <div className="text-xs text-[#A89878] print:text-gray-600">
                  <p className="font-semibold text-[#F3E5C8] print:text-black">Muestra enviada por el cliente</p>
                  <p className="text-[11px] mt-0.5">Esta imagen sirve como referencia para la restauración o enmarcado.</p>
                </div>
              </div>
            </div>
          )}

          {/* Itemized Table */}
          <div className="overflow-hidden rounded-2xl border border-[#3D3016] print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C222D] print:bg-gray-200 text-[#E2B755] print:text-black font-serif font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Servicio / Producto</th>
                  <th className="p-3 text-center">Medidas</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-right">P. Unitario</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#29200F] print:divide-gray-200 text-[#F3E5C8] print:text-black bg-[#12151B] print:bg-white">
                {quotation.items.map((item, idx) => {
                  const name = (item as any).productName || item.product?.name || 'Servicio de Restauración/Enmarcado';
                  const dimensions = item.dimensions || item.product?.dimensions || '-';
                  const unitPrice = item.unitPrice ?? item.product?.discountPrice ?? item.product?.originalPrice ?? 0;
                  const itemSubtotal = unitPrice * item.quantity;
                  const desc = item.product?.description;
                  return (
                    <tr key={idx} className="hover:bg-[#181D26] print:hover:bg-white">
                      <td className="p-3">
                        <p className="font-bold">{name}</p>
                        {desc && (
                          <p className="text-[10px] text-[#A89878] print:text-gray-500 line-clamp-1">{desc}</p>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] text-[#A89878] print:text-gray-700">
                        {dimensions}
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(unitPrice)}</td>
                      <td className="p-3 text-right font-bold font-mono">{formatCurrency(itemSubtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Balance Box */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
            
            {/* Notes / Admin Controls */}
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#141821] print:bg-gray-50 border border-[#29200F] print:border-gray-200 space-y-2">
                <p className="text-[10px] font-bold text-[#D4AF37] print:text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Garantía y condiciones del trabajo</span>
                </p>
                <div className="text-[10px] sm:text-[11px] text-[#A89878] print:text-gray-600 leading-relaxed space-y-1.5">
                  <p>
                    Todos nuestros trabajos de restauración y recreación de fotografías cuentan con revisión digital para que el cliente pueda aprobar el diseño antes de producirlo.
                  </p>
                  <p>
                    La muestra enviada es únicamente para revisión visual y no autoriza su uso, reproducción, impresión o edición por terceros. El archivo final se libera solo una vez aceptada la cotización y confirmado el anticipo o pago acordado.
                  </p>
                  <p>
                    Esta cotización incluye hasta dos ajustes menores sobre la propuesta inicial. Cualquier cambio adicional o modificación que implique un nuevo diseño se cotizará por separado.
                  </p>
                  <p>
                    El saldo restante se liquida al recibir el trabajo terminado, según las condiciones acordadas por mensaje de WhatsApp con el cliente.
                  </p>
                </div>
              </div>

              {/* Admin Deposit & Status Edit Section (Only in Admin view, hidden in print) */}
              {isAdminView && (onUpdateDeposit || onUpdateStatus) && (
                <div className="p-3.5 rounded-2xl bg-[#211A0C] border border-[#524424] space-y-3 print:hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#E2B755] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>Control de Administración</span>
                    </p>
                    <span className="text-[10px] bg-[#3D3016] text-[#E2B755] px-2 py-0.5 rounded-md font-bold">Solo Admin</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {onUpdateDeposit && (
                      <div>
                        <label className="block text-[10px] font-bold text-[#A89878] mb-1">
                          Registrar Anticipo Recibido
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={quotation.deposit || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              onUpdateDeposit(quotation.id, val);
                              if (onShowToast) {
                                onShowToast({
                                  type: 'success',
                                  title: '💰 Anticipo actualizado',
                                  message: `Anticipo de ${formatCurrency(val)} guardado en la orden.`,
                                });
                              }
                            }}
                            className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-2.5 py-1 text-xs text-[#25D366] font-bold font-mono focus:border-[#D4AF37] focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-[#A89878]">MXN</span>
                        </div>
                      </div>
                    )}

                    {onUpdateStatus && (
                      <div>
                        <label className="block text-[10px] font-bold text-[#A89878] mb-1">
                          Estado del Pedido
                        </label>
                        <select
                          value={quotation.status || 'Pendiente'}
                          onChange={(e) => {
                            const newStatus = e.target.value as Quotation['status'];
                            onUpdateStatus(quotation.id, newStatus);
                            if (onShowToast) {
                              onShowToast({
                                type: 'success',
                                title: '✅ Estado actualizado',
                                message: `La orden ahora está en estado: ${newStatus}`,
                              });
                            }
                          }}
                          className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-2 py-1 text-xs text-[#F3E5C8] font-bold focus:border-[#D4AF37] focus:outline-none"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Listo">Listo para Entregar</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary Breakdown */}
            <div className="w-full sm:w-1/2 bg-[#181D26] print:bg-gray-100 p-4 rounded-2xl border border-[#3D3016] print:border-gray-300 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-[#A89878] print:text-gray-600">
                <span>Monto Total del Trabajo:</span>
                <span className="font-mono font-bold text-[#F3E5C8] print:text-black">{formatCurrency(total)}</span>
              </div>

              {isPaidDeposit ? (
                <div className="flex justify-between items-center text-xs text-emerald-400 print:text-emerald-800 font-bold border-t border-[#29200F] print:border-gray-200 pt-2">
                  <span>(-) Anticipo Confirmado (Admin):</span>
                  <span className="font-mono">{formatCurrency(deposit)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-xs text-[#E2B755] print:text-gray-700 font-medium border-t border-[#29200F] print:border-gray-200 pt-2">
                    <span>Anticipo Requerido (50%):</span>
                    <span className="font-mono font-bold">{formatCurrency(Math.round(total * 0.5))}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#A89878] print:text-gray-500">
                    <span>Anticipo Recibido:</span>
                    <span className="font-mono text-gray-400">$0.00 MXN</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-[#E2B755] print:text-black border-t border-[#3D3016] print:border-gray-300 pt-2.5">
                <span>{isPaidDeposit ? 'SALDO PENDIENTE A LA ENTREGA:' : 'SALDO TOTAL RESTANTE:'}</span>
                <span className="font-mono text-base text-[#D4AF37] print:text-black">{formatCurrency(remaining)}</span>
              </div>
            </div>

          </div>

          {/* Signature / Footer */}
          <div className="pt-6 border-t border-[#29200F] print:border-gray-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A89878] print:text-gray-500 gap-4">
            <p>¡Gracias por elegirnos para preservar la historia de tu familia!</p>
            <div className="text-center sm:text-right">
              <div className="w-36 border-b border-[#3D3016] print:border-gray-400 mb-1 mx-auto sm:ml-auto"></div>
              <p className="font-bold text-[#F3E5C8] print:text-black">{settings.logoTitle}</p>
            </div>
          </div>

        </div>

        {/* Screen Bottom Actions (Hidden in Print) */}
        <div className="p-4 bg-[#141821] border-t border-[#29200F] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handleSendWhatsAppReceipt}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Comprobante por WhatsApp</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl bg-[#211A0C] border border-[#524424] text-[#F3E5C8] font-bold text-xs hover:border-[#D4AF37] transition-all flex items-center gap-2 cursor-pointer"
              title="Descargar en PDF"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-[#1A1E26] border border-[#29200F] text-[#A89878] hover:text-[#F3E5C8] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Imprimir comprobante"
            >
              <Printer className="w-4 h-4 text-[#A89878]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1A1E26] text-[#A89878] hover:text-[#F3E5C8] text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

