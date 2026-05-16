// // src/app/dashboard/pos/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
// import { useAuthStore } from "@/store/useAuthStore";
// import { usePOSStore } from "@/store/usePOSStore";

// export default function POSPage() {
//   const { token } = useAuthStore();
//   const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = usePOSStore();
  
//   const [products, setProducts] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [checkoutMessage, setCheckoutMessage] = useState<{type: "success" | "error", text: string} | null>(null);

//   // Financial Math
//   const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const taxRate = 0.18; // 18% Tax
//   const tax = subtotal * taxRate;
//   const grandTotal = subtotal + tax;

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//    const res = await fetch("http://localhost:8000/api/products/", { headers: { Authorization: `Bearer ${token}` }});
//       const data = await res.json();
//       setProducts(data);
//   };

//   const handleCheckout = async () => {
//     if (cart.length === 0) return;
//     setIsProcessing(true);
//     setCheckoutMessage(null);

//     const payload = {
//       items: cart.map(item => ({
//         productId: item.id,
//         name: item.name,
//         quantity: item.quantity,
//         priceAtTime: item.price
//       })),
//       totalAmount: subtotal,
//       tax: tax,
//       discount: 0,
//       grandTotal: grandTotal,
//       customerName: "Walk-in Customer",
//     };

//     try {
//       const res = await fetch("http://localhost:8000/api/orders/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Checkout failed");

//       setCheckoutMessage({ type: "success", text: "Order completed successfully!" });
//       clearCart();
//       fetchProducts(); // Refresh stock
      
//       setTimeout(() => setCheckoutMessage(null), 3000);
//     } catch (err: any) {
//       setCheckoutMessage({ type: "error", text: err.message });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

//   return (
//     <div className="h-[calc(100vh-8rem)] flex gap-6">
      
//       {/* Left Panel - Products */}
//       <div className="flex-1 flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg">
//         <div className="p-4 border-b border-white/5">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
//             <input 
//               type="text"
//               placeholder="Search products or scan barcode..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
//             />
//           </div>
//         </div>
        
//         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max">
//           {filteredProducts.map((product) => (
//             <motion.div 
//               key={product.id}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => addToCart(product)}
//               className={`p-4 rounded-xl border cursor-pointer transition-colors ${
//                 product.stockQty > 0 
//                 ? "bg-zinc-800/30 border-white/5 hover:border-indigo-500/50" 
//                 : "bg-red-500/5 border-red-500/20 opacity-50 cursor-not-allowed"
//               }`}
//             >
//               <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-zinc-300">{product.category}</span>
//               <h3 className="font-medium text-white mt-3 truncate">{product.name}</h3>
//               <div className="flex justify-between items-end mt-2">
//                 <span className="text-lg font-bold text-indigo-400">${product.price.toFixed(2)}</span>
//                 <span className={`text-xs ${product.stockQty <= 5 ? 'text-red-400' : 'text-zinc-500'}`}>
//                   {product.stockQty} in stock
//                 </span>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Right Panel - Cart & Checkout */}
//       <div className="w-[400px] flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg">
//         <div className="p-4 border-b border-white/5 bg-zinc-950/30 flex justify-between items-center">
//           <h2 className="text-lg font-semibold text-white flex items-center gap-2">
//             <ShoppingBag className="w-5 h-5 text-indigo-400" /> Current Order
//           </h2>
//           <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {cart.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center text-zinc-500">
//               <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
//               <p>Cart is empty</p>
//             </div>
//           ) : (
//             cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-white/5">
//                 <div className="flex-1">
//                   <h4 className="text-sm font-medium text-white line-clamp-1">{item.name}</h4>
//                   <span className="text-xs text-indigo-400">${item.price.toFixed(2)}</span>
//                 </div>
                
//                 <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-white/10">
//                   <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white/10 rounded text-zinc-400">
//                     <Minus className="w-3 h-3" />
//                   </button>
//                   <span className="text-sm font-medium w-6 text-center text-white">{item.quantity}</span>
//                   <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white/10 rounded text-zinc-400">
//                     <Plus className="w-3 h-3" />
//                   </button>
//                 </div>

//                 <button onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Checkout Panel */}
//         <div className="p-4 bg-zinc-950/80 border-t border-white/5">
//           <div className="space-y-2 mb-4 text-sm text-zinc-400">
//             <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
//             <div className="flex justify-between pt-2 border-t border-white/10 mt-2 text-lg font-bold text-white">
//               <span>Total</span><span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
//             </div>
//           </div>

//           {checkoutMessage && (
//             <div className={`mb-4 p-3 rounded-lg text-sm text-center border ${
//               checkoutMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
//             }`}>
//               {checkoutMessage.text}
//             </div>
//           )}

//           <button 
//             onClick={handleCheckout}
//             disabled={cart.length === 0 || isProcessing}
//             className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)]"
//           >
//             {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
//               <>
//                 <CreditCard className="w-5 h-5" />
//                 Charge ${grandTotal.toFixed(2)}
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { usePOSStore } from "@/store/usePOSStore";
import { useAuthStore } from "@/store/useAuthStore";
import InvoiceDocument from "../orders/components/InvoiceDocument";
import { API_BASE_URL } from "@/lib/api";

export default function POSTerminal() {
  const { token } = useAuthStore();

  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    customerName,
    customerEmail,
    activeInvoice,
    isSubmitting,
    setIsSubmitting,
    setInvoice,
  } = usePOSStore();

  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [checkoutMessage, setCheckoutMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Checkout Logic
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setCheckoutMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerName,
            customerEmail,
            items: cart.map((i) => ({
              productId: i.id,
              name: i.name,
              quantity: i.quantity,
              priceAtTime: i.price,
            })),
            subtotal,
            tax,
            totalAmount: subtotal,
            grandTotal: total,
            discount: 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Checkout failed");
      }

      setInvoice(data);

      setCheckoutMessage({
        type: "success",
        text: "Order completed successfully!",
      });

      fetchProducts();
      clearCart();

      setTimeout(() => {
        setCheckoutMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error(error);

      setCheckoutMessage({
        type: "error",
        text: error.message || "Checkout failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search filter
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invoice View
  if (activeInvoice) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto mb-4 print:hidden">
          <button
            onClick={() => setInvoice(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to POS Terminal
          </button>
        </div>

        <InvoiceDocument order={activeInvoice} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 bg-zinc-950 p-6">

      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

        {/* Search */}
        <div className="p-5 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">

          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                product.stockQty > 0 && addToCart(product)
              }
              className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                product.stockQty > 0
                  ? "bg-zinc-800/40 border-white/5 hover:border-indigo-500/40 hover:bg-zinc-800/60"
                  : "bg-red-500/5 border-red-500/20 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-zinc-300">
                  {product.category}
                </span>

                {product.stockQty <= 5 && (
                  <span className="text-[10px] text-red-400 font-medium">
                    LOW
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-white font-medium line-clamp-2">
                {product.name}
              </h3>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-indigo-400">
                    ₹{product.price}
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    {product.stockQty} in stock
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[420px] bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/40">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            Current Order
          </h2>

          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        </div>

        {/* Cart */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-2xl border border-white/5"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">
                    {item.name}
                  </h4>

                  <span className="text-xs text-indigo-400">
                    ₹{item.price}
                  </span>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-1 border border-white/10">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <Minus className="w-3 h-3 text-zinc-300" />
                  </button>

                  <span className="w-6 text-center text-sm text-white">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <Plus className="w-3 h-3 text-zinc-300" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/70">

          {/* Totals */}
          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
              <span>Total</span>
              <span className="text-emerald-400">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Alert */}
          {checkoutMessage && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm text-center border ${
                checkoutMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {checkoutMessage.text}
            </div>
          )}

          {/* Checkout */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all shadow-[0_0_30px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Order...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Complete Checkout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}