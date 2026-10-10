'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database.types';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const { toggleItem, isItemInWishlist } = useWishlistStore();

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isItemInWishlist(product.id);
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined;
  const currentPrice = hasDiscount ? (product.sale_price as number) : product.price;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-black/10 relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-obsidian-700 hover:text-black shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image side */}
            <div className="relative aspect-[4/5] bg-[#fafaf9]">
              <img
                src={product.featured_image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-brand-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  Oferta Especial
                </span>
              )}
            </div>

            {/* Info side */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Vista Rápida &bull; {product.sku || 'DES-SKU'}
                </span>
                <h3 className="font-heading text-xl font-extrabold text-obsidian-950 mt-1 leading-snug">
                  {product.title}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-extrabold text-obsidian-950">
                    {currentPrice.toFixed(2)} €
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-obsidian-400 line-through">
                      {product.price.toFixed(2)} €
                    </span>
                  )}
                  <span className="text-[11px] text-obsidian-400">(IVA incluido)</span>
                </div>

                <p className="text-xs text-obsidian-600 line-clamp-3 mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {product.variants.map((vGroup) => (
                      <div key={vGroup.name} className="space-y-1">
                        <span className="text-[11px] font-semibold text-obsidian-700 block">
                          {vGroup.name}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {vGroup.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setSelectedVariants({ ...selectedVariants, [vGroup.name]: opt })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                selectedVariants[vGroup.name] === opt
                                  ? 'bg-obsidian-950 text-white border-obsidian-950'
                                  : 'bg-white text-obsidian-700 border-black/10 hover:border-black/30'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-3 border-t border-black/5">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-obsidian-950 hover:bg-brand-600 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" /> ¡Añadido!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Añadir a la Bolsa
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleItem(product)}
                    className={`p-3 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'border-black/10 hover:bg-black/5 text-obsidian-600'
                    }`}
                    title="Guardar en favoritos"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                <Link
                  href={`/productos/${product.slug}`}
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold text-brand-700 hover:text-brand-900 block"
                >
                  Ver Ficha Completa con Detalles de Sastrería &rarr;
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
