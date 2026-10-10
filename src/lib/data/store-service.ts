import { Product, Category, Order, StoreSettings, Profile } from '@/types/database.types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  DEMO_ADMIN_USER,
  DEMO_CUSTOMER_USER,
} from './mock-data';

const STORAGE_KEYS = {
  PRODUCTS: 'destinity_products_v1',
  CATEGORIES: 'destinity_categories_v1',
  ORDERS: 'destinity_orders_v1',
  SETTINGS: 'destinity_settings_v1',
  CURRENT_USER: 'destinity_current_user_v1',
};

// In-memory runtime cache for server-side & client-side rendering
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

export const StoreService = {
  // --- PRODUCTS ---
  getProducts(): Product[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore error
        }
      }
    }
    return memoryProducts;
  },

  getProductBySlug(slug: string): Product | undefined {
    const products = this.getProducts();
    return products.find((p) => p.slug === slug);
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find((p) => p.id === id);
  },

  saveProduct(productData: Partial<Product> & { title: string; price: number; featured_image: string }): Product {
    const products = this.getProducts();
    const isNew = !productData.id;

    const baseSlug = productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product: Product = {
      id: productData.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: productData.title,
      slug: baseSlug,
      description: productData.description || '',
      price: Number(productData.price),
      sale_price: productData.sale_price ? Number(productData.sale_price) : null,
      sku: productData.sku || `DES-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
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
    return product;
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== id);
    memoryProducts = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      window.dispatchEvent(new Event('destinity_products_updated'));
    }
    return true;
  },

  // --- CATEGORIES ---
  getCategories(): Category[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return memoryCategories;
  },

  saveCategory(catData: Partial<Category> & { name: string }): Category {
    const categories = this.getCategories();
    const category: Category = {
      id: catData.id || `cat_${Date.now()}`,
      name: catData.name,
      slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description || null,
      image_url: catData.image_url || null,
      display_order: catData.display_order || categories.length + 1,
      created_at: catData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const exists = categories.some((c) => c.id === category.id);
    const updated = exists ? categories.map((c) => (c.id === category.id ? category : c)) : [...categories, category];

    memoryCategories = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    }
    return category;
  },

  // --- ORDERS ---
  getOrders(): Order[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return memoryOrders;
  },

  getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id);
  },

  createOrder(orderData: Partial<Order> & { total: number; customer_email: string; customer_name: string }): Order {
    const orders = this.getOrders();
    const dateNum = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DES-${dateNum}-${randomSeq}`;
    const invoiceNumber = `INV-${dateNum}-${randomSeq}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
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
          id: `inv_${Date.now()}`,
          invoice_number: invoiceNumber,
          order_id: `ord_${Date.now()}`,
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

    const updated = [newOrder, ...orders];
    memoryOrders = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    }
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['order_status']): Order | undefined {
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
    return target;
  },

  // --- STORE SETTINGS ---
  getSettings(): StoreSettings {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return memorySettings;
  },

  saveSettings(newSettings: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings, updated_at: new Date().toISOString() };
    memorySettings = merged;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      window.dispatchEvent(new Event('destinity_settings_updated'));
    }
    return merged;
  },

  // --- USER PROFILE & AUTH SIMULATION ---
  getCurrentUser(): Profile {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return DEMO_ADMIN_USER; // Default to admin for convenient CMS demonstration
  },

  setCurrentUser(profile: Profile) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
      document.cookie = `destinity_demo_role=${profile.role}; path=/; max-age=86400`;
      window.dispatchEvent(new Event('destinity_user_changed'));
    }
  },
};
