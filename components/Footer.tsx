"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, MessageCircle, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
    <footer className="relative bg-white overflow-hidden">
      {/* Separator gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-infositel/20 to-transparent" />
      
      {/* CTA Banner */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(20,51,201,0.04) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-[10px] font-black text-blue-infositel tracking-[0.3em] uppercase">¿Necesitas ayuda?</p>
            <h3 className="text-3xl md:text-5xl font-black text-black tracking-tight">
              Estamos a un <span className="text-blue-infositel">mensaje</span> de distancia
            </h3>
          </motion.div>
          <motion.a
            href="https://wa.me/51964648202"
            target="_blank"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group inline-flex items-center gap-3 bg-blue-infositel text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
          >
            <MessageCircle size={18} />
            <span>Chatear por WhatsApp</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </div>

      {/* Main footer content */}
      <div className="border-t border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand column */}
            <div className="space-y-6 lg:col-span-1">
              <Link href="/" className="flex items-center gap-1 group">
                <div className="relative w-8 h-8 mr-1 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-infositel rounded-lg rotate-45" />
                  <Zap size={12} className="relative z-10 text-white fill-white" />
                </div>
                <span className="text-xl font-black text-black tracking-tighter">INFO</span>
                <span className="text-xl font-black text-blue-infositel tracking-tighter">SISTEL</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Expertos en reparación de laptops, PC e impresoras. Soluciones rápidas y garantizadas en Huancayo.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/share/1CAYDHW7va/", colorClass: "text-[#1877F2]", hoverClass: "hover:bg-[#1877F2] hover:text-white" },
                  { Icon: TikTokIcon, href: "https://www.tiktok.com/@infosistel6?_r=1&_t=ZS-95cScAQ9Obd", colorClass: "text-black", hoverClass: "hover:bg-black hover:text-white" },
                  { Icon: MessageCircle, href: "https://wa.me/51964648202", colorClass: "text-[#25D366]", hoverClass: "hover:bg-[#25D366] hover:text-white" },
                ].map(({ Icon, href, colorClass, hoverClass }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-all duration-300 ${colorClass} ${hoverClass}`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Navegación</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-blue-infositel transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-blue-infositel group-hover:w-2 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Servicios</h4>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s}>
                    <Link
                      href="/#servicios"
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-blue-infositel transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-blue-infositel group-hover:w-2 transition-all duration-300" />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-infositel/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="text-blue-infositel" size={14} />
                  </div>
                  <span className="text-sm text-gray-400 leading-relaxed">Av. Giráldez 274, Semisótano Stand S25, Huancayo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-infositel/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="text-blue-infositel" size={14} />
                  </div>
                  <span className="text-sm text-gray-400 leading-relaxed">Av. Giráldez 274, 1er Nivel Stand B-10, Huancayo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-infositel/5 flex items-center justify-center shrink-0">
                    <Phone className="text-blue-infositel" size={14} />
                  </div>
                  <span className="text-sm font-bold text-gray-600">+51 964 648 202</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-infositel/5 flex items-center justify-center shrink-0">
                    <Mail className="text-blue-infositel" size={14} />
                  </div>
                  <span className="text-sm text-gray-400">contacto@infositel.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-300 font-medium">
            © 2026 INFOSISTEL. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-300 font-medium">
            <a href="#" className="hover:text-blue-infositel transition-colors">Términos</a>
            <a href="#" className="hover:text-blue-infositel transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
