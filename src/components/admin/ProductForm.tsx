'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StoreService } from '@/lib/data/store-service';
import { Product, Category, ProductVariantGroup } from '@/types/database.types';
import {
  UploadCloud,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Tag,
  FolderPlus,
} from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product;
}

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialProduct);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [salePrice, setSalePrice] = useState(initialProduct?.sale_price?.toString() || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '10');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || '');
  const [isPublished, setIsPublished] = useState(initialProduct ? initialProduct.is_published : true);
  const [featuredImage, setFeaturedImage] = useState(
    initialProduct?.featured_image ||
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProduct?.gallery_images || [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    ]
  );
  const [tags, setTags] = useState<string[]>(initialProduct?.tags || ['Sastrería', 'Edición Limitada']);
  const [newTagInput, setNewTagInput] = useState('');

  // Dynamic Variants
  const [variants, setVariants] = useState<ProductVariantGroup[]>(
    initialProduct?.variants || [
      { name: 'Talla', options: ['S', 'M', 'L', 'XL'] },
    ]
  );

  // Attributes
  const [attributes, setAttributes] = useState<Record<string, string>>(
    initialProduct?.attributes || { Origen: 'España', Confección: 'Artesanal' }
  );
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setCategories(StoreService.getCategories());
  }, []);

  // Auto-slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Add category on the fly
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = StoreService.saveCategory({ name: newCategoryName.trim() });
    setCategories(StoreService.getCategories());
    setCategoryId(cat.id);
    setNewCategoryName('');
    setShowAddCatModal(false);
  };

  // Tag management
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Variant management
  const handleAddVariantGroup = () => {
    setVariants([...variants, { name: 'Nueva Variante', options: ['Opción 1'] }]);
  };

  const handleUpdateVariantName = (index: number, name: string) => {
    const updated = [...variants];
    updated[index].name = name;
    setVariants(updated);
  };

  const handleAddOptionToVariant = (groupIndex: number, optionVal: string) => {
    if (!optionVal.trim()) return;
    const updated = [...variants];
    if (!updated[groupIndex].options.includes(optionVal.trim())) {
      updated[groupIndex].options.push(optionVal.trim());
      setVariants(updated);
    }
  };

  const handleRemoveOptionFromVariant = (groupIndex: number, optIndex: number) => {
    const updated = [...variants];
    updated[groupIndex].options.splice(optIndex, 1);
    setVariants(updated);
  };

  const handleRemoveVariantGroup = (groupIndex: number) => {
    setVariants(variants.filter((_, idx) => idx !== groupIndex));
  };

  // Drag & drop image simulation (or image URL add)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    // In browser client with Supabase storage, we would upload to bucket 'product-images'
    // Here we support drop simulation with high-res curated photos
    const demoPhotos = [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    ];
    const picked = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
    setGalleryImages([...galleryImages, picked]);
  };

  const handleAddAttribute = () => {
    if (attrKey.trim() && attrVal.trim()) {
      setAttributes({ ...attributes, [attrKey.trim()]: attrVal.trim() });
      setAttrKey('');
      setAttrVal('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const copy = { ...attributes };
    delete copy[key];
    setAttributes(copy);
  };

  // Save product
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !featuredImage) {
      alert('Por favor completa el título, precio y la imagen destacada.');
      return;
    }

    setSaving(true);
    const saved = StoreService.saveProduct({
      id: initialProduct?.id,
      title,
      slug,
      description,
      price: parseFloat(price),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      sku: sku || `DES-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: parseInt(stock) || 0,
      is_published: isPublished,
      category_id: categoryId || null,
      featured_image: featuredImage,
      gallery_images: galleryImages,
      tags,
      variants,
      attributes,
    });

    setSaving(false);
    setSuccessMessage('¡Producto guardado y sincronizado con éxito!');
    setTimeout(() => {
      router.push('/admin/productos');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="p-2 rounded-xl bg-white border border-black/10 text-obsidian-600 hover:text-black hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-obsidian-950">
              {isEditing ? `Editar: ${initialProduct.title}` : 'Crear Nuevo Producto'}
            </h1>
            <p className="text-xs text-obsidian-500">
              Configura detalles, variantes dinámicas, inventario y galería en Supabase Storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Published / Draft Switch */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-black/10 text-xs font-semibold">
            <span className="text-obsidian-600">Estado:</span>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-obsidian-200 text-obsidian-700'
              }`}
            >
              {isPublished ? 'Publicado' : 'Borrador'}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Essential details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-obsidian-900 mb-1">
                Título del Producto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Ej. Abrigo Estructurado de Cachemira 'Élysée'"
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-3 text-sm font-semibold text-obsidian-950 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-obsidian-900">
                  Slug URL (Único) *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-brand-600 hover:underline"
                >
                  {autoSlug ? 'Modo manual' : 'Modo automático'}
                </button>
              </div>
              <div className="flex items-center">
                <span className="bg-black/5 border border-r-0 border-black/10 text-obsidian-400 px-3 py-2 text-xs rounded-l-xl font-mono">
                  /productos/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  className="flex-1 bg-[#fafaf9] border border-black/10 rounded-r-xl p-2 text-xs font-mono text-obsidian-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-obsidian-900 mb-1">
                Descripción Editorial del Producto
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la silueta, materiales, artesanía y acabados..."
                className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-3 text-xs text-obsidian-800 focus:outline-none focus:border-brand-500 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-obsidian-950 pb-2 border-b border-black/5">
              Precios e Inventario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-obsidian-700 font-semibold mb-1">
                  Precio General (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="640.00"
                  className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-obsidian-700 font-semibold mb-1">
                  Precio Rebajado (€) (Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="580.00"
                  className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-obsidian-700 font-semibold mb-1">
                  SKU (Identificador de inventario)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="DES-MOD-01"
                  className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono uppercase focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-obsidian-700 font-semibold mb-1">
                  Stock Disponible (Unidades) *
                </label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="14"
                  className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-obsidian-900 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Variants Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div>
                <h3 className="font-heading text-sm font-bold text-obsidian-950">
                  Variantes Dinámicas
                </h3>
                <p className="text-[11px] text-obsidian-400">
                  Configura tallas, colores, materiales o esferas de reloj.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariantGroup}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold hover:bg-brand-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Grupo
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((vGroup, gIdx) => (
                <div key={gIdx} className="p-4 bg-[#fafaf9] rounded-2xl border border-black/5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={vGroup.name}
                      onChange={(e) => handleUpdateVariantName(gIdx, e.target.value)}
                      placeholder="Nombre del grupo (ej. Talla, Color)"
                      className="bg-white border border-black/10 rounded-xl px-3 py-1.5 text-xs font-bold text-obsidian-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariantGroup(gIdx)}
                      className="text-obsidian-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {vGroup.options.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-black/10 rounded-xl text-xs font-medium text-obsidian-900 shadow-sm"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromVariant(gIdx, oIdx)}
                          className="text-obsidian-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Quick add option inline */}
                    <input
                      type="text"
                      placeholder="+ Añadir opción y Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOptionToVariant(gIdx, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="bg-white border border-dashed border-black/20 rounded-xl px-3 py-1 text-xs text-obsidian-700 w-44"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Attributes */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-obsidian-950 pb-2 border-b border-black/5">
              Atributos Técnicos & Composición
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(attributes).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-2.5 rounded-xl bg-[#fafaf9] border border-black/5">
                  <div>
                    <span className="text-obsidian-400 block text-[10px]">{k}</span>
                    <span className="font-semibold text-obsidian-900">{v}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(k)}
                    className="text-obsidian-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Propiedad (ej. Forro)"
                value={attrKey}
                onChange={(e) => setAttrKey(e.target.value)}
                className="flex-1 bg-[#fafaf9] border border-black/10 rounded-xl p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Valor (ej. 100% Cupro)"
                value={attrVal}
                onChange={(e) => setAttrVal(e.target.value)}
                className="flex-1 bg-[#fafaf9] border border-black/10 rounded-xl p-2 text-xs"
              />
              <button
                type="button"
                onClick={handleAddAttribute}
                className="px-4 py-2 bg-obsidian-950 text-white rounded-xl text-xs font-semibold hover:bg-brand-600"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Category, Tags, Storage Images (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Selector with on-the-fly creation */}
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-obsidian-900">
                Categoría *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCatModal(!showAddCatModal)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline"
              >
                <FolderPlus className="w-3 h-3" />
                + Crear al vuelo
              </button>
            </div>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#fafaf9] border border-black/10 rounded-xl p-2.5 text-xs text-obsidian-900 font-medium"
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Quick add category form */}
            {showAddCatModal && (
              <div className="p-3 bg-brand-50 rounded-2xl border border-brand-200 space-y-2">
                <span className="text-[11px] font-bold text-brand-900 block">
                  Añadir categoría al instante
                </span>
                <input
                  type="text"
                  placeholder="Nombre de categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl p-2 text-xs text-obsidian-900"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-obsidian-950 text-xs font-bold rounded-xl"
                >
                  Guardar Categoría
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-3">
            <label className="text-xs font-bold text-obsidian-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              Etiquetas / Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fafaf9] border border-black/10 rounded-lg text-xs font-medium text-obsidian-800"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-obsidian-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Nuevo tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-[#fafaf9] border border-black/10 rounded-xl px-3 py-1.5 text-xs text-obsidian-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-obsidian-950 hover:bg-black text-white text-xs font-semibold rounded-xl"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Supabase Storage Image Gallery */}
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-obsidian-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                Galería (Supabase Storage)
              </label>
              <span className="text-[10px] text-emerald-600 font-mono">
                bucket: product-images
              </span>
            </div>

            {/* Featured Image Preview */}
            <div>
              <span className="text-[11px] text-obsidian-500 block mb-1.5">
                Imagen Destacada Principal:
              </span>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-[#fafaf9]">
                <img
                  src={featuredImage}
                  alt="Imagen destacada"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-black/10 bg-[#fafaf9] hover:border-brand-400'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-obsidian-900">
                Arrastra fotos de producto aquí
              </p>
              <p className="text-[10px] text-obsidian-400 mt-1">
                Conectado directamente a Supabase Storage con RLS
              </p>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] text-obsidian-500 block">
                  Vistas secundarias (Haz clic para hacerla principal):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-black/10">
                      <img src={img} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setFeaturedImage(img)} />
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
