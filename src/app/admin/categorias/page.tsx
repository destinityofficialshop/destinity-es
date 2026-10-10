'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreService } from '@/lib/data/store-service';
import { Category, Product } from '@/types/database.types';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Check,
  AlertCircle,
  X,
  Sparkles,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load categories and products
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        StoreService.fetchCategories(),
        StoreService.fetchProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      setCategories(StoreService.getCategories());
      setProducts(StoreService.getProducts());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setCategories(StoreService.getCategories());
      setProducts(StoreService.getProducts());
    };
    window.addEventListener('destinity_categories_updated', handleUpdate);
    window.addEventListener('destinity_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('destinity_categories_updated', handleUpdate);
      window.removeEventListener('destinity_products_updated', handleUpdate);
    };
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      display_order: categories.length + 1,
    });
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order,
    });
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      // Only auto-update slug if user hasn't explicitly customized an existing category slug
      slug: !editingCategory ? generatedSlug : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await StoreService.uploadImage(file);
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Error al subir la imagen a Supabase Storage' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre de la categoría es obligatorio.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await StoreService.saveCategory({
        id: editingCategory?.id,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        display_order: Number(formData.display_order) || 1,
        created_at: editingCategory?.created_at,
      });

      setStatusMessage({
        type: 'success',
        text: editingCategory ? 'Categoría actualizada con éxito.' : 'Categoría creada con éxito.',
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMessage(null);
      }, 700);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Ocurrió un error al guardar la categoría.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const count = products.filter((p) => p.category_id === category.id).length;
    const confirmText = count > 0
      ? `¿Eliminar "${category.name}"? Hay ${count} producto(s) asignados a esta categoría.`
      : `¿Estás seguro de eliminar la categoría "${category.name}"?`;

    if (confirm(confirmText)) {
      await StoreService.deleteCategory(category.id);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-500/10 text-brand-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="font-heading text-2xl font-bold text-obsidian-950">
              Categorías y Colecciones
            </h1>
          </div>
          <p className="text-sm text-obsidian-600 mt-1">
            Organiza el catálogo de Destinity ES en taxonomías y líneas de producto con sincronización en Supabase.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-sm hover:shadow-brand-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Categoría</span>
        </button>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
          <p className="text-xs font-semibold text-obsidian-500 uppercase tracking-wider">Total Categorías</p>
          <p className="text-2xl font-bold font-heading text-obsidian-950 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
          <p className="text-xs font-semibold text-obsidian-500 uppercase tracking-wider">Productos Asignados</p>
          <p className="text-2xl font-bold font-heading text-obsidian-950 mt-1">
            {products.filter((p) => p.category_id).length} / {products.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
          <p className="text-xs font-semibold text-obsidian-500 uppercase tracking-wider">Estado Base de Datos</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-bold text-emerald-700">Supabase RLS Activo</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o slug..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 bg-obsidian-50/50"
          />
        </div>
        <span className="text-xs text-obsidian-500">
          Mostrando {filteredCategories.length} de {categories.length} categorías
        </span>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm text-obsidian-500">Cargando categorías desde Supabase...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-obsidian-300 mx-auto" />
            <p className="text-sm font-semibold text-obsidian-700">No se encontraron categorías</p>
            <p className="text-xs text-obsidian-500">Crea una nueva categoría para organizar tus productos.</p>
            <button
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-500 text-obsidian-950 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Categoría
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-50/80 border-b border-black/5 text-obsidian-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5 w-16">Imagen</th>
                  <th className="px-6 py-3.5">Nombre & Descripción</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">Orden</th>
                  <th className="px-6 py-3.5 text-center">Productos</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCategories.map((category) => {
                  const productCount = products.filter((p) => p.category_id === category.id).length;
                  return (
                    <tr key={category.id} className="hover:bg-black/[0.015] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-obsidian-100 relative border border-black/5 shrink-0">
                          {category.image_url ? (
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-obsidian-400">
                              <Layers className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-obsidian-950 text-sm">{category.name}</p>
                          <p className="text-[11px] text-obsidian-500 line-clamp-1 mt-0.5">
                            {category.description || 'Sin descripción'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-obsidian-500">
                        <span className="bg-obsidian-100 px-2 py-1 rounded-md text-obsidian-700">
                          /{category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-obsidian-700">
                        {category.display_order}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {productCount} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <Link
                            href={`/?categoria=${category.slug}`}
                            target="_blank"
                            title="Ver en la tienda"
                            className="p-1.5 text-obsidian-400 hover:text-obsidian-900 hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(category)}
                            title="Editar categoría"
                            className="p-1.5 text-obsidian-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            title="Eliminar categoría"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-black/10 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-obsidian-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500 text-obsidian-950 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-obsidian-950">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <p className="text-[11px] text-obsidian-500">
                    Sincronización instantánea en catálogo de Supabase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-obsidian-400 hover:text-obsidian-900 rounded-xl hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-obsidian-900 mb-1.5">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Chaquetas & Abrigos"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-obsidian-50/50"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-obsidian-900 mb-1.5">
                  Slug URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. chaquetas-abrigos"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 bg-obsidian-50/50 font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-obsidian-900 mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve reseña que aparecerá en el encabezado de la colección..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 bg-obsidian-50/50 resize-none"
                />
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block text-xs font-bold text-obsidian-900 mb-1.5">
                  Imagen de Portada
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 bg-obsidian-50/50"
                  />
                  <label className="cursor-pointer px-3.5 py-2.5 bg-obsidian-100 hover:bg-obsidian-200 text-obsidian-900 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-black/5 transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.image_url && (
                  <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-black/10 bg-obsidian-100">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-bold text-obsidian-900 mb-1.5">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3.5 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:border-brand-500 bg-obsidian-50/50"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/10 text-obsidian-600 hover:bg-black/5 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
