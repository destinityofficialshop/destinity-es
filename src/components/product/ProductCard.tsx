'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database.types';
import { useCartStore } from '@/lib/store/cart-store';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.sale_price as number)) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default variant selections if available
    const defaultVariants: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaultVariants[v.name] = v.options[0];
        }
      });
    }

    addItem(product, 1, defaultVariants);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const currentImage =
    isHovered && product.gallery_images && product.gallery_images.length > 0
      ? product.gallery_images[0]
      : product.featured_image;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-black/5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f4f2]">
        <Link href={`/productos/${product.slug}`} className="block w-full h-full">
          <motion.img
            key={currentImage}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={currentImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-brand-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              -{discountPercent}%
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide uppercase">
              Últimas {product.stock} uds
            </span>
          )}
          {product.tags && product.tags.includes('Bestseller') && (
            <span className="bg-obsidian-950 text-brand-300 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              Bestseller
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 inset-x-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-obsidian-950 text-white hover:bg-brand-600'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                ¡Añadido a la Bolsa!
              </>
            ) : product.stock === 0 ? (
              'Agotado'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Añadir Rápido
              </>
            )}
          </button>

          <Link
            href={`/productos/${product.slug}`}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md text-obsidian-900 hover:text-brand-600 shadow-lg transition-colors flex items-center justify-center"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {product.tags && product.tags.length > 0 && (
            <div className="text-[11px] font-medium text-brand-700 tracking-wider uppercase mb-1">
              {product.tags[0]}
            </div>
          )}
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-heading text-base font-bold text-obsidian-950 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-obsidian-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & SKU */}
        <div className="pt-2 border-t border-black/5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base font-extrabold text-obsidian-950">
              {hasDiscount ? (product.sale_price as number).toFixed(2) : product.price.toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-xs text-obsidian-400 line-through">
                {product.price.toFixed(2)} €
              </span>
            )}
          </div>
          <span className="text-[10px] text-obsidian-400 font-mono">
            {product.sku || 'DES-SKU'}
          </span>
        </div>
      </div>
    </div>
  );
}
