import { Product } from './database.types';

export interface CartItem {
  id: string; // unique item id = productId + serialized variant
  productId: string;
  title: string;
  slug: string;
  price: number;
  featured_image: string;
  quantity: number;
  selectedVariants: Record<string, string>; // e.g. { "Talla": "48 (M)", "Color": "Negro Carbón" }
  sku?: string | null;
}

export interface CheckoutFormState {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  dniNie: string;
  shippingAddress: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingSameAsShipping: boolean;
  billingAddress: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
    dniNie?: string;
  };
  paymentMethod: 'stripe' | 'bizum' | 'paypal' | 'apple_pay';
  bizumPhone: string;
  customerNotes?: string;
  acceptTerms: boolean;
}
