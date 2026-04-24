"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Search, Filter, MessageCircle, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageBg from "@/components/PageBg";
import ImageFrame from "@/components/ImageFrame";

import { Product } from "@/types";


const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mouse Gamer AETHEREAL G7",
    category: "Mouse",
    description: "Tecnología de neón RGB, sensor óptico de alta precisión y diseño ergonómico para largas sesiones.",
    price: 490,
    stock: 10,
    image: "/img/producto3mouse.webp",
    isFeatured: true,
    onSale: false,
    salePrice: null
  },
  {
    id: "2",
    name: "Teclado Mecánico G7 RGB",
    category: "Teclado",
    description: "Iluminación RGB Pro Series, switches mecánicos de respuesta instantánea y cable reforzado.",
    price: 380,
    stock: 8,
    image: "/img/producto5teclado.webp",
    isFeatured: true,
    onSale: false,
    salePrice: null
  },
  {
    id: "3",
    name: "Laptop ASUS ROG Strix G16",
    category: "Laptops",
    description: "Potencia sin límites: RTX 4080, i9-13980HX, 32GB RAM. La cima del rendimiento móvil.",
    price: 8900,
    stock: 3,
    image: "/img/fondo4laptop.webp",
    isFeatured: true,
    onSale: false,
    salePrice: null
  },
];


const DEFAULT_CATEGORIES = ["Todos", "Mouse", "Teclado", "Monitores", "Laptops", "SSD", "Cables"];

import { getProducts, getCategories, addOrder } from "../admin/actions";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: "", phone: "" });
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const p = await getProducts();
      setProducts(p);
      const c = await getCategories();
      setCategories(["Todos", ...c.map((cat: any) => cat.name)]);
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!checkoutData.name || !checkoutData.phone) {
      alert("Por favor completa tu nombre y número.");
      return;
    }

    const message = `Hola INFOSISTEL! Quisiera realizar un pedido:\n\n*Cliente:* ${checkoutData.name}\n*Celular:* ${checkoutData.phone}\n\n*Productos:*\n${cart
      .map((item) => `- ${item.product.name} (x${item.quantity}) - S/. ${item.product.price * item.quantity}`)
      .join("\n")}\n\n*Total:* S/. ${total}\n\n¿Tienen disponibilidad?`;

    // Save order via Server Action
    addOrder({
      customerName: checkoutData.name,
      customerPhone: checkoutData.phone,
      total: total,
      items: cart.map(item => ({
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity
      }))
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/51964648202?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      <PageBg intensity={0.6} />
      {/* Header Store */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 py-10">
        <div className="w-full px-4 md:px-12">
          <h1 className="text-3xl md:text-5xl font-black mb-3">Catálogo Pro</h1>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base font-medium">
            Repuestos y accesorios premium con garantía total de INFOSISTEL.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full px-4 md:px-12 py-8 flex flex-col gap-10">
        {/* Horizontal Filters & Search */}
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 border rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-infositel focus:outline-none transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                 <Filter size={14} /> {filteredProducts.length} Productos
              </div>
           </div>

           {/* Horizontal Pill Categories */}
           <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 no-scrollbar mask-fade-right">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    activeCategory === cat
                      ? "bg-blue-infositel text-white shadow-xl shadow-blue-500/30 scale-105"
                      : "bg-white text-gray-500 border border-gray-100 hover:border-blue-infositel/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Product Grid - Full Screen Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  key={p.id}
                  className={`group bg-white rounded-[2.5rem] p-6 flex flex-col transition-all duration-700 ${p.isFeatured ? 'shadow-[0_40px_100px_rgba(20,51,201,0.15)] ring-2 ring-blue-infositel/10' : 'hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-transparent hover:border-gray-100'}`}
                >
                    {/* Image zone — with magnetic energy */}
                   <div className="relative h-64 w-full rounded-[2rem] mb-6 overflow-hidden">
                     {/* Dynamic backdrop */}
                     <div className={`absolute inset-0 transition-colors duration-700 ${p.isFeatured ? 'bg-gradient-to-br from-blue-100/30 via-white to-blue-50/20' : 'bg-gray-50'}`} />
                     
                     {/* Floating energy core */}
                     <motion.div 
                       className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                       animate={{ 
                         scale: [1, 1.2, 1],
                         opacity: [0.4, 0.8, 0.4],
                         rotate: [0, 90, 0]
                       }}
                       transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                     >
                       <div className={`w-40 h-40 rounded-full blur-[60px] ${p.isFeatured ? 'bg-blue-infositel/20' : 'bg-blue-infositel/10'}`} />
                     </motion.div>
                     
                     <motion.div 
                        whileHover={{ scale: 1.15, rotate: -2, y: -5 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative z-10 w-full h-full p-4"
                     >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          priority={p.isFeatured}
                          className="object-contain drop-shadow-[0_20px_40px_rgba(20,51,201,0.2)]"
                        />
                     </motion.div>

                     {/* Premium Ribbon */}
                     {p.isFeatured && (
                       <div className="absolute top-4 left-4 z-20 bg-blue-infositel text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 tracking-tighter">
                          RECOMENDADO ⭐
                       </div>
                     )}

                     {/* Glass Overlay on Hover */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 via-transparent to-blue-infositel/5 pointer-events-none" />
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-infositel" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${p.isFeatured ? 'text-blue-infositel' : 'text-gray-400'}`}>
                          {p.category}
                        </span>
                     </div>
                     <h3 className={`text-2xl font-black leading-tight transition-colors ${p.isFeatured ? 'text-gray-900 group-hover:text-blue-infositel' : 'text-gray-800'}`}>
                       {p.name}
                     </h3>
                   </div>
                  {/* 💎 Refined Interactive Description Section */}
                  <div className="my-5 min-h-[110px] flex flex-col justify-start relative group/desc transition-all duration-700 ease-in-out">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={expandedProducts.includes(p.id) ? 'expanded' : 'collapsed'}
                        initial={{ opacity: 0, height: 80 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {p.description.includes("*") || p.description.includes("\n") ? (
                          <ul className="space-y-2">
                             {(expandedProducts.includes(p.id) 
                               ? p.description.split(/[\*\n]/).filter((t: string) => t.trim().length > 1)
                               : p.description.split(/[\*\n]/).filter((t: string) => t.trim().length > 1).slice(0, 3)
                             ).map((text: string, i: number) => (
                               <motion.li 
                                 key={i}
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                 className="flex items-start gap-2.5 text-[11px] leading-relaxed font-bold text-slate-500"
                               >
                                 <span className="mt-2 w-1 h-1 rounded-full bg-blue-infositel shrink-0 shadow-[0_0_5px_rgba(20,51,201,0.3)]" />
                                 <span className="flex-1">{text.trim()}</span>
                               </motion.li>
                             ))}
                          </ul>
                        ) : (
                          <p className={`text-slate-500 text-[12px] leading-relaxed font-semibold ${expandedProducts.includes(p.id) ? '' : 'line-clamp-3'}`}>
                             {p.description}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {(p.description.split(/[\*\n]/).length > 3 || p.description.length > 90) && (
                       <button 
                         onClick={() => setExpandedProducts(prev => 
                           prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                         )}
                         className="mt-3 flex items-center gap-2 group/more"
                       >
                         <span className="text-[10px] font-black text-blue-infositel uppercase tracking-widest border-b-2 border-blue-infositel/10 group-hover/more:border-blue-infositel transition-all">
                           {expandedProducts.includes(p.id) ? "Mostrar menos ▲" : "Ver detalles completos ▼"}
                         </span>
                         <motion.div
                            animate={{ y: expandedProducts.includes(p.id) ? 0 : [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                         >
                            <ChevronRight size={10} className={`text-blue-infositel transition-transform duration-300 ${expandedProducts.includes(p.id) ? '-rotate-90' : 'rotate-90'}`} />
                         </motion.div>
                       </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                     <div className="flex flex-col">
                       {p.isFeatured && <span className="text-[11px] text-blue-infositel font-black line-through opacity-40 italic">S/. {Math.round(p.price * 1.3)}.00</span>}
                       <div className="flex items-baseline gap-1">
                          <span className={`${p.isFeatured ? 'text-blue-infositel shadow-blue-500/20' : 'text-gray-900'} text-3xl font-black tracking-tighter`}>
                             S/. {p.price.toFixed(2)}
                          </span>
                       </div>
                     </div>
                     <motion.button
                       whileHover={{ scale: 1.1, rotate: 5 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => addToCart(p)}
                       className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all relative group/btn overflow-hidden ${p.isFeatured ? 'bg-blue-infositel text-white shadow-[0_15px_40px_rgba(20,51,201,0.3)]' : 'bg-gray-900 text-white hover:bg-blue-infositel shadow-xl'}`}
                     >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-spring" />
                       <ShoppingCart size={24} className="relative z-10" />
                     </motion.button>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-black text-xl italic">No hay productos en esta categoría...</p>
            </div>
          )}
        </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white z-[70] shadow-2xl flex flex-col p-4 sm:p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Tu Carrito</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-6 bg-gray-50 rounded-full">
                    <ShoppingCart size={48} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold">Tu carrito está vacío</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-blue-infositel font-bold hover:underline">
                    Ver productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <div className="relative h-20 w-20 bg-gray-50 rounded-2xl shrink-0">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.product.name}</h4>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                          <p className="font-black text-blue-infositel text-sm mt-1">S/. {item.product.price * item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center justify-between text-xl font-black">
                      <span>Total:</span>
                      <span className="text-blue-infositel">S/. {total}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm">Datos para el envío</h4>
                      <input
                        type="text"
                        placeholder="Tu Nombre Completo"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-infositel focus:outline-none"
                        value={checkoutData.name}
                        onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Número de Celular"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-infositel focus:outline-none"
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      />
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-500 text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20"
                    >
                      <MessageCircle />
                      <span>Pedir por WhatsApp</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
