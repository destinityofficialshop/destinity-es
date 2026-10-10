export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'shipped' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'stripe' | 'bizum' | 'paypal' | 'apple_pay';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          shipping_addresses: Address[];
          billing_addresses: Address[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          shipping_addresses?: Address[];
          billing_addresses?: Address[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          sku: string | null;
          stock: number;
          is_published: boolean;
          category_id: string | null;
          featured_image: string;
          gallery_images: string[];
          tags: string[];
          variants: ProductVariantGroup[];
          attributes: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          sku?: string | null;
          stock?: number;
          is_published?: boolean;
          category_id?: string | null;
          featured_image: string;
          gallery_images?: string[];
          tags?: string[];
          variants?: ProductVariantGroup[];
          attributes?: Record<string, string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          shipping_address: Address;
          billing_address: Address;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          order_status: OrderStatus;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          shipping_amount: number;
          total: number;
          customer_notes: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          shipping_address: Address;
          billing_address: Address;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          subtotal: number;
          tax_rate?: number;
          tax_amount: number;
          shipping_amount?: number;
          total: number;
          customer_notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_title: string;
          product_image: string | null;
          variant_selected: Record<string, string>;
          price: number;
          quantity: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_title: string;
          product_image?: string | null;
          variant_selected?: Record<string, string>;
          price: number;
          quantity: number;
          total: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          order_id: string;
          pdf_url: string | null;
          file_path: string | null;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          issued_at: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          order_id: string;
          pdf_url?: string | null;
          file_path?: string | null;
          subtotal: number;
          tax_rate?: number;
          tax_amount: number;
          total: number;
          issued_at?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          legal_name: string;
          cif_nif: string;
          fiscal_address: string;
          city: string;
          postal_code: string;
          province: string;
          country: string;
          phone: string;
          email: string;
          tax_rate: number;
          free_shipping_threshold: number;
          standard_shipping_cost: number;
          invoice_prefix: string;
          invoice_footer_note: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          legal_name?: string;
          cif_nif?: string;
          fiscal_address?: string;
          city?: string;
          postal_code?: string;
          province?: string;
          country?: string;
          phone?: string;
          email?: string;
          tax_rate?: number;
          free_shipping_threshold?: number;
          standard_shipping_cost?: number;
          invoice_prefix?: string;
          invoice_footer_note?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['store_settings']['Insert']>;
      };
    };
  };
}

export interface ProductVariantGroup {
  name: string; // e.g. "Talla", "Color"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface Address {
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  dniNie?: string;
}

export type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};
export type Category = Database['public']['Tables']['categories']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: OrderItem[];
  invoices?: Invoice[];
};
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
