"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, User, Facebook, Instagram, MessageCircle, Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TikTokIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Tienda Online", href: "/tienda" },
    { name: "Rastreo", href: "/rastreo" },
    { name: "Ubicación", href: "#contacto" },
  ];

  const socialLinks = [
    { icon: <Facebook size={16} />, href: "https://www.facebook.com/share/1CAYDHW7va/", label: "Facebook" },
    { icon: <Instagram size={16} />, href: "https://instagram.com", label: "Instagram" },
    { icon: <TikTokIcon size={16} />, href: "https://www.tiktok.com/@infosistel6?_r=1&_t=ZS-95cScAQ9Obd", label: "TikTok" },
    { icon: <MessageCircle size={16} />, href: "https://wa.me/51964648202", label: "WhatsApp" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-2xl py-2 shadow-[0_8px_40px_rgba(20,51,201,0.06)]" 
          : "bg-white/50 backdrop-blur-sm py-4"
      }`}
    >
      {/* Subtle bottom line that appears on scroll */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(20,51,201,0.15), transparent)" }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
      />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1"
          >
            {/* Logo mark */}
            <motion.div 
              className="relative w-9 h-9 mr-2 hidden sm:flex items-center justify-center"
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-blue-infositel rounded-xl rotate-45 group-hover:rounded-2xl transition-all duration-300" />
              <Zap size={14} className="relative z-10 text-white fill-white" />
            </motion.div>
            <span className="text-2xl md:text-3xl font-black text-black tracking-tighter">INFO</span>
            <span className="text-2xl md:text-3xl font-black text-blue-infositel tracking-tighter group-hover:text-blue-600 transition-colors">SISTEL</span>
          </motion.div>
        </Link>

        {/* Desktop Links — clean, minimal */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-4 py-2 text-sm font-semibold text-gray-500 hover:text-blue-infositel transition-colors group/link"
            >
              {link.name}
              <motion.span 
                className="absolute bottom-0 left-1/2 h-[2px] bg-blue-infositel rounded-full"
                initial={{ width: 0, x: "-50%" }}
                whileHover={{ width: "60%", x: "-50%" }}
                transition={{ duration: 0.25 }}
              />
            </Link>
          ))}
        </div>

        {/* Action bar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Social — compact pills */}
          <div className="flex items-center gap-1 mr-2">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-gray-400 hover:text-blue-infositel hover:bg-blue-infositel/5 transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Cart */}
          <Link href="/tienda" className="relative p-2 rounded-xl text-gray-400 hover:text-blue-infositel hover:bg-blue-infositel/5 transition-all">
            <ShoppingCart size={20} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu — full-screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-1"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 px-4 text-lg font-black text-gray-800 hover:text-blue-infositel hover:bg-blue-infositel/5 rounded-2xl transition-all"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <div className="flex items-center gap-4 py-4 px-4 mt-2 border-t border-gray-100">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.href} className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:text-blue-infositel transition-colors">
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
