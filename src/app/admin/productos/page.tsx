'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StoreService } from '@/lib/data/store-service';
import { Product, Category } from '@/types/database.types';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    setProducts(StoreService.getProducts());
    setCategories(StoreService.getCategories());

    const handleUpdate = () => {
      setProducts(StoreService.getProducts());
    };
    window.addEventListener('destinity_products_updated', handleUpdate);
    return () => window.removeEventListener('destinity_products_updated', handleUpdate);
  }, []);

  const handleToggleStatus = (product: Product) => {
    StoreService.saveProduct({
      ...product,
      is_published: !product.is_published,
    });
    setProducts(StoreService.getProducts());
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto "${title}"?`)) {
      StoreService.deleteProduct(id);
      setProducts(StoreService.getProducts());
    }
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' ? p.is_published : !p.is_published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-obsidian-950">
            Catálogo de Productos
          </h1>
          <p className="text-xs text-obsidian-500 mt-1">
            Gestiona inventario, precios, variantes y publicación en el escaparate.
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Añadir Nuevo Producto
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-obsidian-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o SKU..."
            className="w-full bg-[#fafaf9] border border-black/10 rounded-xl pl-9 pr-3 py-2 text-xs text-obsidian-900 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#fafaf9] border border-black/10 rounded-xl px-3 py-2 text-xs text-obsidian-800 font-medium"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#fafaf9] border border-black/10 rounded-xl px-3 py-2 text-xs text-obsidian-800 font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="published">Solo Publicados</option>
            <option value="draft">Solo Borradores</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fafaf9] border-b border-black/5 text-obsidian-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Producto</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-obsidian-500">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'Sin asignar';
                  return (
                    <tr key={product.id} className="hover:bg-black/[0.01] transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.featured_image}
                            alt={product.title}
                            className="w-12 h-14 object-cover rounded-xl border border-black/10 flex-shrink-0"
                          />
                          <div>
                            <Link
                              href={`/admin/productos/${product.id}`}
                              className="font-heading font-bold text-obsidian-950 hover:text-brand-600 transition-colors line-clamp-1"
                            >
                              {product.title}
                            </Link>
                            <span className="text-[11px] text-obsidian-400">
                              Slug: /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-obsidian-600">
                        {product.sku || '—'}
                      </td>

                      <td className="p-4 text-obsidian-600 font-medium">
                        {categoryName}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-obsidian-950">
                          {product.sale_price ? product.sale_price.toFixed(2) : product.price.toFixed(2)} €
                        </span>
                        {product.sale_price && (
                          <span className="block text-[10px] text-obsidian-400 line-through">
                            {product.price.toFixed(2)} €
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            product.stock <= 3 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {product.stock} uds
                        </span>
                        {product.stock <= 3 && (
                          <span className="block text-[10px] text-rose-500">Stock bajo</span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            product.is_published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-obsidian-100 text-obsidian-600 hover:bg-obsidian-200'
                          }`}
                          title="Haz clic para cambiar estado Publicado / Borrador"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.is_published ? 'bg-emerald-500' : 'bg-obsidian-400'
                            }`}
                          />
                          {product.is_published ? 'Publicado' : 'Borrador'}
                        </button>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/productos/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-obsidian-400 hover:text-obsidian-900 rounded-lg hover:bg-black/5"
                            title="Ver en tienda pública"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="p-1.5 text-obsidian-600 hover:text-brand-600 rounded-lg hover:bg-black/5"
                            title="Editar producto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-1.5 text-obsidian-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
