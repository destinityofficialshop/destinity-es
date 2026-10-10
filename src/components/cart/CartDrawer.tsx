'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
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
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-black/10"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#fafaf9]">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-obsidian-950">
                    Bolsa de la Compra
                  </h3>
                  <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)} artículos
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 rounded-full text-obsidian-400 hover:text-black hover:bg-black/5 transition-colors"
                  aria-label="Cerrar bolsa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Bar */}
              <div className="p-4 bg-brand-50/70 border-b border-brand-200/50">
                <div className="flex items-center justify-between text-xs font-medium text-obsidian-800 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    {progress.remaining > 0 ? (
                      <>
                        Añade <strong className="text-brand-700">{progress.remaining.toFixed(2)} €</strong> para
                        Envío Gratuito
                      </>
                    ) : (
                      <strong className="text-emerald-700">¡Envío Gratuito Conseguido!</strong>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-brand-600">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-brand-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-black/5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4 border border-brand-200">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="font-heading text-base font-bold text-obsidian-900 mb-1">
                      Tu bolsa está vacía
                    </h4>
                    <p className="text-xs text-obsidian-500 max-w-xs mb-6">
                      Explora nuestras piezas artesanales de sastrería y marroquinería para comenzar tu pedido.
                    </p>
                    <button
                      onClick={closeCart}
                      className="px-6 py-2.5 bg-obsidian-950 text-white text-xs font-semibold rounded-full hover:bg-brand-600 transition-colors"
                    >
                      Ver Catálogo
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-20 h-24 object-cover rounded-lg border border-black/10 flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-obsidian-950 line-clamp-1 pr-2">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-obsidian-400 hover:text-rose-600 transition-colors p-1"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Selected Variants */}
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.selectedVariants).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="text-[11px] text-obsidian-600 bg-obsidian-100 px-1.5 py-0.5 rounded"
                                >
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-black/10 rounded-lg overflow-hidden bg-[#fafaf9]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-black/5 text-obsidian-600 transition-colors"
                              aria-label="Reducir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-obsidian-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-black/5 text-obsidian-600 transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-obsidian-950">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout button */}
              {items.length > 0 && (
                <div className="p-6 bg-[#fafaf9] border-t border-black/5 space-y-3">
                  <div className="space-y-1.5 text-xs text-obsidian-600">
                    <div className="flex justify-between">
                      <span>Subtotal (IVA 21% incluido)</span>
                      <span className="font-semibold text-obsidian-900">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos de envío estimadas</span>
                      <span className="font-semibold text-obsidian-900">
                        {shipping === 0 ? <span className="text-emerald-600 font-bold">Gratis</span> : `${shipping.toFixed(2)} €`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex justify-between items-baseline">
                    <span className="font-heading text-sm font-bold text-obsidian-950">Total</span>
                    <span className="font-heading text-lg font-extrabold text-brand-600">
                      {total.toFixed(2)} €
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-obsidian-950 hover:bg-brand-600 text-white text-sm font-semibold tracking-wide transition-all shadow-md group"
                  >
                    Proceder al Pago
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-obsidian-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pago 100% seguro con SSL y garantía oficial Destinity ES</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
