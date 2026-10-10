import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/store.types';
import { Product } from '@/types/database.types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  freeShippingThreshold: number;
  standardShippingCost: number;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getTaxAmount: () => number; // 21% IVA incluido
  getShippingAmount: () => number;
  getTotal: () => number;
  getFreeShippingProgress: () => { current: number; threshold: number; remaining: number; percentage: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      freeShippingThreshold: 120, // 120€ para España Península
      standardShippingCost: 4.95,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product: Product, quantity = 1, selectedVariants = {}) => {
        set((state) => {
          // Generate unique ID based on product and variant choices
          const variantKey = Object.entries(selectedVariants)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join('|');
          const itemId = `${product.id}_${variantKey}`;

          const existingIndex = state.items.findIndex((item) => item.id === itemId);
          const activePrice = product.sale_price !== null && product.sale_price !== undefined
            ? product.sale_price
            : product.price;

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
            return { items: updatedItems, isCartOpen: true };
          } else {
            const newItem: CartItem = {
              id: itemId,
              productId: product.id,
              title: product.title,
              slug: product.slug,
              price: activePrice,
              featured_image: product.featured_image,
              quantity,
              selectedVariants,
              sku: product.sku,
            };
            return { items: [...state.items, newItem], isCartOpen: true };
          }
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        // IVA 21% desglosado (subtotal incluye IVA)
        const baseImponible = subtotal / 1.21;
        return Number((subtotal - baseImponible).toFixed(2));
      },

      getShippingAmount: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= get().freeShippingThreshold ? 0 : get().standardShippingCost;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return Number((subtotal + get().getShippingAmount()).toFixed(2));
      },

      getFreeShippingProgress: () => {
        const current = get().getSubtotal();
        const threshold = get().freeShippingThreshold;
        const remaining = Math.max(0, threshold - current);
        const percentage = Math.min(100, Math.round((current / threshold) * 100));
        return { current, threshold, remaining, percentage };
      },
    }),
    {
      name: 'destinity-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
