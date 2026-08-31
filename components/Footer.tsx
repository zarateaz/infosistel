"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

const TikTokIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const footerLinks = [
  { name: "Inicio", href: "/" },
  { name: "Tienda Online", href: "/tienda" },
  { name: "Rastreo de Equipo", href: "/rastreo" },
  { name: "Nuestros Servicios", href: "#servicios" },
];

const services = [
  "Reparación de Laptops",
  "Mantenimiento de PC",
  "Reparación de Impresoras",
  "Repotenciación SSD/RAM",
];

export default function Footer() {
  return (
    <footer className="relative bg-aurora overflow-hidden">
      {/* Separator gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* CTA Banner */}
      <div className="relative py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-[10px] font-black text-cyan-300 tracking-[0.3em] uppercase">¿Necesitas ayuda?</p>
            <h3 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              Estamos a un <span className="text-gradient-brand">mensaje</span> de distancia
            </h3>
          </motion.div>
          <motion.a
            href="https://wa.me/51964648202"
            target="_blank"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group inline-flex items-center gap-3 bg-gradient-brand text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-glow-brand hover:-translate-y-1 transition-all duration-300"
          >
            <MessageCircle size={18} />
            <span>Chatear por WhatsApp</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </div>

      {/* Main footer content */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand column */}
            <div className="space-y-6 lg:col-span-1">
              <Link href="/" className="inline-flex group">
                <Logo width={160} showTagline dark />
              </Link>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Expertos en reparación de laptops, PC e impresoras. Soluciones rápidas y garantizadas en Huancayo.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/share/1CAYDHW7va/", hoverClass: "hover:bg-[#1877F2]" },
                  { Icon: TikTokIcon, href: "https://www.tiktok.com/@infosistel6?_r=1&_t=ZS-95cScAQ9Obd", hoverClass: "hover:bg-white hover:text-black" },
                  { Icon: MessageCircle, href: "https://wa.me/51964648202", hoverClass: "hover:bg-[#25D366]" },
                ].map(({ Icon, href, hoverClass }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-white/8 text-white/70 flex items-center justify-center transition-all duration-300 hover:text-white ${hoverClass}`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-6">Navegación</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-cyan-300 group-hover:w-2 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-6">Servicios</h4>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s}>
                    <Link
                      href="/#servicios"
                      className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-cyan-300 group-hover:w-2 transition-all duration-300" />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-6">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="text-cyan-300" size={14} />
                  </div>
                  <span className="text-sm text-white/40 leading-relaxed">Av. Giráldez 274, Semisótano Stand S25, Huancayo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="text-cyan-300" size={14} />
                  </div>
                  <span className="text-sm text-white/40 leading-relaxed">Av. Giráldez 274, 1er Nivel Stand B-10, Huancayo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                    <Phone className="text-cyan-300" size={14} />
                  </div>
                  <span className="text-sm font-bold text-white/70">+51 964 648 202</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                    <Mail className="text-cyan-300" size={14} />
                  </div>
                  <span className="text-sm text-white/40">ecaballero@hotmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-medium">
            © 2026 INFOSISTEL. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30 font-medium">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
