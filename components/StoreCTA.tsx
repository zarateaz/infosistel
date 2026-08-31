"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Headset, Sparkles } from "lucide-react";

// An editorial "scattered catalog" stack instead of decorative corner-floaters —
// each card is a real framed photo (rotated, layered, overlapping) so it reads
// as a deliberate collage, not stock photos dropped on a dark background.
const STACK = [
  { src: "/img/tarjeta grafica.webp", className: "w-[46%] sm:w-[44%] top-[4%] left-[8%] sm:left-[14%] z-10", rotate: -7, duration: 6 },
  { src: "/img/teclado.webp", className: "w-[48%] sm:w-[46%] top-0 right-0 z-20", rotate: 6, duration: 6.8 },
  { src: "/img/mouse.webp", className: "w-[38%] sm:w-[34%] bottom-0 left-0 z-30", rotate: -10, duration: 5.5 },
  { src: "/img/impresora.webp", className: "w-[44%] sm:w-[40%] bottom-[2%] right-[6%] sm:right-[10%] z-10", rotate: 8, duration: 6.4 },
];

const TRUST = [
  { icon: ShieldCheck, label: "Garantía 100%" },
  { icon: Truck, label: "Envíos a todo Huancayo" },
  { icon: Headset, label: "Soporte técnico real" },
];

export default function StoreCTA() {
  return (
    <section className="relative bg-aurora overflow-hidden py-24 lg:py-28">
      {/* Grid texture, consistent with Hero */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* ── TEXT ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.3em] uppercase text-cyan-300">
              <Sparkles size={13} />
              Tienda Online
            </span>
            <h2
              className="font-display font-black text-white tracking-tight leading-[0.95] mt-5"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)" }}
            >
              Todo tu setup,
              <span className="block text-gradient-brand">en un solo lugar</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed mt-6">
              RAM, SSD, laptops, cámaras, redes y más — con precios reales, stock real y garantía de
              una tienda con local físico en Huancayo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-9">
              <Link
                href="/tienda"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-brand text-white h-14 px-10 rounded-full font-black text-sm uppercase tracking-widest shadow-glow-brand hover:scale-[1.04] active:scale-95 transition-all"
              >
                Entrar a la tienda
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center lg:items-start justify-center lg:justify-start gap-x-8 gap-y-4 mt-12 pt-8 border-t border-white/10">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 text-white/50">
                  <t.icon size={16} className="text-cyan-300 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── SCATTERED PRODUCT COLLAGE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="order-1 lg:order-2 relative h-[300px] sm:h-[380px] lg:h-[460px]"
          >
            <div className="absolute inset-0 rounded-full bg-blue-infositel/15 blur-[100px]" />
            {STACK.map((item) => (
              <motion.div
                key={item.src}
                className={`absolute ${item.className}`}
                style={{ rotate: item.rotate }}
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative aspect-square bg-white rounded-[1.25rem] border border-white/70 shadow-[0_25px_50px_-10px_rgba(0,0,0,0.6)] p-3 sm:p-4">
                  <Image src={item.src} alt="" fill className="object-contain p-2" />
                </div>
              </motion.div>
            ))}

            {/* Floating info chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Stock actualizado
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
