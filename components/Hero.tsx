"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    label: "SISTEMAS · GEN.06",
    title: "PCs de Alto",
    highlight: "Rendimiento",
    sub: "Gaming y trabajo profesional con componentes de última generación.",
    image: "/img/pc.png",
    badge: "GAMING PRO",
  },
  {
    label: "IMPRESIÓN · PRO X",
    title: "Impresoras",
    highlight: "Corporativas",
    sub: "Soluciones enterprise de alta gama para tu negocio.",
    image: "/img/impresora.png",
    badge: "ENTERPRISE",
  },
  {
    label: "MOVILIDAD · ELITE",
    title: "Laptops",
    highlight: "Gaming",
    sub: "Rendimiento extremo en movilidad. Piezas originales garantizadas.",
    image: "/img/laptop.png",
    badge: "ELITE",
  },
];

const STATS = [
  { val: "500+", lbl: "Clientes" },
  { val: "100%", lbl: "Garantía" },
  { val: "5+", lbl: "Años" },
];

const TICKER = ["INFOSISTEL", "TECH PREMIUM", "INNOVACIÓN 2026", "HARDWARE PRO", "HUANCAYO", "GARANTÍA TOTAL", "SOPORTE 24/7"];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white" style={{ minHeight: "100svh" }}>

      {/* Grid BG */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(20,51,201,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,51,201,0.04) 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-blue-infositel/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-infositel/6 blur-[110px] pointer-events-none" />

      {/* Particle dots — decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "15%", left: "5%", s: 3, d: 0 },
          { top: "70%", left: "8%", s: 2, d: 1.5 },
          { top: "30%", right: "6%", s: 4, d: 0.8 },
          { top: "80%", right: "10%", s: 2, d: 2 },
          { top: "50%", left: "50%", s: 3, d: 1 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-infositel/25"
            style={{ top: p.top, left: (p as any).left, right: (p as any).right, width: p.s, height: p.s }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 3 + p.d, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        loop
        style={{ minHeight: "100svh" }}
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            {/* ── MOBILE: Stack vertical | DESKTOP: Two column ── */}
            <div className="relative flex flex-col lg:flex-row min-h-[100svh] w-full">

              {/* ══ VISUAL ZONE ══ top on mobile · right on desktop */}
              <div className="order-first lg:order-last w-full lg:w-[52%] flex items-center justify-center relative pt-20 pb-4 lg:pt-0 lg:pb-0">

                {/* Halo rings */}
                <motion.div
                  className="absolute rounded-full border border-blue-infositel/15"
                  style={{ width: "min(72vw, 480px)", height: "min(72vw, 480px)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute rounded-full border border-blue-infositel/10"
                  style={{ width: "min(52vw, 350px)", height: "min(52vw, 350px)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Soft core glow */}
                <div
                  className="absolute rounded-full bg-blue-infositel/12 blur-[70px]"
                  style={{ width: "min(55vw, 360px)", height: "min(55vw, 360px)" }}
                />

                {/* Product image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.82, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.85, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="relative z-10"
                >
                  <motion.div
                    animate={{ y: [0, -18, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "min(68vw, 440px)", height: "min(68vw, 440px)", position: "relative" }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain"
                      style={{ filter: "drop-shadow(0 30px 80px rgba(20,51,201,0.28))" }}
                      priority={i === 0}
                    />
                  </motion.div>
                </motion.div>

                {/* HUD Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute top-[4.5rem] right-5 lg:top-16 lg:right-12 z-20 flex items-center gap-2 bg-blue-infositel text-white text-[9px] sm:text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/40 tracking-[0.2em] border border-white/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {slide.badge}
                </motion.div>

                {/* Floating mini-chips — desktop only */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-12 left-8 z-20 hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-infositel/15 text-blue-infositel text-[10px] font-black px-3 py-2 rounded-2xl shadow-sm"
                >
                  <span className="text-green-500">●</span> STOCK DISPONIBLE
                </motion.div>
              </div>

              {/* ══ TEXT ZONE ══ bottom on mobile · left on desktop */}
              <div className="order-last lg:order-first w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 pb-28 sm:pb-24 lg:pb-0 gap-5 lg:gap-7 text-center lg:text-left relative z-10">

                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center justify-center lg:justify-start gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-blue-infositel/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-infositel animate-pulse" />
                  {slide.label}
                </motion.span>

                {/* Heading */}
                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="font-black leading-[0.88] tracking-tighter text-gray-900"
                  style={{ fontSize: "clamp(2.6rem, 8.5vw, 5.5rem)" }}
                >
                  {slide.title}
                  <br />
                  <span className="text-blue-infositel relative inline-block">
                    {slide.highlight}
                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-infositel via-blue-400 to-transparent rounded-full" />
                  </span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm sm:text-base lg:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed"
                >
                  {slide.sub}
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8"
                >
                  {STATS.map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center lg:items-start">
                      <span className="text-xl sm:text-2xl font-black text-blue-infositel">{s.val}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.lbl}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
                >
                  <Link
                    href="/tienda"
                    className="group relative inline-flex items-center justify-center gap-3 bg-blue-infositel text-white h-13 sm:h-14 w-full sm:w-auto px-8 rounded-2xl font-black uppercase tracking-[0.15em] text-sm shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-95 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10">Ver Catálogo</span>
                    <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="https://wa.me/51964648202"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-13 sm:h-14 w-full sm:w-auto px-7 rounded-2xl font-black text-sm border-2 border-blue-infositel/20 text-blue-infositel hover:border-blue-infositel/60 hover:bg-blue-infositel/5 transition-all active:scale-95"
                  >
                    Cotizar ahora
                  </a>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom ticker — visible on desktop, hidden on mobile */}
      <div className="absolute bottom-0 left-0 right-0 z-30 hidden lg:flex items-center overflow-hidden bg-white/60 backdrop-blur-sm border-t border-blue-infositel/10 py-3 pointer-events-none">
        <motion.div
          animate={{ x: [0, -2200] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-16 whitespace-nowrap"
        >
          {[...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="text-[11px] font-black text-blue-infositel/35 tracking-[0.35em] uppercase">
              ◆ {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
