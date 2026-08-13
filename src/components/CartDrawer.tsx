import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, Sparkles, User, Phone, FileText, Upload, CheckCircle, Printer, Download, Image as ImageIcon, Loader2, MapPin } from 'lucide-react';
import { CartItem, SiteSettings, Quotation } from '../types';
import { formatCurrency, buildWhatsAppLink, haversineDistanceKm, calculateShippingCost } from '../utils/formatters';
import { ToastMessage } from './Toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: SiteSettings;
  onRecordQuotation?: (
    customerName: string,
    customerPhone: string,
    items: CartItem[],
    total: number,
    notes?: string,
    referenceImageUrls?: string[],
    shippingCost?: number,
    shippingDistanceKm?: number
  ) => Quotation | void;
  onOpenReceipt?: (quotation: Quotation) => void;
  onShowToast?: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onRecordQuotation,
  onOpenReceipt,
  onShowToast,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<{ name: string; url: string }[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [shippingDistanceKm, setShippingDistanceKm] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [manualKmInput, setManualKmInput] = useState('');
  const [showManualKm, setShowManualKm] = useState(false);

  const MAX_PHOTOS = 6;

  if (!isOpen) return null;

  const totalBeforeDiscount = cartItems.reduce((acc, item) => {
    return acc + item.product.originalPrice * item.quantity;
  }, 0);

  const totalWithDiscount = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.originalPrice;
    return acc + price * item.quantity;
  }, 0);

  const totalSavings = totalBeforeDiscount - totalWithDiscount;

  const grandTotal = totalWithDiscount + (shippingCost || 0);

  const handleCalculateShipping = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta compartir ubicación.');
      return;
    }
    if (!settings.businessLat || !settings.businessLng) {
      setLocationError('El taller aún no tiene una ubicación configurada.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distanceKm = haversineDistanceKm(
          position.coords.latitude,
          position.coords.longitude,
          settings.businessLat!,
          settings.businessLng!
        );
        const cost = calculateShippingCost(distanceKm, settings.baseFreeKm ?? 10, settings.extraKmPrice ?? 12);
        setShippingDistanceKm(distanceKm);
        setShippingCost(cost);
        setIsLocating(false);
        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: '📍 Ubicación detectada',
            message: `Distancia: ${distanceKm.toFixed(1)} km · Envío: ${cost > 0 ? formatCurrency(cost) : 'Gratis'}`,
          });
        }
      },
      () => {
        setIsLocating(false);
        setLocationError('No pudimos obtener tu ubicación. Puedes seguir sin calcular el envío.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleApplyManualKm = () => {
    const km = Number(manualKmInput);
    if (!manualKmInput.trim() || isNaN(km) || km < 0) {
      setLocationError('Escribe una distancia válida en kilómetros.');
      return;
    }
    const cost = calculateShippingCost(km, settings.baseFreeKm ?? 10, settings.extraKmPrice ?? 12);
    setShippingDistanceKm(km);
    setShippingCost(cost);
    setLocationError('');
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: '📏 Distancia registrada',
        message: `Distancia: ${km.toFixed(1)} km · Envío: ${cost > 0 ? formatCurrency(cost) : 'Gratis'}`,
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const availableSlots = MAX_PHOTOS - uploadedPhotos.length;
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots && onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Límite de fotos',
        message: `Solo puedes adjuntar hasta ${MAX_PHOTOS} fotos. Se agregaron las primeras ${availableSlots}.`,
      });
    }

    setIsUploadingPhoto(true);

    let processed = 0;
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        let finalUrl = base64Url;

        try {
          const { uploadImageToSupabase } = await import('../lib/supabase');
          const uploadRes = await uploadImageToSupabase(file, 'product-images');
          if (uploadRes.url) {
            finalUrl = uploadRes.url;
          }
        } catch (err) {
          console.warn('Could not upload image to Supabase storage, using base64 preview:', err);
        }

        setUploadedPhotos((prev) => [...prev, { name: file.name, url: finalUrl }]);

        processed += 1;
        if (processed === filesToProcess.length) {
          setIsUploadingPhoto(false);
          if (onShowToast) {
            onShowToast({
              type: 'success',
              title: filesToProcess.length > 1 ? '📷 Fotos adjuntadas' : '📷 Foto adjuntada',
              message:
                filesToProcess.length > 1
                  ? `${filesToProcess.length} imágenes guardadas como referencia para tu cotización.`
                  : `"${filesToProcess[0].name}" guardada como referencia para tu cotización.`,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Allow re-selecting the same file(s) afterward
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: '🗑️ Foto eliminada',
        message: 'Se quitó la imagen adjunta de tu cotización.',
      });
    }
  };

  const handleGenerateReceipt = () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const photoUrls = uploadedPhotos.map((p) => p.url);

    let recorded: Quotation | void;
    if (onRecordQuotation) {
      recorded = onRecordQuotation(
        customerName,
        customerPhone,
        cartItems,
        grandTotal,
        specialNotes,
        photoUrls,
        shippingCost || 0,
        shippingDistanceKm || undefined
      );
    }

    const receiptObj: Quotation = (recorded as Quotation) || {
      id: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      date: new Date().toISOString().split('T')[0],
      items: cartItems.map((i) => ({
        productName: i.product.name,
        dimensions: i.product.dimensions,
        quantity: i.quantity,
        unitPrice: i.product.discountPrice ?? i.product.originalPrice,
      })),
      deposit: 0,
      totalAmount: grandTotal,
      cost: 0,
      status: 'Pendiente',
      notes: specialNotes,
      referenceImageUrls: photoUrls,
      shippingCost: shippingCost || 0,
      shippingDistanceKm: shippingDistanceKm || undefined,
    };

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: '📄 Comprobante PDF generado',
        message: 'Visualizando folio de cotización en pantalla.',
      });
    }

    if (onOpenReceipt) {
      onOpenReceipt(receiptObj);
    }
  };

  const handleSendWhatsApp = () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const photoUrls = uploadedPhotos.map((p) => p.url);

    if (onRecordQuotation) {
      onRecordQuotation(
        customerName,
        customerPhone,
        cartItems,
        grandTotal,
        specialNotes,
        photoUrls,
        shippingCost || 0,
        shippingDistanceKm || undefined
      );
    }

    const waUrl = buildWhatsAppLink(
      settings.whatsappNumber,
      customerName,
      customerPhone,
      cartItems,
      specialNotes,
      uploadedPhotos.map((p) => p.name),
      shippingCost || 0,
      shippingDistanceKm || undefined
    );

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: '💬 Abriendo WhatsApp',
        message: 'Enviando solicitud de cotización al taller.',
      });
    }

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0D10]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F1217] border-l border-[#3D3016] text-[#F3E5C8] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#29200F] bg-[#141821] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#211A0C] border border-[#6B531F] flex items-center justify-center text-[#E2B755]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#F3E5C8]">Tu Carrito de Pedido</h2>
                <p className="text-[11px] text-[#A89878]">{cartItems.length} artículo(s) seleccionados</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#A89878] hover:text-[#F3E5C8] hover:bg-[#211A0C] rounded-lg transition-colors"
              id="cart-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#262013]">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1A1E26] border border-[#3D3016] flex items-center justify-center mx-auto text-[#69583A]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#F3E5C8]">Tu carrito está vacío</h3>
                <p className="text-xs text-[#A89878] max-w-xs mx-auto">
                  Agrega las medidas y servicios que deseas cotizar de nuestro catálogo.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#3D3016] text-[#E2B755] font-bold text-xs hover:bg-[#52411E] transition-all"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemUnitPrice = item.product.discountPrice ?? item.product.originalPrice;
                const itemTotal = itemUnitPrice * item.quantity;
                const hasDiscount = !!item.product.discountPrice;

                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                    {/* Thumbnail */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover border border-[#3D3016] shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-[#F3E5C8] leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => {
                            onRemoveItem(item.product.id);
                            if (onShowToast) {
                              onShowToast({
                                type: 'info',
                                title: '🗑️ Artículo eliminado',
                                message: `Se quitó ${item.product.name} de tu carrito.`,
                              });
                            }
                          }}
                          className="text-[#806B45] hover:text-[#EF4444] transition-colors p-1"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Dimensions & Prices */}
                      <div className="text-xs text-[#A89878] flex items-center gap-2">
                        <span className="font-mono text-[#E2B755] bg-[#211A0C] px-1.5 py-0.5 rounded border border-[#54431B]">
                          {item.product.dimensions}
                        </span>
                        {hasDiscount && (
                          <span className="line-through text-[#665742] font-mono">
                            {formatCurrency(item.product.originalPrice)}
                          </span>
                        )}
                        <span className="font-bold text-[#F3E5C8] font-mono">
                          {formatCurrency(itemUnitPrice)} c/u
                        </span>
                      </div>

                      {item.customNote && (
                        <p className="text-[11px] text-[#D4AF37] italic">
                          Nota: "{item.customNote}"
                        </p>
                      )}

                      {/* Quantity Selector & Item Total */}
                      <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center bg-[#080A0C] border border-[#3D3016] rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-1 text-[#A89878] hover:text-[#F3E5C8]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold font-mono text-[#F3E5C8]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-1 text-[#A89878] hover:text-[#F3E5C8]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif text-sm font-bold text-[#F3E5C8]">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Order Form */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#29200F] bg-[#141821] space-y-4">
              
              {/* Savings Highlight */}
              {totalSavings > 0 && (
                <div className="bg-[#1C271C] border border-[#25D366]/30 text-[#25D366] text-xs px-3 py-2 rounded-lg flex items-center justify-between">
                  <span>¡Felicidades! Tienes un descuento aplicado</span>
                  <span className="font-bold">- {formatCurrency(totalSavings)}</span>
                </div>
              )}

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A89878]">
                  <span>Subtotal original:</span>
                  <span className="font-mono line-through">{formatCurrency(totalBeforeDiscount)}</span>
                </div>
                <div className="flex justify-between text-[#A89878]">
                  <span>Subtotal artículos:</span>
                  <span className="font-mono text-[#F3E5C8]">{formatCurrency(totalWithDiscount)}</span>
                </div>
                {shippingCost !== null && (
                  <div className="flex justify-between text-[#A89878]">
                    <span>Envío estimado ({shippingDistanceKm!.toFixed(1)} km):</span>
                    <span className="font-mono text-[#F3E5C8]">
                      {shippingCost > 0 ? formatCurrency(shippingCost) : 'Gratis'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold font-serif text-[#F3E5C8] pt-1 border-t border-[#29200F]">
                  <span>TOTAL ESTIMADO:</span>
                  <span className="text-[#E2B755]">{formatCurrency(grandTotal)} MXN</span>
                </div>
              </div>

              {/* Shipping Distance Calculator */}
              <div className="p-3 rounded-xl bg-[#080A0C] border border-[#3D3016] space-y-2">
                <button
                  type="button"
                  onClick={handleCalculateShipping}
                  disabled={isLocating}
                  className="w-full py-2 px-3 rounded-lg bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] text-xs font-bold text-[#F3E5C8] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#E2B755]" />
                  )}
                  <span>
                    {isLocating
                      ? 'Calculando distancia...'
                      : shippingCost !== null
                      ? 'Recalcular envío con mi ubicación'
                      : 'Calcular envío con mi ubicación'}
                  </span>
                </button>
                <p className="text-[10px] text-[#A89878] leading-relaxed">
                  Comparte tu ubicación para estimar el costo de envío ({settings.baseFreeKm ?? 10} km gratis, luego {formatCurrency(settings.extraKmPrice ?? 12)} por km extra). Si aún no sabes la dirección exacta de entrega, puedes omitir este paso: el envío final se confirma al momento de coordinar la entrega.
                </p>
                {locationError && <p className="text-[10px] text-red-400">{locationError}</p>}

                {!showManualKm ? (
                  <button
                    type="button"
                    onClick={() => setShowManualKm(true)}
                    className="text-[10px] text-[#A89878] hover:text-[#D4AF37] underline"
                  >
                    ¿No quieres compartir tu ubicación? Escribe tu distancia aproximada
                  </button>
                ) : (
                  <div className="flex gap-2 items-start">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={manualKmInput}
                      onChange={(e) => setManualKmInput(e.target.value)}
                      placeholder="Km aprox. desde el taller"
                      className="flex-1 bg-[#080A0C] border border-[#3D3016] rounded-lg px-3 py-2 text-xs text-[#F3E5C8] placeholder-[#665842] focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyManualKm}
                      className="px-3 py-2 rounded-lg bg-[#211A0C] border border-[#524424] hover:border-[#D4AF37] text-xs font-bold text-[#F3E5C8] shrink-0"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
              </div>

              {/* Mandatory Customer Info Form */}
              <div className="space-y-3 pt-2 border-t border-[#29200F]">
                <div>
                  <label className="block text-xs font-semibold text-[#D4AF37] mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Tu Nombre Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="Ej. Juan Pérez"
                    className={`w-full bg-[#080A0C] border ${
                      nameError ? 'border-red-500' : 'border-[#524424]'
                    } rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] placeholder-[#665842] focus:outline-none focus:border-[#D4AF37]`}
                    id="cart-customer-name-input"
                  />
                  {nameError && (
                    <span className="text-[10px] text-red-400 mt-0.5 block">
                      Por favor escribe tu nombre para solicitar el pedido.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Teléfono de Contacto (Opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. 444 202 6872"
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] placeholder-[#665842] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notas especiales o estado de tus fotos</span>
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Ej. La foto tiene hongos y está rota por la mitad..."
                    className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl px-3.5 py-2 text-xs text-[#F3E5C8] placeholder-[#665842] focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>

                {/* Photo Attachment Section */}
                <div>
                  <label className="block text-xs font-semibold text-[#A89878] mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Adjuntar fotos de muestra (Opcional, hasta {MAX_PHOTOS})</span>
                  </label>

                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div
                          key={`${photo.name}-${index}`}
                          className="relative p-1 rounded-xl bg-[#080A0C] border border-emerald-500/40 group"
                        >
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-16 object-cover rounded-lg border border-[#3D3016]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#0F1217] border border-[#3D3016] text-[#A89878] hover:text-red-400 transition-colors"
                            title="Quitar foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedPhotos.length < MAX_PHOTOS && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="cart-photo-upload"
                      />
                      <label
                        htmlFor="cart-photo-upload"
                        className="w-full bg-[#080A0C] border border-dashed border-[#524424] hover:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#A89878] hover:text-[#F3E5C8] flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                            <span>Procesando imagen...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#E2B755]" />
                            <span>
                              {uploadedPhotos.length > 0
                                ? 'Agregar otra foto'
                                : 'Seleccionar imagen(es) de tu dispositivo'}
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

              </div>


              {/* Submit CTA WhatsApp Button */}
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EAA52] text-[#0B0D10] font-extrabold text-sm hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                id="cart-submit-whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Solicitar artículos por WhatsApp</span>
              </button>

              {/* View / Download PDF Receipt Button */}
              <button
                onClick={handleGenerateReceipt}
                className="w-full py-2.5 px-4 rounded-xl bg-[#211A0C] border border-[#6B531F] text-[#F3E5C8] hover:border-[#D4AF37] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="cart-download-pdf-btn"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>📄 Ver / Descargar Cotización PDF</span>
              </button>

              {/* Short Notice Box */}
              <div className="p-3 rounded-xl bg-[#080A0C] border border-[#3D3016] text-[11px] text-[#A89878] space-y-1">
                <p className="font-bold text-[#E2B755] flex items-center gap-1">
                  <span>Importante:</span>
                </p>
                <p className="leading-relaxed">
                  Las muestras digitales se envían únicamente para revisión y aprobación. El trabajo final se realiza una vez aceptada la cotización y confirmado el anticipo. Los archivos finales sin marca de agua se entregan solo al completar el pago acordado.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
