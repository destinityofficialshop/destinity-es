'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/lib/store/cart-store';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingAmount,
    getTotal,
    getFreeShippingProgress,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingAmount();
  const total = getTotal();
  const progress = getFreeShippingProgress();

  return (
    <>
      <Header />
      <main className="py-12 bg-[#fafaf9] min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-extrabold text-obsidian-950 mb-8">
            Bolsa de la Compra
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-black/5 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-200">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-xl font-bold text-obsidian-900 mb-2">
                Tu bolsa está vacía
              </h2>
              <p className="text-xs text-obsidian-500 mb-6">
                Descubre nuestras colecciones de sastrería y accesorios artesanales para comenzar.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-obsidian-950 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
              >
                Explorar Catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
                {/* Free shipping bar */}
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200">
                  <div className="flex justify-between text-xs font-medium text-obsidian-800 mb-2">
                    <span>
                      {progress.remaining > 0 ? (
                        <>Faltan <strong>{progress.remaining.toFixed(2)} €</strong> para disfrutar de <strong>Envío Gratuito</strong></>
                      ) : (
                        <strong className="text-emerald-700">¡Envío Gratuito Conseguido para este pedido!</strong>
                      )}
                    </span>
                    <span className="font-bold text-brand-700">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>

                <div className="divide-y divide-black/5">
                  {items.map((item) => (
                    <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-24 h-28 object-cover rounded-2xl border border-black/5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/productos/${item.slug}`}>
                          <h3 className="font-heading text-base font-bold text-obsidian-950 hover:text-brand-600 transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        {item.selectedVariants && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.selectedVariants).map(([k, v]) => (
                              <span key={k} className="text-xs text-obsidian-600 bg-obsidian-100 px-2 py-0.5 rounded">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-obsidian-400 block mt-1 font-mono">
                          {item.sku || 'DES-SKU'}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Stepper */}
                        <div className="flex items-center border border-black/10 rounded-xl bg-[#fafaf9]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-black/5 text-obsidian-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-obsidian-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-black/5 text-obsidian-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-heading text-base font-extrabold text-obsidian-950 w-24 text-right">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-obsidian-400 hover:text-rose-600 transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
                <h2 className="font-heading text-lg font-bold text-obsidian-950">
                  Resumen de Compra
                </h2>

                <div className="space-y-3 text-xs text-obsidian-600 pb-4 border-b border-black/5">
                  <div className="flex justify-between">
                    <span>Base imponible:</span>
                    <span className="font-semibold text-obsidian-900">{(subtotal / 1.21).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA Régimen General (21%):</span>
                    <span className="font-semibold text-obsidian-900">{(subtotal - subtotal / 1.21).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos de envío (España):</span>
                    <span className="font-semibold text-obsidian-900">
                      {shipping === 0 ? <span className="text-emerald-600 font-bold">Gratis</span> : `${shipping.toFixed(2)} €`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-heading text-base font-bold text-obsidian-950">Total a Pagar</span>
                  <span className="font-heading text-2xl font-extrabold text-brand-600">
                    {total.toFixed(2)} €
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Continuar al Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-obsidian-400 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pasarelas certificadas: Tarjeta, Bizum, PayPal y Apple Pay</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
