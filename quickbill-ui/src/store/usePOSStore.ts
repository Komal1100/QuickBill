// // src/store/usePOSStore.ts
// import { create } from 'zustand';

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   maxStock: number;
// }

// interface POSState {
//   cart: CartItem[];
//   discount: number;
//   setDiscount: (discount: number) => void;
//   addToCart: (product: any) => void;
//   updateQuantity: (id: string, qty: number) => void;
//   removeFromCart: (id: string) => void;
//   clearCart: () => void;
// }

// export const usePOSStore = create<POSState>((set) => ({
//   cart: [],
//   discount: 0,
//   setDiscount: (discount) => set({ discount }),
  
//   addToCart: (product) => set((state) => {
//     const existing = state.cart.find(item => item.id === product.id);
//     if (existing) {
//       // Block adding more than available stock
//       if (existing.quantity >= product.stockQty) return state; 
//       return {
//         cart: state.cart.map(item =>
//           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         )
//       };
//     }
//     return {
//       cart: [...state.cart, { id: product.id, name: product.name, price: product.price, quantity: 1, maxStock: product.stockQty }]
//     };
//   }),

//   updateQuantity: (id, qty) => set((state) => ({
//     cart: state.cart.map(item => {
//       if (item.id === id) {
//         // Ensure quantity never drops below 1 or exceeds max stock
//         const safeQty = Math.max(1, Math.min(qty, item.maxStock));
//         return { ...item, quantity: safeQty };
//       }
//       return item;
//     })
//   })),

//   removeFromCart: (id) => set((state) => ({
//     cart: state.cart.filter(item => item.id !== id)
//   })),

//   clearCart: () => set({ cart: [], discount: 0 }),
// }));

import { create } from "zustand";
import { Order } from "@/app/dashboard/orders/components/InvoiceDocument";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
}

interface POSState {
  cart: CartItem[];

  customerName: string;
  customerEmail: string;

  discount: number;

  isSubmitting: boolean;

  activeInvoice: Order | null;

  // Actions
  addToCart: (product: any) => void;

  updateQuantity: (
    id: string,
    quantity: number
  ) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  setDiscount: (discount: number) => void;

  setCustomerInfo: (
    name: string,
    email: string
  ) => void;

  setInvoice: (
    order: Order | null
  ) => void;

  setIsSubmitting: (
    status: boolean
  ) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],

  customerName: "",

  customerEmail: "",

  discount: 0,

  isSubmitting: false,

  activeInvoice: null,

  // Add Product
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find(
        (item) => item.id === product._id || item.id === product.id
      );

      // Existing Item
      if (existing) {

        // Block stock overflow
        if (existing.quantity >= product.stockQty) {
          return state;
        }

        return {
          cart: state.cart.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      }

      // New Item
      return {
        cart: [
          ...state.cart,
          {
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: product.stockQty,
          },
        ],
      };
    }),

  // Update Quantity
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart
        .map((item) => {

          if (item.id !== id) {
            return item;
          }

          // Remove if qty <= 0
          if (quantity <= 0) {
            return null;
          }

          // Protect stock limit
          const safeQty = Math.min(
            quantity,
            item.maxStock
          );

          return {
            ...item,
            quantity: safeQty,
          };
        })
        .filter(Boolean) as CartItem[],
    })),

  // Remove Product
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) => item.id !== id
      ),
    })),

  // Clear Entire Cart
  clearCart: () =>
    set({
      cart: [],
      customerName: "",
      customerEmail: "",
      discount: 0,
    }),

  // Discount
  setDiscount: (discount) =>
    set({
      discount,
    }),

  // Customer Info
  setCustomerInfo: (
    name,
    email
  ) =>
    set({
      customerName: name,
      customerEmail: email,
    }),

  // Invoice
  setInvoice: (order) =>
    set({
      activeInvoice: order,
    }),

  // Loading
  setIsSubmitting: (status) =>
    set({
      isSubmitting: status,
    }),
}));