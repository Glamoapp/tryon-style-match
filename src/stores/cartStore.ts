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
  id: string;
  type: 'service';
  serviceName: string;
  serviceId: string;
  providerId: string;
  providerName: string;
  price: number;
  date: string;
  time: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
}

// Vendor product item for the unified cart
export interface VendorCartItem {
  id: string;
  type: 'vendor_product';
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  vendor?: string;
  variantLabel?: string;
}

interface CartStore {
  items: CartItem[];
  serviceItems: ServiceCartItem[];
  vendorItems: VendorCartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  justAdded: CartItem | null;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  addServiceItem: (item: ServiceCartItem) => void;
  removeServiceItem: (id: string) => void;
  addVendorItem: (item: VendorCartItem) => void;
  updateVendorQuantity: (id: string, quantity: number) => void;
  removeVendorItem: (id: string) => void;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  hasProducts: () => boolean;
  hasServices: () => boolean;
  hasVendorProducts: () => boolean;
  clearJustAdded: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      serviceItems: [],
      vendorItems: [],
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

      addVendorItem: (item) => {
        const { vendorItems } = get();
        const existing = vendorItems.find(v => v.id === item.id);
        if (existing) {
          set({ vendorItems: vendorItems.map(v => v.id === item.id ? { ...v, quantity: v.quantity + item.quantity } : v) });
        } else {
          set({ vendorItems: [...vendorItems, item] });
        }
      },

      updateVendorQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ vendorItems: get().vendorItems.filter(v => v.id !== id) });
        } else {
          set({ vendorItems: get().vendorItems.map(v => v.id === id ? { ...v, quantity } : v) });
        }
      },

      removeVendorItem: (id) => {
        set({ vendorItems: get().vendorItems.filter(v => v.id !== id) });
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

      clearCart: () => set({ items: [], serviceItems: [], vendorItems: [], cartId: null, checkoutUrl: null, justAdded: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      hasProducts: () => get().items.length > 0,
      hasServices: () => get().serviceItems.length > 0,
      hasVendorProducts: () => get().vendorItems.length > 0,
      clearJustAdded: () => set({ justAdded: null }),

      syncCart: async () => {
        const { cartId, isSyncing, clearCart, serviceItems, items, justAdded } = get();
        // Skip sync if cart was just modified (Shopify eventual consistency)
        if (!cartId || isSyncing || justAdded) return;
        // Don't sync if we have local items added within the last few seconds
        set({ isSyncing: true });
        try {
          // Add a small delay to let Shopify catch up
          await new Promise(r => setTimeout(r, 1500));
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) { set({ isSyncing: false }); return; }
          const cart = data?.data?.cart;
          if (!cart) {
            // Cart truly doesn't exist on Shopify anymore
            if (serviceItems.length === 0) {
              clearCart();
            } else {
              set({ items: [], cartId: null, checkoutUrl: null });
            }
          }
          // If cart exists, trust local state — don't clear based on totalQuantity
          // since Shopify may still be processing
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
        vendorItems: state.vendorItems,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    }
  )
);
