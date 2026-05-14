"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingCart, Search, X, ChevronDown, MessageCircle, Package, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Product } from "@/types";
import { getProducts, getCategories, addOrder } from "../admin/actions";

// ─── Product Detail Modal ───────────────────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart }: { product: any; onClose: () => void; onAddToCart: (p: any) => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 max-h-[90svh] overflow-y-auto"
        >
          {/* Handle bar — mobile only */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-infositel uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-infositel" />
              {product.category}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Image */}
          <div className="relative h-56 w-full mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full bg-blue-infositel/10 blur-[50px]" />
            </div>
            <Image src={product.image} alt={product.name} fill className="object-contain p-6 drop-shadow-[0_10px_30px_rgba(20,51,201,0.2)]" />
            {product.isFeatured && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-infositel text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                <Star size={9} fill="white" /> RECOMENDADO
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h2>

          {/* Description */}
          {product.description && (
            <div className="mb-5">
              {product.description.includes("*") || product.description.includes("\n") ? (
                <ul className="space-y-2">
                  {product.description.split(/[\*\n]/).filter((t: string) => t.trim().length > 1).map((text: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-infositel shrink-0" />
                      {text.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div>
              {product.isFeatured && (
                <span className="block text-xs text-gray-300 line-through font-bold">S/. {Math.round(product.price * 1.3)}.00</span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-blue-infositel/50 font-bold text-sm">S/.</span>
                <span className="text-4xl font-black text-gray-900 tracking-tighter">{product.price.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              className="flex items-center gap-2 bg-blue-infositel text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 hover:scale-[1.03] active:scale-95 transition-all"
            >
              <ShoppingCart size={18} />
              Añadir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ product, onSelect, onAddToCart }: { product: any; onSelect: () => void; onAddToCart: (p: any) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className="group relative bg-white rounded-[1.6rem] border border-blue-infositel/10 hover:border-blue-infositel/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Featured glow */}
      {product.isFeatured && (
        <div className="absolute inset-0 rounded-[1.6rem] ring-2 ring-blue-infositel/20 pointer-events-none" />
      )}

      {/* Image zone */}
      <div className="relative bg-gradient-to-br from-blue-50/60 to-white overflow-hidden" style={{ paddingBottom: "80%" }}>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-infositel/0 group-hover:bg-blue-infositel/4 transition-colors duration-500 z-10" />

        {/* Core glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-blue-infositel/10 blur-[40px]" />
        </div>

        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="absolute inset-0 p-4"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4"
            style={{ filter: "drop-shadow(0 8px 24px rgba(20,51,201,0.15))" }}
          />
        </motion.div>

        {/* Badges */}
        {product.isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-blue-infositel text-white text-[8px] font-black px-2 py-0.5 rounded-full">
            <Star size={7} fill="white" /> TOP
          </div>
        )}

        {/* Quick-add button on hover */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 w-9 h-9 rounded-full bg-blue-infositel text-white flex items-center justify-center shadow-lg shadow-blue-500/40"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        >
          <ShoppingCart size={14} />
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <span className="text-[9px] font-black text-blue-infositel/60 uppercase tracking-[0.2em] leading-none truncate">{product.category}</span>
        <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-infositel transition-colors leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-blue-infositel/50 font-bold">S/.</span>
            <span className="text-base font-black text-gray-900 tracking-tight">{product.price.toFixed(2)}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-infositel text-white shadow-md shadow-blue-500/30 hover:scale-110 active:scale-90 transition-all"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Store Page ────────────────────────────────────────────────────────
export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [checkoutData, setCheckoutData] = useState({ name: "", phone: "" });
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const p = await getProducts();
      setProducts(p);
      const c = await getCategories();
      setCategories(["Todos", ...c.map((cat: any) => cat.name)]);
    }
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        setIsSticky(window.scrollY > filterRef.current.offsetTop - 64);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id));
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    if (!checkoutData.name || !checkoutData.phone) { alert("Por favor completa tu nombre y número."); return; }
    const msg = `Hola INFOSISTEL! Quisiera realizar un pedido:\n\n*Cliente:* ${checkoutData.name}\n*Celular:* ${checkoutData.phone}\n\n*Productos:*\n${cart.map((i) => `- ${i.product.name} (x${i.quantity}) - S/. ${i.product.price * i.quantity}`).join("\n")}\n\n*Total:* S/. ${total}\n\n¿Tienen disponibilidad?`;
    addOrder({ customerName: checkoutData.name, customerPhone: checkoutData.phone, total, items: cart.map((i) => ({ name: i.product.name, category: i.product.category, quantity: i.quantity })) });
    window.open(`https://wa.me/51964648202?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen relative">

      {/* ── PAGE HEADER ── */}
      <div className="relative overflow-hidden bg-blue-infositel pt-24 pb-10 px-4 sm:px-8">
        {/* BG grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent"
            animate={{ x: ["-10vw", "110vw"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 6 }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-white/60" />
            <span className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">Catálogo Digital</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-2">
            CATÁLOGO <span className="text-white/50">PRO</span>
          </h1>
          <p className="text-white/60 text-sm font-medium">Repuestos y accesorios premium · Garantía INFOSISTEL</p>
        </div>
      </div>

      {/* ── STICKY FILTERS ── */}
      <div ref={filterRef} className={`sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 transition-shadow duration-300 ${isSticky ? "shadow-lg shadow-blue-500/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col gap-3">

          {/* Search + count row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-infositel/30 focus:bg-white transition-all placeholder:text-gray-300 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-gray-300 hover:text-gray-500" />
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-blue-infositel text-xs font-black bg-blue-infositel/8 px-3 py-2.5 rounded-xl whitespace-nowrap border border-blue-infositel/15">
              {filteredProducts.length} items
            </div>
            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-blue-infositel text-white px-4 py-2.5 rounded-xl font-black text-sm shadow-md shadow-blue-500/25 hover:scale-[1.03] active:scale-95 transition-all"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeCategory === cat
                  ? "bg-blue-infositel text-white shadow-md shadow-blue-500/25"
                  : "bg-gray-50 text-gray-500 border border-gray-100 hover:border-blue-infositel/20 hover:text-blue-infositel"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border-2 border-dashed border-gray-100">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-300 font-black text-lg">Sin resultados</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={() => setSelectedProduct(p)}
                  onAddToCart={addToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── FLOATING CART FAB — mobile only ── */}
      {cartCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-5 z-50 flex items-center gap-2.5 bg-blue-infositel text-white px-5 py-3.5 rounded-2xl font-black text-sm shadow-2xl shadow-blue-500/40 sm:hidden"
        >
          <ShoppingCart size={18} />
          <span>S/. {total.toFixed(0)}</span>
          <span className="w-5 h-5 bg-white text-blue-infositel text-[10px] font-black rounded-full flex items-center justify-center">{cartCount}</span>
        </motion.button>
      )}

      {/* ── PRODUCT DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-infositel/10 flex items-center justify-center">
                    <ShoppingCart size={16} className="text-blue-infositel" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg leading-none">Tu Carrito</h2>
                    <p className="text-xs text-gray-400 font-medium">{cartCount} producto{cartCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <ShoppingCart size={28} className="text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-bold text-sm">Tu carrito está vacío</p>
                    <button onClick={() => setIsCartOpen(false)} className="text-blue-infositel font-black text-sm hover:underline">
                      Ver productos →
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="relative w-16 h-16 bg-white rounded-xl shrink-0">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-snug line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Cant: {item.quantity}</p>
                        <p className="font-black text-blue-infositel text-sm">S/. {(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                        <X size={14} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base">Total</span>
                    <span className="font-black text-2xl text-blue-infositel tracking-tighter">S/. {total.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2.5">
                    <input
                      type="text" placeholder="Tu Nombre Completo"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-infositel/30 focus:bg-white transition-all"
                      value={checkoutData.name} onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    />
                    <input
                      type="tel" placeholder="Número de Celular"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-infositel/30 focus:bg-white transition-all"
                      value={checkoutData.phone} onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2.5 hover:bg-[#20b856] transition-all shadow-xl shadow-green-500/20 active:scale-95"
                  >
                    <MessageCircle size={20} />
                    Pedir por WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
