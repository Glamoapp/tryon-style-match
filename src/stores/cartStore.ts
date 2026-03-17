import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type CartItem,
  type ShopifyProduct,
  storefrontApiRequest,
  CART_QUERY,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
} from '@/lib/shopify';

export type { CartItem, ShopifyProduct };

// Service item that can be added to the unified cart
export interface ServiceCartItem {
  id: string; // unique key for the cart
  type: 'service';
  serviceName: string;
  serviceId: string;
  providerId: string;
  providerName: string;
  price: number; // in dollars
  date: string; // formatted date string
  time: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
}

interface CartStore {
  items: CartItem[];
  serviceItems: ServiceCartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  justAdded: CartItem | null;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  addServiceItem: (item: ServiceCartItem) => void;
  removeServiceItem: (id: string) => void;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  hasProducts: () => boolean;
  hasServices: () => boolean;
  clearJustAdded: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      serviceItems: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      justAdded: null,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              const addedItem = { ...item, lineId: result.lineId };
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [addedItem],
                justAdded: addedItem,
              });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) return;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const updated = { ...existingItem, quantity: newQuantity };
              set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i), justAdded: updated });
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              const addedItem = { ...item, lineId: result.lineId ?? null };
              set({ items: [...get().items, addedItem], justAdded: addedItem });
            } else if (result.cartNotFound) clearCart();
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addServiceItem: (item) => {
        const { serviceItems } = get();
        // Prevent duplicate service bookings
        const exists = serviceItems.find(s => s.id === item.id);
        if (!exists) {
          set({ serviceItems: [...serviceItems, item] });
        }
      },

      removeServiceItem: (id) => {
        set({ serviceItems: get().serviceItems.filter(s => s.id !== id) });
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) { await get().removeItem(variantId); return; }
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter(i => i.variantId !== variantId);
            if (newItems.length === 0 && get().serviceItems.length === 0) {
              clearCart();
            } else {
              set({ items: newItems, ...(newItems.length === 0 ? { cartId: null, checkoutUrl: null } : {}) });
            }
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], serviceItems: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      hasProducts: () => get().items.length > 0,
      hasServices: () => get().serviceItems.length > 0,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart, serviceItems } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) {
            if (serviceItems.length === 0) {
              clearCart();
            } else {
              set({ items: [], cartId: null, checkoutUrl: null });
            }
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        serviceItems: state.serviceItems,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    }
  )
);
