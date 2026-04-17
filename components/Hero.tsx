"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { PlasmaRing, EnergyBeam, OrbitDot, LightningArc } from "@/components/PageBg";
import ImageFrame from "@/components/ImageFrame";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    label: "SISTEMAS · GEN.06",
    title: "PCs de Alto",
    highlight: "Rendimiento",
    description: "Configuraciones extremas para Gaming y Trabajo Profesional con componentes de última generación.",
    image: "/img/pc.png",
    accentColor: "#1433C9",
  },
  {
    label: "IMPRESIÓN · PRO X",
    title: "Impresoras",
    highlight: "Corporativas",
    description: "Mantenimiento especializado y venta de soluciones de impresión de alta gama.",
    image: "/img/impresora.png",
    accentColor: "#1433C9",
  },
  {
    label: "MOVILIDAD · ELITE",
    title: "Laptops",
    highlight: "Gaming",
    description: "La cima del rendimiento móvil: Reparación y repotenciación con piezas originales.",
    image: "/img/laptop.png",
    accentColor: "#1433C9",
  },
];

const TICKER = ["INFOSITEL", "TECH", "PREMIUM", "INNOVACIÓN", "HARDWARE", "PRO SERIES", "HUANCAYO"];

/* ── Slide Background: Pure electric energy ── */
function SlideBg({ accentColor }: { accentColor: string }) {
  return (
    <>
      {/* Subtle digital grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Intense but clean ambient glow */}
      <motion.div
        className="absolute inset-0 will-change-[opacity]"
        style={{ background: `radial-gradient(circle at 75% 50%, ${accentColor}10 0%, transparent 60%)` }}
        whileInView={{ opacity: [0.6, 1, 0.6] }}
        viewport={{ once: false }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Futuristic Plasma Structure */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40">
        <PlasmaRing size={850} duration={30} dir={1}  dash={50} opacity={0.2} idPrefix="hero-v2" />
        <PlasmaRing size={620} duration={20} dir={-1} dash={30} opacity={0.3} idPrefix="hero-v2" />
      </div>

      {/* Energy Beams — cleaner, sharper */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {[0, 60, 120, 180].map((angle, i) => (
          <EnergyBeam key={angle} angle={angle} delay={i * 0.5} />
        ))}
      </div>
    </>
  );
}

/* ── Floating Image — Ultra sharp ── */
function FloatingImage({ src, alt, accentColor, index }: { src: string; alt: string; accentColor: string; index: number }) {
  return (
    <div className="flex relative h-[250px] sm:h-[300px] md:h-[450px] lg:h-[600px] w-full items-center justify-center mt-12 lg:mt-0">
      {/* Kinetic Halo */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full border border-blue-infositel/10"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Core glow */}
      <div className="absolute w-[300px] h-[300px] bg-blue-infositel/5 blur-[100px] rounded-full" />

      {/* The Product Card (Floating) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -25, 0] }}
        transition={{
          opacity: { duration: 1 },
          scale:   { duration: 1, ease: [0.2, 0.65, 0.3, 0.9] },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative z-10 w-full h-[80%] max-h-[500px]"
      >
        <ImageFrame className="w-full h-full rounded-[3rem]" badgeText="SYS CORE">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-8"
            style={{
              filter: `drop-shadow(0 40px 80px rgba(20,51,201,0.25))`,
            }}
            priority={index === 0}
          />
        </ImageFrame>
      </motion.div>

      {/* Tech node decorations */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-3 u-3 border-2 border-blue-infositel rounded-sm hidden lg:block"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}

export default function Hero() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100vh] lg:min-h-[650px] lg:h-[90vh] w-full overflow-hidden bg-white">

      {/* Futuristic Vertical Ticker */}
      <div className="absolute right-12 top-0 bottom-0 z-20 flex flex-col justify-center gap-12 pointer-events-none opacity-20 hidden xl:flex">
         {TICKER.map((lbl, i) => (
           <span key={i} className="text-[10px] font-black text-blue-infositel tracking-[0.5em] [writing-mode:vertical-lr] uppercase">
             {lbl}
           </span>
         ))}
      </div>

      {/* SYS Monitor */}
      <motion.div
        className="absolute bottom-12 left-12 z-20 hidden lg:flex items-center gap-4 text-[10px] font-mono text-blue-infositel/40"
      >
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="w-1 h-3 bg-blue-infositel/20" animate={{ height: [4, 12, 4] }} transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }} />
          ))}
        </div>
        INFOSITEL_OS_v6.2 :: STABLE_{tick}
      </motion.div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative h-full w-full bg-white">
            <div className="absolute inset-0 z-0">
              <SlideBg accentColor={slide.accentColor} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 pt-24 pb-32 lg:py-12">
              <div className="space-y-6 lg:space-y-10 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-white border border-blue-infositel/10 shadow-xl shadow-blue-500/5 text-blue-infositel text-[10px] font-black tracking-[0.3em] uppercase"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-infositel animate-pulse" />
                  {slide.label}
                </motion.div>

                <div className="space-y-4">
                  <motion.h1
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="text-[clamp(3rem,10vw,6.5rem)] font-black leading-[0.9] tracking-tighter text-black"
                  >
                    {slide.title}<br />
                    <span className="text-blue-infositel drop-shadow-[0_15px_30px_rgba(20,51,201,0.2)]">
                      {slide.highlight}
                    </span>
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-xl font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed"
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
                >
                  <Link
                    href="/tienda"
                    className="group relative inline-flex items-center gap-4 bg-blue-infositel text-white h-20 px-12 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.03] active:scale-95 text-sm"
                  >
                    <span>Explorar Equipos</span>
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              <FloatingImage
                src={slide.image}
                alt={slide.title}
                accentColor={slide.accentColor}
                index={index}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
