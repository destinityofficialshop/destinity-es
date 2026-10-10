import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/database.types';

interface WishlistState {
  items: Product[];
  isWishlistOpen: boolean;
  toggleWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isItemInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isWishlistOpen: false,

      toggleWishlist: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),
      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),

      addItem: (product) => {
        set((state) => {
          if (state.items.some((i) => i.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },

      isItemInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },

      toggleItem: (product) => {
        if (get().isItemInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
    }),
    {
      name: 'destinity_wishlist_storage',
    }
  )
);
