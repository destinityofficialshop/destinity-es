'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { StoreService } from '@/lib/data/store-service';
import { useCartStore } from '@/lib/store/cart-store';
import { Product } from '@/types/database.types';
import { ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem } = useCartStore();

  useEffect(() => {
    const p = StoreService.getProductBySlug(slug);
    if (p) {
      setProduct(p);
      setSelectedImage(p.featured_image);

      // Initialize default variants
      const defaults: Record<string, string> = {};
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          if (v.options && v.options.length > 0) {
            defaults[v.name] = v.options[0];
          }
        });
      }
      setSelectedVariants(defaults);

      // Related products in same category
      const all = StoreService.getProducts();
      const related = all.filter((item) => item.id !== p.id && item.category_id === p.category_id).slice(0, 3);
      setRelatedProducts(related);
    }
  }, [slug]);

  if (!product) {
    return (
      <>
        <Header />
        <div className="py-32 text-center">
          <h2 className="font-heading text-2xl font-bold text-obsidian-900">Buscando producto...</h2>
          <p className="text-xs text-obsidian-500 mt-2">Cargando detalles de la pieza</p>
        </div>
        <Footer />
      </>
    );
  }

  const allImages = [product.featured_image, ...(product.gallery_images || [])];
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined;
  const currentPrice = hasDiscount ? (product.sale_price as number) : product.price;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Header />

      <main className="py-10 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-obsidian-400 mb-8">
            <Link href="/" className="hover:text-obsidian-900 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/productos" className="hover:text-obsidian-900 transition-colors">Catálogo</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-obsidian-900 font-medium truncate max-w-xs">{product.title}</span>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Featured Image */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-black/5 shadow-md">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />

                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Precio Especial
                  </span>
                )}
              </div>

              {/* Thumbnails Row */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === img
                          ? 'border-brand-500 shadow-md scale-105'
                          : 'border-black/5 hover:border-black/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Purchase Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    Edición Limitada
                  </span>
                  <span className="text-xs text-obsidian-400 font-mono">
                    SKU: {product.sku || 'DES-SKU'}
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-obsidian-950 leading-tight">
                  {product.title}
                </h1>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-heading text-3xl font-extrabold text-obsidian-950">
                    {currentPrice.toFixed(2)} €
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-obsidian-400 line-through">
                      {product.price.toFixed(2)} €
                    </span>
                  )}
                  <span className="text-xs text-obsidian-500 font-normal">
                    (IVA 21% incluido)
                  </span>
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="text-xs flex items-center gap-2">
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {product.stock <= 3
                      ? `Solo quedan ${product.stock} unidades en el taller de Madrid`
                      : 'Disponible para envío inmediato'}
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Agotado temporalmente
                  </span>
                )}
              </div>

              {/* Dynamic Variants Selectors */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-black/5">
                  {product.variants.map((vGroup) => (
                    <div key={vGroup.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-obsidian-800">
                        <span>Seleccionar {vGroup.name}:</span>
                        <span className="text-brand-700">{selectedVariants[vGroup.name]}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {vGroup.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [vGroup.name]: opt })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                              selectedVariants[vGroup.name] === opt
                                ? 'bg-obsidian-950 text-white border-obsidian-950 shadow-sm'
                                : 'bg-white text-obsidian-800 border-black/10 hover:border-black/30'
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

              {/* Quantity & Add to Cart */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <div className="flex gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-black/10 rounded-xl bg-white px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-2 text-obsidian-500 hover:text-black font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-obsidian-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-2 py-2 text-obsidian-500 hover:text-black font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-4 px-6 rounded-xl font-heading text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : product.stock === 0
                        ? 'bg-obsidian-200 text-obsidian-400 cursor-not-allowed'
                        : 'bg-obsidian-950 hover:bg-brand-600 text-white hover:shadow-brand-500/20'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        Añadido a la Bolsa
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Añadir a la Bolsa
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Checkout Link */}
                <Link
                  href="/checkout"
                  onClick={handleAddToCart}
                  className="block w-full py-3 text-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors"
                >
                  Comprar Ya &bull; Envío Express
                </Link>
              </div>

              {/* Guarantees Box */}
              <div className="bg-white rounded-2xl p-4 border border-black/5 space-y-3 text-xs text-obsidian-700">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Entrega en 24/48 horas con SEUR Express en España Peninsular</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>14 días de devolución garantizada sin costes adicionales</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Certificado de autenticidad Destinity ES y factura legal oficial</span>
                </div>
              </div>

              {/* Description & Technical Specifications */}
              <div className="space-y-4 pt-4 border-t border-black/5">
                <div>
                  <h3 className="font-heading text-sm font-bold text-obsidian-950 mb-2">
                    Descripción de la Pieza
                  </h3>
                  <p className="text-xs text-obsidian-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div>
                    <h3 className="font-heading text-sm font-bold text-obsidian-950 mb-2">
                      Ficha Técnica & Composición
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-black/5">
                      {Object.entries(product.attributes).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-obsidian-400 block text-[11px]">{key}</span>
                          <span className="font-medium text-obsidian-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-black/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                    Complementa tu estilo
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold text-obsidian-950">
                    Piezas Relacionadas
                  </h2>
                </div>
                <Link href="/productos" className="text-xs font-semibold text-brand-700 hover:underline">
                  Ver Colección
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
