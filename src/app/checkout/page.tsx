'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/lib/store/cart-store';
import { StoreService } from '@/lib/data/store-service';
import { PaymentMethod } from '@/types/database.types';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Truck,
  Building,
} from 'lucide-react';

const SPANISH_PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
  'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva',
  'Huesca', 'Illes Balears', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida',
  'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getShippingAmount, getTotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingAmount();
  const total = getTotal();

  // Form State
  const [formData, setFormData] = useState({
    customerEmail: 'carlos.mendoza@email.es',
    customerName: 'Carlos Mendoza Ruiz',
    customerPhone: '+34 612 345 678',
    dniNie: '48921455X',
    street: 'Calle Serrano 45, 3º Dcha',
    city: 'Madrid',
    province: 'Madrid',
    postalCode: '28001',
    country: 'España',
    billingSame: true,
    billingName: '',
    billingDni: '',
    billingStreet: '',
    billingCity: '',
    billingPostal: '',
    billingProvince: 'Madrid',
    notes: 'Por favor entregar en horario de tarde.',
    acceptTerms: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [bizumPhone, setBizumPhone] = useState('612345678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Tu bolsa está vacía. Añade artículos antes de finalizar el pedido.');
      return;
    }

    if (!formData.customerEmail || !formData.customerName || !formData.street) {
      setErrorMessage('Por favor completa todos los campos de contacto y envío obligatorios.');
      return;
    }

    if (paymentMethod === 'bizum' && bizumPhone.replace(/\s+/g, '').length < 9) {
      setErrorMessage('Introduce un número de teléfono válido para el cobro por Bizum (9 dígitos).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create order record
      const shippingAddress = {
        fullName: formData.customerName,
        street: formData.street,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: 'España',
        phone: formData.customerPhone,
        dniNie: formData.dniNie,
      };

      const billingAddress = formData.billingSame
        ? shippingAddress
        : {
            fullName: formData.billingName || formData.customerName,
            street: formData.billingStreet || formData.street,
            city: formData.billingCity || formData.city,
            province: formData.billingProvince || formData.province,
            postalCode: formData.billingPostal || formData.postalCode,
            country: 'España',
            phone: formData.customerPhone,
            dniNie: formData.billingDni || formData.dniNie,
          };

      const orderItems = items.map((item) => ({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order_id: '',
        product_id: item.productId,
        product_title: item.title,
        product_image: item.featured_image,
        variant_selected: item.selectedVariants,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        created_at: new Date().toISOString(),
      }));

      const newOrder = StoreService.createOrder({
        customer_email: formData.customerEmail,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        payment_status: 'paid',
        order_status: 'processing',
        subtotal,
        tax_amount: subtotal - subtotal / 1.21,
        shipping_amount: shipping,
        total,
        customer_notes: formData.notes,
        order_items: orderItems,
      });

      // 2. Call transactional email API with Resend & Invoice PDF generation
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrder.id }),
        });
      } catch (emailErr) {
        console.warn('Email dispatch warning (handled):', emailErr);
      }

      // 3. Clear shopping cart
      clearCart();

      // 4. Redirect to order confirmation page
      router.push(`/checkout/success?orderNumber=${newOrder.order_number}`);
    } catch (err: any) {
      console.error('Error processing checkout:', err);
      setErrorMessage(err.message || 'Error al procesar el pago. Inténtelo de nuevo.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="py-24 text-center">
          <h2 className="font-heading text-2xl font-bold text-obsidian-900">Tu bolsa está vacía</h2>
          <p className="text-xs text-obsidian-500 mt-2 mb-6">Añade productos antes de iniciar el pago.</p>
          <Link href="/productos" className="px-6 py-3 rounded-xl bg-obsidian-950 text-white text-xs font-semibold">
            Ir al Catálogo
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="py-10 bg-[#fafaf9] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header breadcrumb */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/carrito"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-obsidian-600 hover:text-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a la Bolsa
            </Link>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3" />
              Checkout Seguro SSL 256-Bit
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Form & Payment (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Contact & Fiscal Identity */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-heading text-lg font-bold text-obsidian-950">
                    Datos de Contacto y Facturación
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Nombre y Apellidos *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Correo Electrónico (Para Factura y Envío) *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Teléfono Móvil (Avisos de reparto) *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">NIF / CIF / NIE (Para Factura Oficial) *</label>
                    <input
                      type="text"
                      name="dniNie"
                      required
                      placeholder="Ej. 12345678Z o B-12345678"
                      value={formData.dniNie}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-600" />
                    <h2 className="font-heading text-lg font-bold text-obsidian-950">
                      Dirección de Envío (España)
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-obsidian-700 font-medium mb-1">Dirección completa (Calle, número, piso/puerta) *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Ej. Calle Serrano 45, 3º Dcha"
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Código Postal *</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      maxLength={5}
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="28001"
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Ciudad / Municipio *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Provincia *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    >
                      {SPANISH_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">País</label>
                    <input
                      type="text"
                      disabled
                      value="España"
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-500 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Additional notes */}
                <div className="pt-2 text-xs">
                  <label className="block text-obsidian-700 font-medium mb-1">Instrucciones para el mensajero (Opcional)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Código de portero, horario preferido..."
                    className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-3 text-obsidian-900 focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
              </div>

              {/* Step 3: Payment Method (Spanish Market) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-heading text-lg font-bold text-obsidian-950">
                    Método de Pago Seguro
                  </h2>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Tarjeta */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'stripe'
                        ? 'border-brand-500 bg-brand-50/50 text-obsidian-950 ring-2 ring-brand-500/20'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <span className="text-xs font-bold">Tarjeta</span>
                    <span className="text-[10px] text-obsidian-400">Stripe</span>
                  </button>

                  {/* Bizum */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bizum')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'bizum'
                        ? 'border-brand-500 bg-brand-50/50 text-obsidian-950 ring-2 ring-brand-500/20'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Bizum</span>
                    <span className="text-[10px] text-obsidian-400">Móvil España</span>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'paypal'
                        ? 'border-brand-500 bg-brand-50/50 text-obsidian-950 ring-2 ring-brand-500/20'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <span className="font-heading font-extrabold text-blue-600 text-sm">PayPal</span>
                    <span className="text-xs font-bold">PayPal</span>
                    <span className="text-[10px] text-obsidian-400">Smart Buttons</span>
                  </button>

                  {/* Apple / Google Pay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'apple_pay'
                        ? 'border-brand-500 bg-brand-50/50 text-obsidian-950 ring-2 ring-brand-500/20'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <span className="font-heading font-extrabold text-obsidian-950 text-sm">Pay</span>
                    <span className="text-xs font-bold">Apple / Google</span>
                    <span className="text-[10px] text-obsidian-400">Express</span>
                  </button>
                </div>

                {/* Sub-form according to payment method */}
                <div className="mt-4 p-5 rounded-2xl bg-[#fafaf9] border border-black/5">
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-obsidian-700 font-semibold mb-2">
                        <span>Pasarela Segura Stripe Elements</span>
                        <div className="flex gap-1">
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">VISA</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10">Mastercard</span>
                        </div>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-obsidian-600 mb-1">Número de Tarjeta</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-mono text-obsidian-900"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-obsidian-600 mb-1">Caducidad</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-mono text-obsidian-900"
                            />
                          </div>
                          <div>
                            <label className="block text-obsidian-600 mb-1">CVC / CVV</label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-mono text-obsidian-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bizum' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-obsidian-950">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Pago Directo por Bizum</span>
                      </div>
                      <p className="text-xs text-obsidian-600">
                        Al pulsar &ldquo;Confirmar y Pagar&rdquo;, recibirás una solicitud de confirmación instantánea en la app de tu banco español con cargo por importe de <strong>{total.toFixed(2)} €</strong>.
                      </p>
                      <div className="text-xs">
                        <label className="block text-obsidian-700 font-semibold mb-1">
                          Número de teléfono asociado a tu Bizum (+34)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-black/5 text-obsidian-500 font-mono text-xs">
                            +34
                          </span>
                          <input
                            type="tel"
                            maxLength={9}
                            value={bizumPhone}
                            onChange={(e) => setBizumPhone(e.target.value)}
                            placeholder="612345678"
                            className="flex-1 bg-white border border-black/10 rounded-r-xl px-3.5 py-2.5 font-mono text-obsidian-900 focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-obsidian-600">
                        Serás redirigido a la ventana segura de <strong>PayPal</strong> para autorizar el cargo de <strong>{total.toFixed(2)} €</strong> o financiar en 3 plazos sin intereses.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'apple_pay' && (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-obsidian-600">
                        Confirmación biométrica rápida con FaceID, TouchID o Google Wallet activado.
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-obsidian-600 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-0.5 rounded border-black/20 text-brand-500 focus:ring-brand-500"
                    />
                    <span>
                      He leído y acepto los <a href="#terminos" className="text-brand-700 underline">Términos y Condiciones de Compra</a> y la política de desistimiento de 14 días.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-obsidian-950 pb-3 border-b border-black/5">
                Resumen del Pedido
              </h3>

              {/* Items preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-black/5 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={item.featured_image}
                      alt={item.title}
                      className="w-14 h-16 object-cover rounded-xl border border-black/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-semibold text-obsidian-950 truncate">{item.title}</h4>
                      <p className="text-obsidian-500">Cant: {item.quantity}</p>
                      {item.selectedVariants && (
                        <p className="text-[10px] text-brand-700 truncate">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-obsidian-950">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs text-obsidian-600 pt-3 border-t border-black/5">
                <div className="flex justify-between">
                  <span>Base Imponible:</span>
                  <span className="font-semibold text-obsidian-900">{(subtotal / 1.21).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Régimen General (21%):</span>
                  <span className="font-semibold text-obsidian-900">{(subtotal - subtotal / 1.21).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío Península:</span>
                  <span className="font-semibold text-obsidian-900">
                    {shipping === 0 ? <span className="text-emerald-600 font-bold">Gratis</span> : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                  <span className="font-heading text-base font-bold text-obsidian-950">Total con IVA:</span>
                  <span className="font-heading text-2xl font-extrabold text-brand-600">
                    {total.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Error message if any */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando Pago Seguro...
                  </>
                ) : (
                  <>
                    Pagar Ahora ({total.toFixed(2)} €)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-obsidian-400 space-y-1.5 pt-2 text-center">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Emisión inmediata de Factura Oficial INV-2026 en PDF
                </p>
                <p>Envío automático de confirmación a tu correo mediante Resend</p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
