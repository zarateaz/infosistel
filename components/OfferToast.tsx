"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ShoppingBag, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";

import { Product } from "@/types";


export default function OfferToast({
  onSelect,
}: {
  onSelect: (p: Product) => void;
}) {
  const [offer, setOffer] = useState<Product | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchRandomOffer = async () => {
      // Producto fallback — se muestra si no hay ofertas en la DB
      const FALLBACK: Product = {
        id: "fallback-1",
        name: "Cooler Gamer Pro",
        category: "Cooling",
        description: "Sistema térmico de alto rendimiento para tu equipo.",
        price: 320,
        salePrice: 250,
        stock: 5,
        onSale: true,
        isFeatured: false,
        image: "/img/cooler.png",
      };


      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) {
          const all: Product[] = await res.json();
          const onSale = all.filter((p) => p.onSale);

          if (onSale.length > 0) {
            const pick = onSale[Math.floor(Math.random() * onSale.length)];
            setOffer(pick);
            const t = setTimeout(() => setVisible(true), 1800);
            return () => clearTimeout(t);
          } else {
            setOffer(FALLBACK);
            const t = setTimeout(() => setVisible(true), 2500);
            return () => clearTimeout(t);
          }
        }
      } catch (error) {
        console.error("Error fetching toast offer:", error);
      }
    };
    fetchRandomOffer();
  }, []);

  if (!offer) return null;

  const discount = Math.round(
    (1 - (offer.salePrice ?? 0) / offer.price) * 100
  );
  const savings = (offer.price - (offer.salePrice ?? 0)).toFixed(0);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ x: 420, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 420, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed bottom-6 right-6 z-[200] w-[340px] select-none"
          style={{
            filter: "drop-shadow(0 24px 48px rgba(20,51,201,0.25))",
          }}
        >
          {/* Outer glow ring (pulsing) */}
          <motion.div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-infositel via-blue-400 to-blue-600 opacity-60"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Card body */}
          <div className="relative bg-white rounded-3xl overflow-hidden">
            {/* Top accent bar */}
            <motion.div
              className="h-1 bg-gradient-to-r from-blue-infositel via-blue-400 to-blue-600"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            />

            {/* Header row */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2.5"
              >
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-blue-infositel animate-ping opacity-40" />
                  <div className="relative w-8 h-8 rounded-full bg-blue-infositel flex items-center justify-center">
                    <Zap size={14} className="text-white fill-white" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-infositel tracking-[0.25em] uppercase">
                    Oferta Flash
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold">
                    Solo por tiempo limitado 🔥
                  </p>
                </div>
              </motion.div>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>

            {/* Product row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-4 px-5 pb-4"
            >
              {/* Product image */}
              <div
                className="relative w-20 h-20 rounded-2xl shrink-0 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#dce8ff,#eef3ff)",
                }}
              >
                {/* inner glow */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-infositel/20 blur-xl" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    className="object-contain p-2"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </motion.div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-infositel font-black uppercase tracking-widest mb-0.5">
                  {offer.category}
                </p>
                <h3 className="text-sm font-black text-black leading-tight truncate">
                  {offer.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-lg font-black text-blue-infositel">
                    S/. {offer.salePrice}
                  </span>
                  <span className="text-xs text-gray-300 line-through font-bold">
                    S/. {offer.price}
                  </span>
                  <span className="text-[9px] bg-blue-infositel text-white px-2 py-0.5 rounded-full font-black">
                    -{discount}%
                  </span>
                </div>
                <p className="text-[10px] text-green-600 font-black mt-0.5">
                  Ahorras S/. {savings} ✓
                </p>
              </div>
            </motion.div>

            {/* Urgency bar */}
            <div className="px-5 pb-3">
              <div className="flex justify-between text-[9px] font-bold mb-1">
                <span className="text-gray-400">Stock disponible</span>
                <span className="text-orange-500">¡Últimas unidades!</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-infositel to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "38%" }}
                  transition={{
                    delay: 0.8,
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-5">
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  onSelect(offer);
                  setDismissed(true);
                }}
                className="w-full relative overflow-hidden bg-blue-infositel text-white h-12 rounded-2xl font-black flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/30 group"
              >
                {/* Shine sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <ShoppingBag size={16} className="relative z-10" />
                <span className="relative z-10 tracking-widest uppercase text-xs">
                  Quiero Esta Oferta
                </span>
                <ArrowRight
                  size={14}
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </div>

            {/* Bottom timer bar */}
            <motion.div
              className="h-0.5 bg-gradient-to-r from-blue-infositel to-blue-300 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 12, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
