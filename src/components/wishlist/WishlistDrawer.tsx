'use client';

import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useCartStore } from '@/lib/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function WishlistDrawer() {
  const { items, isWishlistOpen, closeWishlist, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    removeItem(product.id);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h3 className="font-heading text-lg font-bold text-obsidian-950">
                    Piezas Guardadas
                  </h3>
                  <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <button
                  onClick={closeWishlist}
                  className="p-1.5 rounded-full text-obsidian-400 hover:text-black hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-black/5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 border border-rose-100">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h4 className="font-heading text-base font-bold text-obsidian-900 mb-1">
                      No tienes piezas guardadas
                    </h4>
                    <p className="text-xs text-obsidian-500 max-w-xs mb-6">
                      Haz clic en el icono de corazón en cualquier producto para guardarlo en tu lista de deseos.
                    </p>
                    <button
                      onClick={closeWishlist}
                      className="px-6 py-2.5 bg-obsidian-950 text-white text-xs font-semibold rounded-full hover:bg-brand-600 transition-colors"
                    >
                      Explorar Colección
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-xl border border-black/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/productos/${item.slug}`}
                          onClick={closeWishlist}
                          className="font-semibold text-xs text-obsidian-900 hover:text-brand-600 truncate block"
                        >
                          {item.title}
                        </Link>
                        <span className="font-bold text-xs text-obsidian-950 block mt-1">
                          {item.sale_price ? item.sale_price.toFixed(2) : item.price.toFixed(2)} €
                        </span>
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="mt-2 text-[11px] font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Mover a la Bolsa
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-obsidian-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 bg-[#fafaf9] border-t border-black/5">
                  <Link
                    href="/productos"
                    onClick={closeWishlist}
                    className="w-full py-3 rounded-xl bg-obsidian-950 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors"
                  >
                    Seguir Explorando
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
