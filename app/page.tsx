"use client";

import Hero from "@/components/Hero";
import Services from "@/components/Services";
import InstantCheckout from "@/components/InstantCheckout";
import OffersSection from "@/components/OffersSection";
import OfferToast from "@/components/OfferToast";
import StoreCTA from "@/components/StoreCTA";
import HowItWorks from "@/components/HowItWorks";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Phone, MapPin, Mail } from "lucide-react";
import { useState } from "react";

import { Product } from "@/types";


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

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Hero />

      <StoreCTA />

      <InstantCheckout
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <OfferToast onSelect={handleSelectProduct} />

      <HowItWorks />

      <Services />

      <OffersSection onSelect={handleSelectProduct} />

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block p-6 bg-gradient-brand-soft rounded-[2rem] mb-4"
          >
            <Clock className="text-violet-infositel" size={48} />
          </motion.div>
          <RevealText text="¿Dejaste tu equipo?" className="font-display text-4xl md:text-5xl font-black text-black" />
          <p className="text-gray-400 text-lg font-medium">Haz seguimiento al estado de tu reparación en tiempo real. Solo necesitas tu DNI o el código que te entregamos.</p>
          <Link href="/rastreo" className="group relative inline-flex items-center justify-center border-2 border-violet-infositel/20 px-12 py-5 rounded-2xl font-black text-blue-infositel overflow-hidden transition-all hover:border-transparent">
            <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">Rastrear Mi Equipo</span>
            <div className="absolute inset-0 bg-gradient-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-black z-20">Rastrear Mi Equipo</span>
          </Link>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[4rem] p-8 md:p-16 shadow-sm border border-gray-100">
            <div className="space-y-12">
              <RevealText text="Visítanos en Huancayo" className="font-display text-5xl font-black" />
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
                  <div className="p-5 bg-blue-50 rounded-[1.5rem] shrink-0"><Mail className="text-blue-infositel" size={28} /></div>
                  <div>
                    <h4 className="font-black text-xl mb-1">Correo Electrónico</h4>
                    <p className="text-gray-500 font-bold text-lg">ecaballero@hotmail.com</p>
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
                <a href="https://www.google.com/maps/search/?api=1&query=Av.+Giraldez+274+Huancayo" target="_blank" rel="noreferrer" className="bg-gradient-brand text-white px-10 py-5 rounded-[1.5rem] font-black inline-block hover:scale-110 active:scale-95 transition-transform shadow-glow-brand">Cómo llegar en Google Maps</a>
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
