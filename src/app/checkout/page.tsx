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
  Check,
  AlertCircle,
  X,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

const SPANISH_POSTAL_PREFIX_MAP: Record<string, string> = {
  '01': 'Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '05': 'Ávila',
  '06': 'Badajoz', '07': 'Illes Balears', '08': 'Barcelona', '09': 'Burgos', '10': 'Cáceres',
  '11': 'Cádiz', '12': 'Castellón', '13': 'Ciudad Real', '14': 'Córdoba', '15': 'A Coruña',
  '16': 'Cuenca', '17': 'Girona', '18': 'Granada', '19': 'Guadalajara', '20': 'Guipúzcoa',
  '21': 'Huelva', '22': 'Huesca', '23': 'Jaén', '24': 'León', '25': 'Lleida',
  '26': 'La Rioja', '27': 'Lugo', '28': 'Madrid', '29': 'Málaga', '30': 'Murcia',
  '31': 'Navarra', '32': 'Ourense', '33': 'Asturias', '34': 'Palencia', '35': 'Las Palmas',
  '36': 'Pontevedra', '37': 'Salamanca', '38': 'Santa Cruz de Tenerife', '39': 'Cantabria', '40': 'Segovia',
  '41': 'Sevilla', '42': 'Soria', '43': 'Tarragona', '44': 'Teruel', '45': 'Toledo',
  '46': 'Valencia', '47': 'Valladolid', '48': 'Vizcaya', '49': 'Zamora', '50': 'Zaragoza',
  '51': 'Ceuta', '52': 'Melilla',
};

// Algoritmo oficial de validación de DNI / NIE español
function validateSpanishId(id: string): boolean {
  if (!id) return false;
  const clean = id.trim().toUpperCase();
  const dniRegex = /^(\d{8})([A-Z])$/;
  const nieRegex = /^([XYZ])(\d{7})([A-Z])$/;
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';

  if (dniRegex.test(clean)) {
    const num = parseInt(clean.substring(0, 8), 10);
    const expectedLetter = letters[num % 23];
    return clean[8] === expectedLetter;
  }

  if (nieRegex.test(clean)) {
    let prefix = clean[0] === 'X' ? '0' : clean[0] === 'Y' ? '1' : '2';
    const num = parseInt(prefix + clean.substring(1, 8), 10);
    const expectedLetter = letters[num % 23];
    return clean[8] === expectedLetter;
  }

  // CIF o formato genérico
  return clean.length >= 8;
}

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
    notes: 'Por favor entregar en horario de tarde si es posible.',
    acceptTerms: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [bizumPhone, setBizumPhone] = useState('612345678');
  const [showBizumModal, setShowBizumModal] = useState(false);
  const [bizumOtp, setBizumOtp] = useState('');
  const [bizumTimer, setBizumTimer] = useState(115);

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardName, setCardName] = useState('CARLOS MENDOZA');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-detect province from Spanish postal code
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData((prev) => {
      const prefix = code.slice(0, 2);
      const detectedProvince = SPANISH_POSTAL_PREFIX_MAP[prefix] || prev.province;
      return {
        ...prev,
        postalCode: code,
        province: detectedProvince,
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isDniValid = validateSpanishId(formData.dniNie);

  // Execute Order Creation & Live Email
  const processFinalOrder = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
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
        id: `e1${Date.now().toString().slice(-6)}-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`,
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

      // 1. Guardar en Supabase PostgreSQL
      const newOrder = await StoreService.createOrder({
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

      // 2. Disparar email con Resend y Factura Oficial en PDF
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrder.id }),
        });
      } catch (emailErr) {
        console.warn('Resend email warning:', emailErr);
      }

      // 3. Vaciar bolsa
      clearCart();

      // 4. Redirigir con éxito
      router.push(`/checkout/success?orderNumber=${newOrder.order_number}`);
    } catch (err: any) {
      console.error('Error processing checkout:', err);
      setErrorMessage(err.message || 'Error al procesar el pago.');
      setIsProcessing(false);
      setShowBizumModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Tu bolsa está vacía.');
      return;
    }

    if (!formData.customerEmail || !formData.customerName || !formData.street) {
      setErrorMessage('Por favor completa todos los datos obligatorios.');
      return;
    }

    if (paymentMethod === 'bizum') {
      if (bizumPhone.replace(/\s+/g, '').length < 9) {
        setErrorMessage('Introduce un teléfono válido para Bizum.');
        return;
      }
      setShowBizumModal(true);
      return;
    }

    await processFinalOrder();
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
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/carrito"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-obsidian-600 hover:text-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a la Bolsa
            </Link>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              Pasarela Segura SSL 256-Bit &bull; Servidores en España
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Columna Izquierda: Formulario (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Bloque 1: Identidad y Contacto */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-heading text-lg font-bold text-obsidian-950">
                    Datos de Contacto y Facturación Oficial
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
                    <label className="block text-obsidian-700 font-medium mb-1">Correo Electrónico (Para Factura Oficial) *</label>
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
                    <label className="block text-obsidian-700 font-medium mb-1">Teléfono Móvil (Avisos SEUR 24h) *</label>
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-obsidian-700 font-medium">NIF / NIE / CIF *</label>
                      {isDniValid && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Formato Válido
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="dniNie"
                      required
                      placeholder="12345678Z"
                      value={formData.dniNie}
                      onChange={handleInputChange}
                      className={`w-full bg-[#fafaf9] border rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none font-mono uppercase ${
                        isDniValid ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Dirección en España */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-600" />
                    <h2 className="font-heading text-lg font-bold text-obsidian-950">
                      Dirección de Entrega
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-obsidian-700 font-medium mb-1">Calle, Número, Piso o Puerta *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Código Postal (España) *</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      maxLength={5}
                      value={formData.postalCode}
                      onChange={handlePostalCodeChange}
                      placeholder="28001"
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-obsidian-700 font-medium mb-1">Ciudad o Población *</label>
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
                    <label className="block text-obsidian-700 font-medium mb-1">Provincia (Autocompletada) *</label>
                    <input
                      type="text"
                      name="province"
                      required
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-[#fafaf9] border border-black/10 rounded-xl px-3.5 py-2.5 text-obsidian-900 font-semibold focus:outline-none focus:border-brand-500"
                    />
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

                <div className="pt-2 text-xs">
                  <label className="block text-obsidian-700 font-medium mb-1">Instrucciones para la entrega (SEUR)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ej. Dejar en conserjería si no estoy, timbre letra D..."
                    className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-3 text-obsidian-900 focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
              </div>

              {/* Bloque 3: Método de Pago */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                  <span className="w-7 h-7 rounded-full bg-obsidian-950 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-heading text-lg font-bold text-obsidian-950">
                    Seleccionar Método de Pago
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'stripe'
                        ? 'border-brand-500 bg-brand-50/60 text-obsidian-950 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <span className="text-xs font-bold">Tarjeta</span>
                    <span className="text-[10px] text-obsidian-400">Visa / MC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bizum')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'bizum'
                        ? 'border-brand-500 bg-brand-50/60 text-obsidian-950 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Bizum</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Móvil España</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'paypal'
                        ? 'border-brand-500 bg-brand-50/60 text-obsidian-950 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <span className="font-heading font-extrabold text-blue-600 text-sm">PayPal</span>
                    <span className="text-xs font-bold">PayPal</span>
                    <span className="text-[10px] text-obsidian-400">3 Plazos 0%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === 'apple_pay'
                        ? 'border-brand-500 bg-brand-50/60 text-obsidian-950 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-black/10 hover:border-black/20 text-obsidian-600'
                    }`}
                  >
                    <span className="font-heading font-extrabold text-obsidian-950 text-sm">Pay</span>
                    <span className="text-xs font-bold">Apple / Google</span>
                    <span className="text-[10px] text-obsidian-400">1-Click</span>
                  </button>
                </div>

                {/* Subformulario dinámico de pago */}
                <div className="mt-4 p-5 rounded-2xl bg-[#fafaf9] border border-black/5">
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-4">
                      {/* Visual Card Representation */}
                      <div className="max-w-xs mx-auto p-4 rounded-2xl bg-gradient-to-tr from-obsidian-950 via-obsidian-900 to-obsidian-800 text-white shadow-xl space-y-3 border border-white/10">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-heading font-extrabold tracking-wider text-brand-400">DESTINITY ES</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10">PREMIUM</span>
                        </div>
                        <div className="py-2">
                          <span className="font-mono text-sm tracking-widest text-white/90">{cardNumber}</span>
                        </div>
                        <div className="flex justify-between items-end text-[10px]">
                          <div>
                            <span className="text-white/40 block">TITULAR</span>
                            <span className="font-semibold uppercase tracking-wider">{cardName || 'TITULAR'}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block">CADUCA</span>
                            <span className="font-mono">{cardExpiry}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs pt-2">
                        <div>
                          <label className="block text-obsidian-600 mb-1">Nombre en la Tarjeta</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-semibold text-obsidian-900"
                          />
                        </div>
                        <div>
                          <label className="block text-obsidian-600 mb-1">Número de Tarjeta</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-mono text-obsidian-900"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-obsidian-600 mb-1">Caducidad (MM/AA)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 font-mono text-obsidian-900"
                            />
                          </div>
                          <div>
                            <label className="block text-obsidian-600 mb-1">CVC / CVV</label>
                            <input
                              type="text"
                              maxLength={4}
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
                        <span>Pago Inmediato con Bizum</span>
                      </div>
                      <p className="text-xs text-obsidian-600">
                        Introduce tu número de teléfono. Recibirás una notificación en la app de tu banco español para validar el pago de <strong>{total.toFixed(2)} €</strong>.
                      </p>
                      <div className="text-xs">
                        <label className="block text-obsidian-700 font-semibold mb-1">
                          Teléfono Móvil Bizum (+34)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-black/5 text-obsidian-500 font-mono text-xs">
                            +34
                          </span>
                          <input
                            type="tel"
                            maxLength={9}
                            value={bizumPhone}
                            onChange={(e) => setBizumPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="612345678"
                            className="flex-1 bg-white border border-black/10 rounded-r-xl px-3.5 py-2.5 font-mono text-obsidian-900 focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center py-4 space-y-2 text-xs text-obsidian-600">
                      <p>
                        Serás conectado a la pasarela cifrada de <strong>PayPal</strong> para autorizar el cargo de <strong>{total.toFixed(2)} €</strong>.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'apple_pay' && (
                    <div className="text-center py-4 space-y-2 text-xs text-obsidian-600">
                      <p>Confirmación con FaceID / TouchID o Google Wallet en 1 segundo.</p>
                    </div>
                  )}
                </div>

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
                      He leído y acepto los <a href="#terminos" className="text-brand-700 underline">Términos de Compra</a>, la garantía oficial de autenticidad y el derecho de desistimiento de 14 días.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-obsidian-950 pb-3 border-b border-black/5">
                Resumen del Pedido
              </h3>

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
                      <p className="text-obsidian-500">Uds: {item.quantity}</p>
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
                  <span>Envío Peninsular:</span>
                  <span className="font-semibold text-obsidian-900">
                    {shipping === 0 ? <span className="text-emerald-600 font-bold">Gratis</span> : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                  <span className="font-heading text-base font-bold text-obsidian-950">Total con 21% IVA:</span>
                  <span className="font-heading text-2xl font-extrabold text-brand-600">
                    {total.toFixed(2)} €
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando y Sincronizando con Supabase...
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
                  Emisión automática de Factura Oficial INV-2026 en PDF
                </p>
                <p>Envío transaccional en directo mediante Resend al instante</p>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* BIZUM REALISTIC SIMULATION MODAL */}
      {showBizumModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/10 space-y-5 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-black/5">
              <span className="font-heading font-extrabold text-emerald-600 text-base">Bizum Pay</span>
              <button onClick={() => setShowBizumModal(false)} className="text-obsidian-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <PhoneCall className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-heading text-base font-bold text-obsidian-950">
                Autorización de Cobro
              </h4>
              <p className="text-xs text-obsidian-500 mt-1">
                Hemos enviado una solicitud de pago de <strong>{total.toFixed(2)} €</strong> al teléfono móvil{' '}
                <strong>+34 {bizumPhone}</strong>.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left space-y-1">
              <span className="font-bold block">Código SMS de Verificación de Prueba:</span>
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm text-emerald-700">482910</span>
                <button
                  type="button"
                  onClick={() => setBizumOtp('482910')}
                  className="text-[11px] underline font-semibold text-emerald-800"
                >
                  Autocompletar
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-obsidian-700 font-semibold">Introduce la clave de 6 dígitos:</label>
              <input
                type="text"
                maxLength={6}
                value={bizumOtp}
                onChange={(e) => setBizumOtp(e.target.value)}
                placeholder="482910"
                className="w-full text-center tracking-widest font-mono text-lg font-bold border border-black/20 rounded-xl p-2.5 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              onClick={processFinalOrder}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Confirmando con el banco...' : 'Confirmar Pago Bizum'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
