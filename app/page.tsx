"use client";

import Hero from "@/components/Hero";
import Services from "@/components/Services";
import InstantCheckout from "@/components/InstantCheckout";
import OffersSection from "@/components/OffersSection";
import OfferToast from "@/components/OfferToast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Phone, Cpu, Zap, ShoppingCart } from "lucide-react";
import ImageFrame from "@/components/ImageFrame";
import { useRef, useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  onSale?: boolean;
  salePrice?: number;
  isFeatured?: boolean;
}

// --- Internal Components for Premium Feel ---


function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const tx = useSpring(mouseX, springConfig);
  const ty = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: tx, y: ty }}
      className="inline-block"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

function RevealText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          viewport={{ once: true }}
          className="inline-block mr-[0.2em]"
        >
          {word}
        </motion.span>
      ))}
    </h2>
  );
}


export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-precision motion values for deep parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  const springConfig = { damping: 40, stiffness: 250 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for layers — ALL declared at top level (hooks rules compliant)
  const stackRotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const stackRotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  
  // front layer moves more
  const frontX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const frontY = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);
  
  // mid layer moves less
  const midX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const midY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  // back layer moves opposite
  const backX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);

  // Product 4 & 5 parallax — previously called inside map() violating hooks rules
  const prod4X = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const prod5X = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);

  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) {
          const all: Product[] = await res.json();
          const featured = all.filter(p => p.isFeatured);
          const others = all.filter(p => !p.isFeatured);
          
          const uniqueByImage: Product[] = [];
          const seenImages = new Set();
          
          for (const p of [...featured, ...others]) {
            if (!seenImages.has(p.image)) {
              uniqueByImage.push(p);
              seenImages.add(p.image);
            }
          }

          // FALLBACK LOGIC: If we have less than 4 unique, add premium placeholders
          const placeholders: Product[] = [
            { id: "p1", name: "Laptop Blogger", category: "Laptops", description: "Potencia y elegancia para creadores de contenido.", price: 4200, stock: 4, image: "/img/tienda1laptops.png" },
            { id: "p2", name: "Cooler Pro G7", category: "Cooling", description: "Sistema térmico de alto rendimiento.", price: 250, stock: 15, image: "/img/tienda2cooler.png" },
            { id: "p3", name: "RTX 5060 Ti", category: "GPU", description: "Gráficos de siguiente nivel con DLSS 4.", price: 3400, stock: 3, image: "/img/tienda3rtx5060.png" },
            { id: "p4", name: "Teclado RGB", category: "Accesorios", description: "Respuesta táctica y diseño ergonómico.", price: 320, stock: 10, image: "/img/tienda4teclado.png" },
          ];

          // Prioritize these 4 images as requested
          let finalDisplay = [...placeholders];
          
          // Then add DB products if there's room (though slice will cut at 4 for now)
          for (const p of uniqueByImage) {
            if (finalDisplay.length >= 10) break;
            if (!seenImages.has(p.image)) {
              finalDisplay.push(p);
            }
          }

          setDisplayProducts(finalDisplay.slice(0, 4));
        }
      } catch (e) {
        console.error("Error loading display products:", e);
      }
    };
    loadProducts();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div>
      <Hero />
      
      <InstantCheckout 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* ── OFFER TOAST NOTIFICATION ── */}
      <OfferToast onSelect={handleSelectProduct} />

      <Services />

      {/* ══════════════════════════════════════════════════════
           ULTRA-FUTURISTIC STORE SHOWCASE  
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-white overflow-hidden">
        {/* Subtle dynamic grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#1433C9 1.5px, transparent 1.5px), linear-gradient(90deg, #1433C9 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative bg-white rounded-[5rem] p-12 md:p-24 overflow-hidden border border-gray-50 shadow-[0_40px_120px_rgba(0,0,0,0.03)]"
          >
            {/* Massive blue halo in background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-infositel/[0.04] blur-[150px] rounded-full pointer-events-none" />

            {/* Futuristic Tech Lines */}
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-infositel/20 to-transparent pointer-events-none" 
            />
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, delay: 1, repeat: Infinity }}
              className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-infositel/20 to-transparent pointer-events-none" 
            />

            <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              {/* ── LEFT: PURE WHITE & BLUE TYPE ── */}
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-4 py-3 px-8 rounded-2xl bg-white border-2 border-blue-infositel/10 text-blue-infositel font-black text-xs tracking-[0.3em] uppercase shadow-xl shadow-blue-500/5"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-infositel"></span>
                  </span>
                  Innovation Store
                </motion.div>

                <div className="space-y-2">
                  <RevealText text="Explora Nuestra" className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.9] tracking-tighter text-black" />
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <span className="text-[clamp(3.5rem,9vw,8rem)] font-black leading-[0.9] tracking-tighter text-blue-infositel drop-shadow-[0_10px_30px_rgba(20,51,201,0.15)]">
                      Tecnología
                    </span>
                  </motion.div>
                </div>

                <motion.p
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   transition={{ delay: 0.6 }}
                   viewport={{ once: true }}
                   className="text-gray-400 text-xl font-medium max-w-md leading-relaxed"
                >
                  Redefiniendo el hardware en Huancayo. Equipos de alta gama seleccionados para la excelencia.
                </motion.p>

                <div className="flex flex-wrap gap-12">
                   {[
                     { value: "01", label: "Calidad" },
                     { value: "02", label: "Potencia" },
                     { value: "03", label: "Garantía" },
                   ].map((s, idx) => (
                     <motion.div 
                       key={s.label}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.7 + idx * 0.1 }}
                       viewport={{ once: true }}
                       className="group"
                     >
                       <div className="text-4xl font-black text-black group-hover:text-blue-infositel transition-colors">{s.value}</div>
                       <div className="text-[9px] font-black text-blue-infositel/40 uppercase tracking-[0.4em]">{s.label}</div>
                     </motion.div>
                   ))}
                </div>

                <div className="pt-6">
                  <MagneticButton
                    href="/tienda"
                    className="group/btn relative inline-flex items-center justify-center bg-blue-infositel text-white h-20 px-16 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all shadow-2xl shadow-blue-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-4">
                      Entrar al Universo <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                  </MagneticButton>
                </div>
              </div>

              {/* ── RIGHT: FUTURISTIC ORBITAL DISPLAY ── */}
              <motion.div
                style={{ rotateX: stackRotateX, rotateY: stackRotateY }}
                className="relative h-[650px] w-full flex items-center justify-center p-12"
              >
                {/* Clean white rings with blue dots */}
                {[550, 420, 290].map((size, i) => (
                  <motion.div
                    key={size}
                    className="absolute rounded-full border border-blue-infositel/5 pointer-events-none"
                    style={{ width: size, height: size }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
                  />
                ))}

                {/* ── DYNAMIC PRODUCTS AS ORBITING NODES ── */}
                {displayProducts.length > 0 ? (
                  displayProducts.map((p, i) => {
                    const positions = [
                      { top: '5%', left: '5%' },   // Top Left
                      { top: '5%', right: '5%' },  // Top Right
                      { bottom: '15%', left: '5%' },  // Bottom Left
                      { bottom: '15%', right: '5%' }  // Bottom Right
                    ];
                    const pos = positions[i];
                    const isCenter = pos.center;

                    return (
                      <motion.div
                        key={p.id}
                        style={{ 
                          top: pos.top,
                          left: pos.left,
                          right: pos.right,
                          bottom: pos.bottom,
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15, duration: 1 }}
                        animate={{ 
                          y: [0, -15, 0],
                          rotate: i % 2 === 0 ? [0, 2, 0] : [0, -2, 0]
                        }}
                        className="absolute flex flex-col items-center justify-center w-56 h-56 z-40"
                      >
                         {/* Crystal Card Body */}
                         <motion.div 
                           whileHover={{ scale: 1.05, rotate: 0 }}
                           onClick={() => handleSelectProduct(p)}
                           className={`relative w-full h-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-6 shadow-2xl shadow-blue-500/10 cursor-pointer overflow-hidden group`}
                         >
                            {/* Inner blue glow pulse */}
                            <motion.div 
                               className="absolute inset-0 bg-blue-infositel/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               animate={{ scale: [0.8, 1.2, 0.8] }}
                               transition={{ duration: 3, repeat: Infinity }}
                            />
                            
                            <div className="relative w-full h-full">
                               <ImageFrame className="w-full h-full rounded-[2.5rem]" badgeText="INNOVATION">
                                  <Image 
                                    src={p.image} 
                                    alt={p.name} 
                                    fill 
                                    className="object-contain p-4 drop-shadow-[0_20px_40px_rgba(20,51,201,0.2)] group-hover:drop-shadow-[0_30px_50px_rgba(20,51,201,0.4)] transition-all duration-500" 
                                  />
                               </ImageFrame>
                            </div>

                            {/* Shimmer sweep */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                         </motion.div>

                         {/* Minimal Floating Label */}
                         <motion.div 
                           initial={{ opacity: 0 }}
                           whileInView={{ opacity: 1 }}
                           className="mt-6 text-center"
                         >
                            <span className="text-[10px] font-black text-blue-infositel uppercase tracking-[0.5em] block mb-1">
                              {p.category}
                            </span>
                            <span className="text-xs font-black text-black uppercase tracking-widest bg-white/80 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                              {p.name.slice(0, 15)}
                            </span>
                         </motion.div>
                      </motion.div>
                    );
                  })
                ) : (
                  /* Ultra-minimal placeholder state */
                  <div className="w-40 h-40 rounded-full border-2 border-dashed border-blue-infositel/20 animate-spin-slow" />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <OffersSection onSelect={handleSelectProduct} />

      {/* Tracking Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block p-6 bg-blue-50 rounded-[2rem] mb-4"
          >
            <Clock className="text-blue-infositel" size={48} />
          </motion.div>
          <RevealText text="¿Dejaste tu equipo?" className="text-4xl md:text-5xl font-black text-black" />
          <p className="text-gray-400 text-lg font-medium">
            Haz seguimiento al estado de tu reparación en tiempo real. Solo necesitas tu DNI o el código que te entregamos.
          </p>
          <Link
            href="/rastreo"
            className="group relative inline-flex items-center justify-center border-2 border-blue-infositel/20 px-12 py-5 rounded-2xl font-black text-blue-infositel overflow-hidden transition-all hover:border-blue-infositel"
          >
            <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">Rastrear Mi Equipo</span>
            <div className="absolute inset-0 bg-blue-infositel translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black z-20">Rastrear Mi Equipo</span>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[4rem] p-8 md:p-16 shadow-sm border border-gray-100">
            <div className="space-y-12">
              <RevealText text="Visítanos en Huancayo" className="text-5xl font-black" />
              
              <div className="grid gap-10">
                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-blue-50 rounded-[1.5rem] shrink-0">
                    <MapPin className="text-blue-infositel" size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Dirección</h4>
                    <p className="text-gray-500 text-lg">Av. Giráldez 274, Huancayo 12001</p>
                  </div>
                </div>

                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-green-50 rounded-[1.5rem] shrink-0">
                    <Phone className="text-green-600" size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Teléfono / WhatsApp</h4>
                    <p className="text-gray-500 font-black text-xl">+51 964 648 202</p>
                  </div>
                </div>

                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-gray-50 rounded-[1.5rem] shrink-0">
                    <Clock className="text-gray-600" size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Horario de Atención</h4>
                    <p className="text-gray-500 text-lg">Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av.+Giraldez+274+Huancayo"
                  target="_blank"
                  className="bg-blue-infositel text-white px-10 py-5 rounded-[1.5rem] font-black inline-block hover:scale-110 active:scale-95 transition-transform shadow-xl shadow-blue-500/20"
                >
                  Cómo llegar en Google Maps
                </a>
              </div>
            </div>

            <div className="min-h-[500px] rounded-[3rem] overflow-hidden border-[12px] border-gray-50 shadow-inner bg-gray-100 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15606.884545237736!2d-75.2109!3d-12.0667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e96497f1f33f1%3A0xe7a5c7f8a3d13c7a!2sAv.%20Giraldez%20274%2C%20Huancayo%2012001!5e0!3m2!1ses!2spe!4v1712910000000!5m2!1ses!2spe"
                className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
