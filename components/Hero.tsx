"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Wrench, ShieldCheck, Users, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Mobile-perf fix: the WebGL shader pulls in ~900KB of three.js and is heavy
// enough on a phone GPU to be the "lag severo" reported on mobile — loaded
// with next/dynamic (ssr:false) and only ever mounted on desktop (see
// `isDesktop` below), so phones never download or run this chunk at all.
// The section keeps its static .bg-aurora gradient underneath regardless.
const AnimatedShaderBackground = dynamic(() => import("@/components/ui/animated-shader-background"), {
  ssr: false,
});

const slides = [
  {
    title: "PCs de alto",
    highlight: "rendimiento",
    sub: "Gaming y trabajo profesional con componentes de última generación.",
    image: "/img/pc.webp",
    specs: ["RTX 5060", "32GB RAM", "SSD 1TB"],
  },
  {
    title: "Impresoras",
    highlight: "para tu negocio",
    sub: "Soluciones de alta gama, listas para producción diaria.",
    image: "/img/impresora.webp",
    specs: ["Tinta continua", "WiFi Direct", "Dúplex"],
  },
  {
    title: "Laptops",
    highlight: "gaming",
    sub: "Rendimiento extremo en movilidad. Piezas originales garantizadas.",
    image: "/img/laptop.webp",
    specs: ["16\" QHD", "32GB RAM", "SSD 1TB"],
  },
];

const STATS = [
  { value: "500+", label: "Clientes", icon: Users },
  { value: "100%", label: "Garantía", icon: ShieldCheck },
  { value: "5+", label: "Años", icon: Clock },
];

// ── Product image with a subtle cursor-follow tilt (desktop only) ──
function TiltImage({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-full"
      style={{ perspective: 1000 }}
    >
      <motion.div style={{ rotateX, rotateY }} className="absolute inset-0">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* A real photo card — the source photos are flat-color-background
              product shots, so we frame that deliberately instead of letting
              the white rectangle clash straight against the dark tile. */}
          <div className="relative w-full h-full bg-white rounded-[1.5rem] border border-white/70 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.55)] p-4 sm:p-5 overflow-hidden">
            <Image src={src} alt={alt} fill className="object-contain p-2" priority={active} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const [active, setActive] = useState(0);
  // Defaults to false (mobile-safe) until confirmed desktop — phones never
  // pay for the shader chunk even for the brief instant before this resolves.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative w-full bg-aurora overflow-hidden pt-28 pb-14 lg:pt-32 lg:pb-16">
      {/* Animated WebGL aurora shader — desktop only (see isDesktop above).
          Falls back to the static .bg-aurora gradient everywhere else. */}
      {isDesktop && <AnimatedShaderBackground className="opacity-80 mix-blend-screen" />}

      {/* Grid texture, consistent with the other dark sections */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Bottom fade so hero content and the section below stay legible over the shader */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#05070f] pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:gap-5 lg:h-[600px]">

          {/* ── FEATURED TILE — rotating product carousel ── */}
          <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 relative rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
            <div className="relative z-10 flex-1 flex flex-col justify-center p-8 md:p-10 text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
                >
                  <h1
                    className="font-display tracking-tight text-white leading-[0.95]"
                    style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.6rem)" }}
                  >
                    <span className="font-light block">{slide.title}</span>
                    <span className="font-black text-gradient-brand">{slide.highlight}</span>
                  </h1>

                  <p className="text-white/50 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 leading-relaxed mt-4">
                    {slide.sub}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4 text-[11px] font-bold tracking-wide text-white/30">
                    {slide.specs.map((s, i) => (
                      <span key={s} className="flex items-center gap-3">
                        {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-7">
                <Link
                  href="/tienda"
                  className="group inline-flex items-center justify-center gap-2.5 bg-white text-gray-900 h-12 px-7 rounded-full font-bold text-sm transition-all hover:bg-blue-infositel hover:text-white active:scale-95"
                >
                  Ver catálogo
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* slide dots */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-6">
                {slides.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setActive(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-gradient-brand" : "w-1.5 bg-white/15"}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating product photo card */}
            <div className="relative h-[170px] sm:h-[210px] lg:h-[250px] shrink-0 px-8 sm:px-10 pb-8 sm:pb-10">
              <div className="absolute inset-x-0 bottom-0 h-full rounded-full bg-blue-infositel/20 blur-[70px] mx-16" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="absolute inset-0"
                >
                  <TiltImage src={slide.image} alt={slide.title} active={active === 0} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── STATS TILE ── */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 flex flex-row lg:flex-col justify-between lg:justify-center gap-4 lg:gap-5">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                  <stat.icon size={16} className="text-cyan-300" />
                </div>
                <div>
                  <span className="font-display text-xl font-black text-white block leading-none">{stat.value}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── WHATSAPP QUICK CONTACT TILE ── */}
          <a
            href="https://wa.me/51964648202"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-[2rem] bg-gradient-brand p-6 flex flex-col justify-between overflow-hidden shadow-glow-brand hover:scale-[1.02] transition-transform"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">Cotiza gratis</p>
              <p className="text-white/70 text-xs font-medium mt-1">Respuesta inmediata por WhatsApp</p>
            </div>
          </a>

          {/* ── REPARACIÓN EXPRESS TILE ── */}
          <Link
            href="/#servicios"
            className="group sm:col-span-2 lg:col-span-2 relative rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between gap-4 hover:border-white/25 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-gradient-brand transition-colors duration-400">
                <Wrench size={18} className="text-cyan-300 group-hover:text-white transition-colors duration-400" />
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">Reparación Express</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">Diagnóstico gratis en 24 horas</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
