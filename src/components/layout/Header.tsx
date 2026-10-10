'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { StoreService } from '@/lib/data/store-service';
import { Product } from '@/types/database.types';
import { Search, ShoppingBag, User, X, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const { openCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const [categories, setCategories] = useState(StoreService.getCategories());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const all = StoreService.getProducts();
      const filtered = all.filter(
        (p) =>
          p.is_published &&
          (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-black/5 py-3.5'
          : 'bg-white/70 backdrop-blur-sm border-b border-black/5 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-obsidian-800 hover:text-black"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-1.5 group">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-widest text-obsidian-950 transition-colors group-hover:text-brand-600">
              DESTINITY
            </span>
            <span className="text-xs font-bold tracking-widest text-brand-500 uppercase px-1.5 py-0.5 bg-brand-50 rounded border border-brand-200">
              ES
            </span>
          </Link>

          {/* Desktop Categories Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/productos"
              className={`text-sm tracking-wide transition-colors ${
                pathname === '/productos'
                  ? 'text-brand-600 font-semibold'
                  : 'text-obsidian-700 hover:text-brand-600 font-medium'
              }`}
            >
              Catálogo Completo
            </Link>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-sm tracking-wide text-obsidian-700 hover:text-brand-600 font-medium transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions: Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-obsidian-700 hover:text-brand-600 hover:bg-black/5 rounded-full transition-all"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account */}
            <Link
              href="/mi-cuenta"
              className="p-2.5 text-obsidian-700 hover:text-brand-600 hover:bg-black/5 rounded-full transition-all"
              aria-label="Mi Cuenta"
              title="Mi Cuenta & Pedidos"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-obsidian-900 hover:text-brand-600 hover:bg-black/5 rounded-full transition-all group"
              aria-label="Ver carrito de la compra"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-md px-6 py-4"
          >
            <nav className="flex flex-col gap-3">
              <Link
                href="/productos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-base font-semibold text-obsidian-900 border-b border-black/5"
              >
                Ver Todo el Catálogo
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-sm text-obsidian-700 hover:text-brand-600"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-black/5 flex justify-between items-center text-sm font-medium">
                <Link
                  href="/mi-cuenta"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-brand-600"
                >
                  Área de Cliente
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-obsidian-500 text-xs"
                >
                  Acceso Back-office
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Interactive Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-black/10"
            >
              {/* Search input header */}
              <div className="flex items-center px-6 py-4 border-b border-black/10 gap-3">
                <Search className="w-5 h-5 text-brand-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar abrigos, bolsos, fragancias, relojes..."
                  className="flex-1 text-base outline-none text-obsidian-900 placeholder:text-obsidian-400 font-medium"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-1 rounded-full text-obsidian-400 hover:text-black hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Search Results */}
              <div className="max-h-96 overflow-y-auto p-4 divide-y divide-black/5">
                {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                  <p className="text-center py-8 text-sm text-obsidian-500">
                    No se encontraron artículos para &ldquo;{searchQuery}&rdquo;.
                  </p>
                )}

                {searchQuery.trim().length <= 1 && (
                  <div className="py-6 px-2 text-xs text-obsidian-400 text-center uppercase tracking-wider">
                    Escribe para buscar en tiempo real en todo el catálogo de Destinity ES
                  </div>
                )}

                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 py-3 px-2 hover:bg-brand-50/50 rounded-xl transition-colors group"
                  >
                    <img
                      src={product.featured_image}
                      alt={product.title}
                      className="w-14 h-14 object-cover rounded-lg border border-black/10 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-obsidian-900 truncate group-hover:text-brand-600 transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-xs text-obsidian-500 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-obsidian-900">
                        {product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)} €
                      </span>
                      {product.sale_price && (
                        <span className="block text-[11px] line-through text-obsidian-400">
                          {product.price.toFixed(2)} €
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-obsidian-300 group-hover:text-brand-500" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
