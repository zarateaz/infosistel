"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import ImageFrame from "@/components/ImageFrame";

import { Product } from "@/types";


// Ofertas fallback — se muestran si no hay productos en oferta en la DB
const FALLBACK_OFFERS: Product[] = [
  {
    id: "f1",
    name: "Cooler Gamer Pro",
    category: "Cooling",
    description: "Sistema térmico de alto rendimiento para tu equipo.",
    price: 320,
    salePrice: 250,
    stock: 5,
    onSale: true,
    isFeatured: false,
    image: "/img/cooler.png",
  },
  {
    id: "f2",
    name: "Gaming Mouse X7",
    category: "Periféricos",
    description: "Precisión extrema de 16000 DPI para gaming y diseño profesional.",
    price: 230,
    salePrice: 180,
    stock: 8,
    onSale: true,
    isFeatured: false,
    image: "/img/mouse.png",
  },
  {
    id: "f3",
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    description: "Respuesta táctica y diseño gamer con iluminación RGB completa.",
    price: 400,
    salePrice: 320,
    stock: 6,
    onSale: true,
    isFeatured: false,
    image: "/img/teclado.png",
  },
];


export default function OffersSection({
  onSelect,
}: {
  onSelect: (p: Product) => void;
}) {
  const [offers, setOffers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) {
          const allProducts: Product[] = await res.json();
          const onSale = allProducts.filter((p) => p.onSale && p.salePrice);
          // Si hay ofertas reales en DB, usarlas. Si no, mostrar fallback.
          setOffers(onSale.length > 0 ? onSale : FALLBACK_OFFERS);
        } else {
          setOffers(FALLBACK_OFFERS);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers(FALLBACK_OFFERS);
      }
    };
    fetchOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="py-28 bg-white overflow-hidden relative">
      {/* Radial blue glow top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(20,51,201,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* ── HEADER centrado, llamativo ── */}
        <div className="text-center mb-20 space-y-5">
          {/* Animated pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 py-2.5 px-7 rounded-full bg-blue-infositel text-white font-black text-xs tracking-[0.22em] uppercase shadow-xl shadow-blue-500/30"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            🔥 Ofertas Exclusivas · Tiempo Limitado
          </motion.div>

          {/* Headline split */}
          <div className="overflow-hidden space-y-0">
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
              viewport={{ once: true }}
              className="text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-none tracking-tighter text-black"
            >
              ¡Aprovecha
            </motion.div>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.12,
                ease: [0.2, 0.65, 0.3, 0.9],
              }}
              viewport={{ once: true }}
              className="relative inline-block"
            >
              <span className="text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-none tracking-tighter text-blue-infositel">
                Nuestras Ofertas!
              </span>
              {/* Draw-in underline */}
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-[5px] bg-gradient-to-r from-blue-infositel via-blue-400 to-blue-600 rounded-full"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.65, duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-gray-400 text-lg font-medium max-w-md mx-auto leading-relaxed pt-2"
          >
            Precios imbatibles en hardware premium. ¡No dejes pasar esta
            oportunidad!
          </motion.p>
        </div>

        {/* ── CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((product, idx) => {
            const discount = Math.round(
              (1 - (product.salePrice ?? 0) / product.price) * 100
            );
            const savings = (
              product.price - (product.salePrice ?? 0)
            ).toFixed(0);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative bg-white rounded-[3rem] overflow-hidden border border-gray-100 hover:border-blue-infositel/30 transition-all duration-500 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.02)]"
              >
                {/* ── IMAGE ZONE ── */}
                <div className="relative h-72 bg-white flex items-center justify-center p-8 overflow-hidden">
                  {/* Digital pulse background */}
                  <div className="absolute inset-0 bg-blue-infositel/[0.01] pointer-events-none" />
                  <motion.div 
                    className="absolute w-48 h-48 bg-blue-infositel/5 blur-[80px] rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  {/* Product Image */}
                  <motion.div
                    className="relative w-full h-full z-10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ImageFrame className="w-full h-full rounded-[2rem]" badgeText="LIMITED">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-6 drop-shadow-[0_20px_40px_rgba(20,51,201,0.15)]"
                      />
                    </ImageFrame>
                  </motion.div>

                  {/* Badge */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className="bg-blue-infositel text-white px-5 py-2 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-500/20">
                      -{discount}% PROMO
                    </div>
                  </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="p-10 space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-blue-infositel/40 uppercase tracking-[0.4em] block">
                      {product.category}
                    </span>
                    <h3 className="text-2xl font-black text-black group-hover:text-blue-infositel transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-black text-blue-infositel">
                      S/. {product.salePrice}
                    </span>
                    <span className="text-sm text-gray-300 line-through font-bold">
                      S/. {product.price}
                    </span>
                  </div>

                  {/* Minimal progress bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-400">Stock Status</span>
                      <span className="text-blue-infositel">Limited Edition</span>
                    </div>
                    <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-infositel"
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(product)}
                    className="mt-6 w-full group/btn relative bg-blue-infositel text-white h-16 rounded-[1.5rem] font-black flex items-center justify-center gap-4 overflow-hidden transition-all hover:scale-[1.02] shadow-2xl shadow-blue-500/20"
                  >
                    <span className="relative z-10 text-xs tracking-[0.2em] uppercase">Obtener Ahora</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-blue-700 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-3 text-blue-infositel font-black text-lg hover:gap-5 transition-all duration-300"
          >
            Ver toda la tienda
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
