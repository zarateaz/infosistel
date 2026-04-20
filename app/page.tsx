"use client";

import Hero from "@/components/Hero";
import Services from "@/components/Services";
import InstantCheckout from "@/components/InstantCheckout";
import OffersSection from "@/components/OffersSection";
import OfferToast from "@/components/OfferToast";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Phone, Zap, Star, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { getProducts } from "./admin/actions";

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

// ── Helper to reveal text with blur/y-axis animation ──
function RevealText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.2, 0.65, 0.3, 0.9] }}
          viewport={{ once: true }}
          className="inline-block mr-[0.2em]"
        >
          {word}
        </motion.span>
      ))}
    </h2>
  );
}

// ── Orbital ring — each card orbits around the center ──
function OrbitalShowcase({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
}) {
  const ORBIT_DURATION = 35; 

  if (products.length === 0) return null;

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center flex-shrink-0 perspective-[1000px]">
      {/* Decorative static rings */}
      {[580, 440, 300].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full border border-blue-infositel/10 pointer-events-none"
          style={{ width: size, height: size }}
          animate={{ 
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 80 + i * 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      ))}

      {/* CENTER: INFOSISTEL logo badge */}
      <motion.div
        className="absolute z-20 flex flex-col items-center gap-3"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-6 rounded-[2.5rem] bg-blue-infositel/10 blur-2xl"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-infositel to-blue-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(20,51,201,0.4)]">
            <Zap size={42} className="text-white fill-white animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <span className="block text-[10px] font-black text-blue-infositel tracking-[0.6em] uppercase">INFOSISTEL</span>
          <span className="block text-[8px] font-bold text-gray-400 tracking-[0.4em] uppercase mt-1">Innovation Hub</span>
        </div>
      </motion.div>

      {/* DYNAMIC ORBITING PRODUCT CARDS */}
      {products.map((product, i) => {
        const step = 360 / products.length;
        const baseAngle = i * step;
        
        return (
          <motion.div
            key={product.id}
            className="absolute inset-0 flex items-center justify-end origin-center"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotate: [baseAngle, baseAngle + 360] }}
            transition={{
              duration: ORBIT_DURATION,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            <motion.div
              animate={{ rotate: [-baseAngle, -(baseAngle + 360)] }}
              transition={{
                duration: ORBIT_DURATION,
                ease: "linear",
                repeat: Infinity,
              }}
              whileHover={{ 
                scale: 1.15,
                zIndex: 50,
              }}
              onClick={() => onSelect(product)}
              className="group relative w-36 h-36 mr-4 cursor-pointer"
            >
              <div className="
                relative w-full h-full p-4
                bg-white/90 backdrop-blur-md rounded-[2.2rem]
                border border-white/50 shadow-[0_15px_35px_rgba(0,0,0,0.05)]
                group-hover:shadow-[0_25px_50px_rgba(20,51,201,0.15)]
                group-hover:border-blue-infositel/30 transition-all duration-500
                flex flex-col items-center justify-center overflow-hidden
              ">
                <div className="relative w-20 h-20 z-10 transition-transform duration-500 group-hover:scale-110">
                  <Image src={product.image} alt={product.name} fill className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-white via-white/80 to-transparent">
                  <span className="block text-[8px] font-black text-blue-infositel tracking-widest uppercase truncate">{product.category}</span>
                  <p className="text-[9px] font-bold text-gray-800 truncate px-1">{product.name}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await getProducts();
      // Mostramos máximo 10 para no saturar el círculo orbital
      setProducts(all.slice(0, 10));
    }
    load();
  }, []);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Hero />

      <InstantCheckout
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <OfferToast onSelect={handleSelectProduct} />

      <Services />

      {/* ── ORBITAL PRODUCT SHOWCASE ── */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#1433C9 1px, transparent 1px), linear-gradient(90deg, #1433C9 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 space-y-10 text-center lg:text-left max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 py-2.5 px-8 rounded-full border-2 border-blue-infositel/20 text-blue-infositel font-black text-xs tracking-[0.3em] uppercase"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-infositel" />
                </span>
                Innovation Store
              </motion.div>

              <div className="space-y-3">
                <RevealText
                  text="Explora Nuestra"
                  className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.9] tracking-tighter text-black"
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.85] tracking-tighter text-blue-infositel drop-shadow-[0_10px_30px_rgba(20,51,201,0.15)]"
                >
                  Tecnología
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="text-gray-400 text-lg font-medium leading-relaxed"
              >
                Hardware premium seleccionado para la excelencia. Cada producto, una experiencia única.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center justify-center lg:justify-start gap-12 py-8 border-y border-gray-100"
              >
                {[
                  { value: "500+", label: "Clientes", icon: Star },
                  { value: "100%", label: "Garantía", icon: Zap },
                  { value: "5 años", label: "Experiencia", icon: Clock },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="text-blue-infositel mx-auto mb-1 opacity-50" size={16} />
                    <div className="text-2xl font-black text-black">{stat.value}</div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/tienda"
                  className="group relative inline-flex items-center justify-center bg-blue-infositel text-white h-18 px-12 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.25em] overflow-hidden shadow-2xl shadow-blue-500/40 hover:scale-[1.04] active:scale-95 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-3">
                    Entrar al Universo
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="hidden lg:flex items-center justify-center"
            >
              <OrbitalShowcase products={products} onSelect={handleSelectProduct} />
            </motion.div>
          </div>

          <div className="lg:hidden grid grid-cols-2 gap-4 mt-16">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSelectProduct(product)}
                className="group relative bg-white rounded-[2rem] border border-gray-100 hover:border-blue-infositel/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col items-center text-center"
              >
                <span className="text-[9px] font-black text-blue-infositel tracking-[0.3em] uppercase mb-3 block">{product.category}</span>
                <div className="relative w-28 h-28">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                    className="relative w-full h-full"
                  >
                    <Image src={product.image} alt={product.name} fill className="object-contain drop-shadow-[0_10px_25px_rgba(20,51,201,0.15)] group-hover:drop-shadow-[0_15px_35px_rgba(20,51,201,0.3)] transition-all duration-300" />
                  </motion.div>
                </div>
                <h3 className="text-sm font-black text-black group-hover:text-blue-infositel transition-colors mt-3 leading-tight">{product.name}</h3>
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-infositel to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OffersSection onSelect={handleSelectProduct} />

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
          <p className="text-gray-400 text-lg font-medium">Haz seguimiento al estado de tu reparación en tiempo real. Solo necesitas tu DNI o el código que te entregamos.</p>
          <Link href="/rastreo" className="group relative inline-flex items-center justify-center border-2 border-blue-infositel/20 px-12 py-5 rounded-2xl font-black text-blue-infositel overflow-hidden transition-all hover:border-blue-infositel">
            <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">Rastrear Mi Equipo</span>
            <div className="absolute inset-0 bg-blue-infositel translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black z-20">Rastrear Mi Equipo</span>
          </Link>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[4rem] p-8 md:p-16 shadow-sm border border-gray-100">
            <div className="space-y-12">
              <RevealText text="Visítanos en Huancayo" className="text-5xl font-black" />
              <div className="grid gap-10">
                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-blue-50 rounded-[1.5rem] shrink-0"><MapPin className="text-blue-infositel" size={28} /></div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Dirección</h4>
                    <div className="text-gray-500 text-lg space-y-1">
                      <p>• Av. Giráldez 274, Semisótano Stand S25, Huancayo</p>
                      <p>• Av. Giráldez 274, 1er Nivel Stand B-10, Huancayo</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-green-50 rounded-[1.5rem] shrink-0"><Phone className="text-green-600" size={28} /></div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Teléfono / WhatsApp</h4>
                    <p className="text-gray-500 font-black text-xl">+51 964 648 202</p>
                  </div>
                </div>
                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-gray-50 rounded-[1.5rem] shrink-0"><Clock className="text-gray-600" size={28} /></div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Horario de Atención</h4>
                    <p className="text-gray-500 text-lg">Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <a href="https://www.google.com/maps/search/?api=1&query=Av.+Giraldez+274+Huancayo" target="_blank" rel="noreferrer" className="bg-blue-infositel text-white px-10 py-5 rounded-[1.5rem] font-black inline-block hover:scale-110 active:scale-95 transition-transform shadow-xl shadow-blue-500/20">Cómo llegar en Google Maps</a>
              </div>
            </div>
            <div className="min-h-[500px] rounded-[3rem] overflow-hidden border-[12px] border-gray-50 shadow-inner bg-gray-100 relative">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15606.884545237736!2d-75.2109!3d-12.0667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e96497f1f33f1%3A0xe7a5c7f8a3d13c7a!2sAv.%20Giraldez%20274%2C%20Huancayo%2012001!5e0!3m2!1ses!2spe!4v1712910000000!5m2!1ses!2spe" className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
