import { Product, Category, Order, StoreSettings, Profile } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  DEMO_ADMIN_USER,
  DEMO_CUSTOMER_USER,
} from './mock-data';

const STORAGE_KEYS = {
  PRODUCTS: 'destinity_products_v2',
  CATEGORIES: 'destinity_categories_v2',
  ORDERS: 'destinity_orders_v2',
  SETTINGS: 'destinity_settings_v2',
  CURRENT_USER: 'destinity_current_user_v2',
};

// Memory cache
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

export const StoreService = {
  // ==========================================
  // PRODUCTS
  // ==========================================
  getProducts(): Product[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return memoryProducts;
  },

  async fetchProducts(): Promise<Product[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        memoryProducts = data as Product[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          window.dispatchEvent(new Event('destinity_products_updated'));
        }
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase fetch products error, using cache:', err);
    }
    return this.getProducts();
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  async saveProduct(productData: Partial<Product> & { title: string; price: number; featured_image: string }): Promise<Product> {
    const products = this.getProducts();
    const isNew = !productData.id;
    const baseSlug = productData.slug || productData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const id = productData.id || `b1${Date.now().toString().slice(-6)}-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;

    const product: Product = {
      id,
      title: productData.title,
      slug: baseSlug,
      description: productData.description || '',
      price: Number(productData.price),
      sale_price: productData.sale_price ? Number(productData.sale_price) : null,
      sku: productData.sku || `DES-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: productData.stock !== undefined ? Number(productData.stock) : 10,
      is_published: productData.is_published !== undefined ? productData.is_published : true,
      category_id: productData.category_id || null,
      featured_image: productData.featured_image,
      gallery_images: productData.gallery_images || [],
      tags: productData.tags || [],
      variants: productData.variants || [],
      attributes: productData.attributes || {},
      created_at: productData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Optimistic local update
    let updatedList: Product[];
    if (isNew) {
      updatedList = [product, ...products];
    } else {
      updatedList = products.map((p) => (p.id === product.id ? product : p));
    }
    memoryProducts = updatedList;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('destinity_products_updated'));
    }

    // 2. Persist to live Supabase
    try {
      const supabase = createClient();
      const payload = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        sku: product.sku,
        stock: product.stock,
        is_published: product.is_published,
        category_id: product.category_id,
        featured_image: product.featured_image,
        gallery_images: product.gallery_images,
        tags: product.tags,
        variants: product.variants,
        attributes: product.attributes,
        updated_at: product.updated_at,
      };

      const { data, error } = await (supabase.from('products') as any).upsert(payload).select().single();
      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn('Supabase upsert product warning:', err);
    }

    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = this.getProducts().filter((p) => p.id !== id);
    memoryProducts = products;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event('destinity_products_updated'));
    }

    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete product warning:', err);
    }
    return true;
  },

  async updateStock(id: string, delta: number): Promise<number> {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (!target) return 0;
    const newStock = Math.max(0, target.stock + delta);
    target.stock = newStock;
    this.saveProduct(target);
    return newStock;
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  getCategories(): Category[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return memoryCategories;
  },

  async fetchCategories(): Promise<Category[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        memoryCategories = data as Category[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
          window.dispatchEvent(new Event('destinity_categories_updated'));
        }
        return data as Category[];
      }
    } catch (err) {
      console.warn('Supabase fetch categories error:', err);
    }
    return this.getCategories();
  },

  async saveCategory(catData: Partial<Category> & { name: string }): Promise<Category> {
    const categories = this.getCategories();
    const id = catData.id || `c1${Date.now().toString().slice(-6)}-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;
    const slug = catData.slug || catData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category: Category = {
      id,
      name: catData.name,
      slug,
      description: catData.description || null,
      image_url: catData.image_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      display_order: catData.display_order || categories.length + 1,
      created_at: catData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const exists = categories.some((c) => c.id === category.id);
    const updated = exists ? categories.map((c) => (c.id === category.id ? category : c)) : [...categories, category];

    memoryCategories = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
      window.dispatchEvent(new Event('destinity_categories_updated'));
    }

    try {
      const supabase = createClient();
      await (supabase.from('categories') as any).upsert(category);
    } catch (err) {
      console.warn('Supabase save category error:', err);
    }

    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const categories = this.getCategories().filter((c) => c.id !== id);
    memoryCategories = categories;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      window.dispatchEvent(new Event('destinity_categories_updated'));
    }

    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete category error:', err);
    }
    return true;
  },

  // ==========================================
  // ORDERS & INVOICES
  // ==========================================
  getOrders(): Order[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return memoryOrders;
  },

  async fetchOrders(): Promise<Order[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), invoices(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        memoryOrders = data as Order[];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          window.dispatchEvent(new Event('destinity_orders_updated'));
        }
        return data as Order[];
      }
    } catch (err) {
      console.warn('Supabase fetch orders error:', err);
    }
    return this.getOrders();
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.order_number === id);
  },

  async createOrder(orderData: Partial<Order> & { total: number; customer_email: string; customer_name: string }): Promise<Order> {
    const orders = this.getOrders();
    const dateNum = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DES-${dateNum}-${randomSeq}`;
    const invoiceNumber = `INV-${dateNum}-${randomSeq}`;
    const orderId = `d1${Date.now().toString().slice(-6)}-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;
    const invoiceId = `f1${Date.now().toString().slice(-6)}-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: orderData.customer_id || null,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone || null,
      shipping_address: orderData.shipping_address as any,
      billing_address: orderData.billing_address as any,
      payment_method: orderData.payment_method || 'stripe',
      payment_status: orderData.payment_status || 'paid',
      order_status: orderData.order_status || 'processing',
      subtotal: orderData.subtotal || orderData.total / 1.21,
      tax_rate: 21.0,
      tax_amount: orderData.tax_amount || orderData.total - orderData.total / 1.21,
      shipping_amount: orderData.shipping_amount || 0,
      total: orderData.total,
      customer_notes: orderData.customer_notes || null,
      admin_notes: orderData.admin_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: orderData.order_items || [],
      invoices: [
        {
          id: invoiceId,
          invoice_number: invoiceNumber,
          order_id: orderId,
          pdf_url: `/api/invoices/${orderNumber}`,
          file_path: `invoices/${invoiceNumber}.pdf`,
          subtotal: orderData.subtotal || orderData.total / 1.21,
          tax_rate: 21.0,
          tax_amount: orderData.tax_amount || orderData.total - orderData.total / 1.21,
          total: orderData.total,
          issued_at: new Date().toISOString(),
          status: 'issued',
          created_at: new Date().toISOString(),
        },
      ],
    };

    // 1. Optimistic update
    const updated = [newOrder, ...orders];
    memoryOrders = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      window.dispatchEvent(new Event('destinity_orders_updated'));
    }

    // 2. Persist to live Supabase
    try {
      const supabase = createClient();
      const { error: orderError } = await (supabase.from('orders') as any).insert({
        id: newOrder.id,
        order_number: newOrder.order_number,
        customer_id: newOrder.customer_id,
        customer_email: newOrder.customer_email,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        shipping_address: newOrder.shipping_address,
        billing_address: newOrder.billing_address,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        order_status: newOrder.order_status,
        subtotal: newOrder.subtotal,
        tax_rate: newOrder.tax_rate,
        tax_amount: newOrder.tax_amount,
        shipping_amount: newOrder.shipping_amount,
        total: newOrder.total,
        customer_notes: newOrder.customer_notes,
      });

      if (!orderError && newOrder.order_items && newOrder.order_items.length > 0) {
        const itemsToInsert = newOrder.order_items.map((item) => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_image: item.product_image,
          variant_selected: item.variant_selected,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        }));
        await (supabase.from('order_items') as any).insert(itemsToInsert);
      }

      // Insert invoice
      await (supabase.from('invoices') as any).insert({
        id: invoiceId,
        invoice_number: invoiceNumber,
        order_id: newOrder.id,
        subtotal: newOrder.subtotal,
        tax_rate: newOrder.tax_rate,
        tax_amount: newOrder.tax_amount,
        total: newOrder.total,
        file_path: `invoices/${invoiceNumber}.pdf`,
        pdf_url: `/api/invoices/${orderNumber}`,
      });
    } catch (err) {
      console.warn('Supabase order creation warning:', err);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: Order['order_status']): Promise<Order | undefined> {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return undefined;

    target.order_status = status;
    target.updated_at = new Date().toISOString();

    const updated = orders.map((o) => (o.id === orderId ? target : o));
    memoryOrders = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      window.dispatchEvent(new Event('destinity_orders_updated'));
    }

    try {
      const supabase = createClient();
      await (supabase.from('orders') as any).update({ order_status: status, updated_at: target.updated_at }).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update order status error:', err);
    }

    return target;
  },

  // ==========================================
  // STORE SETTINGS
  // ==========================================
  getSettings(): StoreSettings {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return memorySettings;
  },

  async fetchSettings(): Promise<StoreSettings> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('store_settings').select('*').single();
      if (!error && data) {
        memorySettings = data as StoreSettings;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
          window.dispatchEvent(new Event('destinity_settings_updated'));
        }
        return data as StoreSettings;
      }
    } catch (err) {
      console.warn('Supabase fetch settings error:', err);
    }
    return this.getSettings();
  },

  async saveSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings, updated_at: new Date().toISOString() };
    memorySettings = merged;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      window.dispatchEvent(new Event('destinity_settings_updated'));
    }

    try {
      const supabase = createClient();
      await (supabase.from('store_settings') as any).upsert({ ...merged, id: 1 });
    } catch (err) {
      console.warn('Supabase save settings error:', err);
    }

    return merged;
  },

  // ==========================================
  // STORAGE: REAL FILE UPLOAD TO SUPABASE BUCKET
  // ==========================================
  async uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error, using local object URL fallback:', err);
    }

    // Fallback: create object URL or base64
    return URL.createObjectURL(file);
  },

  // ==========================================
  // USER PROFILE & ROLE
  // ==========================================
  getCurrentUser(): Profile {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return DEMO_ADMIN_USER;
  },

  setCurrentUser(profile: Profile) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
      document.cookie = `destinity_demo_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `destinity_user_email=${encodeURIComponent(profile.email)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `destinity_user_id=${profile.id}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event('destinity_user_changed'));
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      document.cookie = 'destinity_demo_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'destinity_user_email=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'destinity_user_id=; path=/; max-age=0; SameSite=Lax';
      window.dispatchEvent(new Event('destinity_user_changed'));
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out warning:', err);
    }
  },
};
