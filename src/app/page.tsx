'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { StoreService } from '@/lib/data/store-service';
import { Product, Category } from '@/types/database.types';
import { ArrowRight, Sparkles, Shield, Award, Gem, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setProducts(StoreService.getProducts());
    setCategories(StoreService.getCategories());

    const handleUpdate = () => {
      setProducts(StoreService.getProducts());
      setCategories(StoreService.getCategories());
    };
    window.addEventListener('destinity_products_updated', handleUpdate);
    return () => window.removeEventListener('destinity_products_updated', handleUpdate);
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products.filter((p) => p.is_published)
    : products.filter((p) => p.is_published && p.category_id === activeCategory);

  return (
    <>
      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-obsidian-950 text-white min-h-[85vh] flex items-center">
        {/* Subtle background luxury photography overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="Editorial Destinity ES"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Ambient Gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/80 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-brand-500/40 text-brand-300 text-xs font-semibold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Colección Otoño — Invierno 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
            >
              LA ELEGANCIA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-200">
                DEL SILENCIO
              </span> <br />
              Y LA FORMA.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-obsidian-200 leading-relaxed max-w-xl font-light"
            >
              Sastrería contemporánea de patronaje arquitectónico, cachemira noble y marroquinería de curtición vegetal creada artesanalmente en España.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                href="/productos"
                className="px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 font-bold text-sm tracking-wide transition-all shadow-xl hover:shadow-brand-500/20 flex items-center gap-2 group"
              >
                Explorar Catálogo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/productos?categoria=marroquineria-cuero"
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wide transition-all border border-white/15 backdrop-blur-md"
              >
                Marroquinería de Autor
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-black/40 backdrop-blur-md py-4 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs text-obsidian-300">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" /> Piel Genuina de Ubrique
            </span>
            <span className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-brand-400" /> Diseños de Edición Limitada
            </span>
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" /> Envío Gratuito desde 120€
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" /> Garantía de Devolución Oficial
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORIES PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Líneas de Diseño
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-obsidian-950 mt-1">
                Colecciones Emblemáticas
              </h2>
            </div>
            <Link
              href="/productos"
              className="text-sm font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1.5 mt-4 md:mt-0 group"
            >
              Ver todas las categorías
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-obsidian-900 shadow-md"
              >
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 inset-x-6">
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-1 mt-1 font-light">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-brand-300 font-semibold mt-3 group-hover:underline">
                    Descubrir piezas <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SHOWCASE */}
      <section className="py-20 bg-[#fafaf9] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Selección de Temporada
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-obsidian-950 mt-1">
                Piezas Destacadas
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                  activeCategory === 'all'
                    ? 'bg-obsidian-950 text-white shadow-sm'
                    : 'bg-white text-obsidian-700 hover:bg-black/5 border border-black/10'
                }`}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                    activeCategory === c.id
                      ? 'bg-obsidian-950 text-white shadow-sm'
                      : 'bg-white text-obsidian-700 hover:bg-black/5 border border-black/10'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL STORYTELLING SECTION */}
      <section className="py-24 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                alt="Taller de Artesanía Destinity ES"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase tracking-widest text-brand-300 font-bold">
                  Compromiso de Autor
                </span>
                <p className="font-heading text-xl font-bold mt-1">
                  &ldquo;La verdadera sofisticación reside en la honestidad de la materia prima y en la perfección de las costuras ocultas.&rdquo;
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Manifiesto de Marca
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-obsidian-950 leading-tight">
                Herencia de los Maestros Guarnicioneros en el Diseño Contemporáneo
              </h2>
              <p className="text-sm sm:text-base text-obsidian-600 leading-relaxed">
                En Destinity ES concebimos cada diseño como un diálogo entre la vanguardia arquitectónica y las técnicas tradicionales de la artesanía española. Trabajamos exclusivamente con curtidores de Ubrique, hilaturas de cachemira certificadas y maestros relojeros suizos.
              </p>
              <p className="text-sm sm:text-base text-obsidian-600 leading-relaxed">
                Sin logotipos estridentes ni tendencias efímeras: creamos piezas estructuradas, serenas y duraderas pensadas para trascender el paso del tiempo.
              </p>
              <div className="pt-4 flex items-center gap-6">
                <div>
                  <span className="font-heading text-2xl font-extrabold text-obsidian-950">100%</span>
                  <p className="text-xs text-obsidian-500">Curtición Vegetal</p>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div>
                  <span className="font-heading text-2xl font-extrabold text-obsidian-950">48h</span>
                  <p className="text-xs text-obsidian-500">Reserva de Calibre</p>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div>
                  <span className="font-heading text-2xl font-extrabold text-obsidian-950">5 Años</span>
                  <p className="text-xs text-obsidian-500">Garantía Oficial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
