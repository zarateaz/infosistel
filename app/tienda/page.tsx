"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Search, Filter, MessageCircle, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageBg from "@/components/PageBg";
import ImageFrame from "@/components/ImageFrame";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  isFeatured?: boolean;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mouse Gamer AETHEREAL G7",
    category: "Mouse",
    description: "Tecnología de neón RGB, sensor óptico de alta precisión y diseño ergonómico para largas sesiones.",
    price: 490,
    stock: 10,
    image: "/img/producto3mouse.webp",
    isFeatured: true
  },
  {
    id: "2",
    name: "Teclado Mecánico G7 RGB",
    category: "Teclado",
    description: "Iluminación RGB Pro Series, switches mecánicos de respuesta instantánea y cable reforzado.",
    price: 380,
    stock: 8,
    image: "/img/producto5teclado.webp",
    isFeatured: true
  },
  {
    id: "3",
    name: "Laptop ASUS ROG Strix G16",
    category: "Laptops",
    description: "Potencia sin límites: RTX 4080, i9-13980HX, 32GB RAM. La cima del rendimiento móvil.",
    price: 8900,
    stock: 3,
    image: "/img/fondo4laptop.webp",
    isFeatured: true
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
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-black mb-4">Catálogo de Productos</h1>
          <p className="text-gray-500 max-w-2xl">
            Encuentra los mejores repuestos y accesorios para tu computadora con la garantía y soporte de INFOSISTEL.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 sm:gap-12">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-56 xl:w-64 space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Filter size={18} /> Categorías
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left touch-manipulation ${
                    activeCategory === cat
                      ? "bg-blue-infositel text-white shadow-lg shadow-blue-500/20 scale-105"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-infositel focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -12,
                    transition: { duration: 0.3 } 
                  }}
                  transition={{ duration: 0.6 }}
                  key={p.id}
                  className={`group bg-white rounded-3xl p-6 transition-all duration-500 ${p.isFeatured ? 'shadow-[0_20px_60px_rgba(20,51,201,0.12)] z-10' : 'hover:shadow-[0_30px_80px_rgba(20,51,201,0.08)]'}`}
                >
                  {/* Image zone — no borders, pure glow */}
                  <div className="relative h-56 w-full rounded-2xl mb-6 overflow-hidden">
                    {/* Gradient backdrop */}
                    <div className={`absolute inset-0 ${p.isFeatured ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30' : 'bg-gradient-to-br from-gray-50 to-white'}`} />
                    {/* Floating energy glow */}
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className={`w-32 h-32 rounded-full blur-[50px] ${p.isFeatured ? 'bg-blue-infositel/15' : 'bg-blue-infositel/5'}`} />
                    </motion.div>
                    {p.isFeatured && (
                      <div className="absolute top-4 left-4 z-20 bg-blue-infositel text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/25">
                        Pro Series
                      </div>
                    )}
                    <ImageFrame className="w-full h-full rounded-2xl" badgeText={p.isFeatured ? "ELITE" : "PRO"}>
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        priority={p.isFeatured}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-contain p-4 transition-transform duration-700 ${p.isFeatured ? 'group-hover:scale-115' : 'group-hover:scale-110'}`}
                        style={{ filter: `drop-shadow(0 15px 30px rgba(20,51,201,${p.isFeatured ? '0.2' : '0.1'}))` }}
                      />
                    </ImageFrame>
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  </div>
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.isFeatured ? 'text-blue-infositel' : 'text-gray-300'}`}>
                      {p.category}
                    </span>
                    <h3 className={`text-xl font-bold transition-colors ${p.isFeatured ? 'text-black group-hover:text-blue-infositel' : 'text-gray-800'}`}>
                      {p.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-5 my-4">{p.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      {p.isFeatured && <span className="text-[10px] text-blue-infositel font-black line-through opacity-50">S/. {Math.round(p.price * 1.2)}</span>}
                      <span className={`text-2xl font-black ${p.isFeatured ? 'text-blue-infositel' : 'text-black'}`}>S/. {p.price}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className={`p-4 rounded-xl transition-all overflow-hidden relative group/btn ${p.isFeatured ? 'bg-blue-infositel text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35' : 'bg-black text-white hover:bg-blue-infositel'}`}
                    >
                      <div className="absolute inset-0 bg-white/15 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      <ShoppingCart size={20} className="relative z-10" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
              <p className="text-gray-400 font-bold text-lg">No se encontraron productos en esta categoría.</p>
            </div>
          )}
        </div>
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
