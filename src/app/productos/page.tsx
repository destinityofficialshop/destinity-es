'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { StoreService } from '@/lib/data/store-service';
import { Product, Category } from '@/types/database.types';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categoria');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    StoreService.fetchProducts().then(setProducts).catch(() => setProducts(StoreService.getProducts()));
    StoreService.fetchCategories().then(setCategories).catch(() => setCategories(StoreService.getCategories()));

    const handleUpdate = () => {
      setProducts(StoreService.getProducts());
      setCategories(StoreService.getCategories());
    };
    window.addEventListener('destinity_products_updated', handleUpdate);
    window.addEventListener('destinity_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('destinity_products_updated', handleUpdate);
      window.removeEventListener('destinity_categories_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Filter products
  let filtered = products.filter((p) => p.is_published);

  if (selectedCategory !== 'all') {
    // Check if matching slug or id
    const matchedCategory = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
    if (matchedCategory) {
      filtered = filtered.filter((p) => p.category_id === matchedCategory.id);
    }
  }

  if (onlyInStock) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // Sort
  filtered.sort((a, b) => {
    const priceA = a.sale_price !== null ? a.sale_price : a.price;
    const priceB = b.sale_price !== null ? b.sale_price : b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  return (
    <div className="py-12 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Description */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Catálogo Oficial Destinity ES
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-obsidian-950 mt-1">
            Colección Completa
          </h1>
          <p className="text-sm text-obsidian-500 mt-2">
            Prendas de autor, marroquinería de Ubrique y accesorios selectos de lujo discreto.
          </p>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-obsidian-950 text-white'
                  : 'bg-transparent text-obsidian-700 hover:bg-black/5'
              }`}
            >
              Todos ({products.filter((p) => p.is_published).length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === c.slug
                    ? 'bg-obsidian-950 text-white'
                    : 'bg-transparent text-obsidian-700 hover:bg-black/5'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs text-obsidian-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded border-black/20 text-brand-500 focus:ring-brand-500"
              />
              Solo en stock
            </label>

            <div className="flex items-center gap-2 text-xs text-obsidian-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-obsidian-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-obsidian-900 border-none outline-none cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="newest">Más Recientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs text-obsidian-500 mb-6 flex justify-between items-center">
          <span>Mostrando {filtered.length} piezas</span>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-black/5">
            <SlidersHorizontal className="w-10 h-10 text-obsidian-300 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-obsidian-900">
              No se han encontrado productos
            </h3>
            <p className="text-xs text-obsidian-500 max-w-sm mx-auto mt-1 mb-4">
              Prueba a cambiar los filtros o a seleccionar otra categoría.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setOnlyInStock(false);
              }}
              className="px-5 py-2 rounded-xl bg-obsidian-950 text-white text-xs font-semibold"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center text-sm text-obsidian-500">Cargando catálogo...</div>}>
        <CatalogContent />
      </Suspense>
      <Footer />
    </>
  );
}
