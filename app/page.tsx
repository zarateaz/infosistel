"use client";

import Hero from "@/components/Hero";
import Services from "@/components/Services";
import InstantCheckout from "@/components/InstantCheckout";
import OffersSection from "@/components/OffersSection";
import OfferToast from "@/components/OfferToast";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Phone, Zap, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

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

// ── 4 productos principales del showcase ──
const SHOWCASE_PRODUCTS: Product[] = [
  {
    id: "s1",
    name: "Cooler Gamer Pro",
    category: "Cooling",
    description: "Sistema de enfriamiento de alto rendimiento. Mantén tu equipo al máximo.",
    price: 250,
    stock: 10,
    image: "/img/cooler.png",
  },
  {
    id: "s2",
    name: "Gaming Mouse X7",
    category: "Periféricos",
    description: "Precisión extrema de 16000 DPI para gaming profesional y diseño.",
    price: 180,
    stock: 15,
    image: "/img/mouse.png",
  },
  {
    id: "s3",
    name: "GPU RTX Serie Pro",
    category: "Tarjeta Gráfica",
    description: "Gráficos de última generación con ray tracing y DLSS para máximo rendimiento.",
    price: 3400,
    stock: 3,
    image: "/img/tarjeta%20grafica.png",
  },
  {
    id: "s4",
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    description: "Respuesta táctica perfecta con iluminación RGB completa personalizable.",
    price: 320,
    stock: 8,
    image: "/img/teclado.png",
  },
];

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

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
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
           PRODUCT SHOWCASE — 4 accesorios con diseño premium
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-white overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#1433C9 1px, transparent 1px), linear-gradient(90deg, #1433C9 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Radial blue glow top-center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(20,51,201,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* ── Section Header ── */}
          <div className="text-center mb-20 space-y-5">
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

            <RevealText
              text="Explora Nuestra"
              className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.9] tracking-tighter text-black"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[clamp(3rem,9vw,8rem)] font-black leading-[0.85] tracking-tighter text-blue-infositel drop-shadow-[0_10px_30px_rgba(20,51,201,0.15)]"
            >
              Tecnología
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg font-medium max-w-md mx-auto leading-relaxed pt-2"
            >
              Hardware premium seleccionado para la excelencia. Disponible en Huancayo.
            </motion.p>
          </div>

          {/* ── Products Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHOWCASE_PRODUCTS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100/80 hover:border-blue-infositel/25 shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_80px_rgba(20,51,201,0.12)] transition-all duration-500 cursor-pointer flex flex-col"
                onClick={() => handleSelectProduct(product)}
              >
                {/* ── Image Zone ── */}
                <div className="relative h-60 bg-gradient-to-b from-blue-50/40 to-white overflow-hidden">
                  {/* Animated glow behind product */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <div className="w-36 h-36 rounded-full bg-blue-infositel/10 blur-3xl" />
                  </motion.div>

                  {/* Product image */}
                  <motion.div
                    className="relative w-full h-full"
                    whileHover={{ scale: 1.1, y: -10 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-8 drop-shadow-[0_15px_35px_rgba(20,51,201,0.12)] group-hover:drop-shadow-[0_25px_50px_rgba(20,51,201,0.28)] transition-all duration-500"
                    />
                  </motion.div>

                  {/* Category pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-infositel text-[9px] font-black px-3 py-1.5 rounded-full border border-blue-infositel/10 tracking-[0.25em] uppercase shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Stock badge */}
                  {product.stock <= 5 && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full tracking-[0.2em] uppercase">
                        ¡Últimas!
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Info Zone ── */}
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-black group-hover:text-blue-infositel transition-colors duration-300 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed mt-1.5 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <div>
                      <span className="text-2xl font-black text-blue-infositel">
                        S/. {product.price.toLocaleString()}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-11 h-11 rounded-2xl bg-blue-infositel flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow"
                    >
                      <ShoppingCart size={14} className="text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Bottom slide-in bar on hover */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-infositel via-blue-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))}
          </div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 mt-20 py-12 border-y border-gray-100"
          >
            {[
              { value: "500+", label: "Clientes Satisfechos", icon: Star },
              { value: "100%", label: "Hardware Garantizado", icon: Zap },
              { value: "5 años", label: "En el Mercado", icon: Clock },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="text-blue-infositel mx-auto mb-3 opacity-60" size={22} />
                <div className="text-3xl font-black text-black">{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTA Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              href="/tienda"
              className="group relative inline-flex items-center justify-center bg-blue-infositel text-white h-20 px-16 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all shadow-2xl shadow-blue-500/40 hover:scale-[1.04] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-4">
                Entrar al Universo
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── OFFERS SECTION ── */}
      <OffersSection onSelect={handleSelectProduct} />

      {/* ── REPAIR TRACKING SECTION ── */}
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

          <RevealText
            text="¿Dejaste tu equipo?"
            className="text-4xl md:text-5xl font-black text-black"
          />

          <p className="text-gray-400 text-lg font-medium">
            Haz seguimiento al estado de tu reparación en tiempo real. Solo necesitas tu DNI o el
            código que te entregamos.
          </p>

          <Link
            href="/rastreo"
            className="group relative inline-flex items-center justify-center border-2 border-blue-infositel/20 px-12 py-5 rounded-2xl font-black text-blue-infositel overflow-hidden transition-all hover:border-blue-infositel"
          >
            <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">
              Rastrear Mi Equipo
            </span>
            <div className="absolute inset-0 bg-blue-infositel translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black z-20">
              Rastrear Mi Equipo
            </span>
          </Link>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
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
                    <p className="text-gray-500 text-lg">
                      Av. Giráldez 274, Sótano Stand S25, Huancayo 12001
                    </p>
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
                  rel="noreferrer"
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
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
