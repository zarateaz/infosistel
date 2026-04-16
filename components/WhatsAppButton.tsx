"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/51964648202"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-6 left-6 z-50 group"
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500"
        animate={{ scale: [1, 1.6, 1.6], opacity: [0.4, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      {/* Second pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500"
        animate={{ scale: [1, 1.4, 1.4], opacity: [0.3, 0, 0] }}
        transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeOut" }}
      />
      {/* Button */}
      <div className="relative w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:shadow-2xl group-hover:shadow-green-500/40 group-hover:scale-110 transition-all duration-300">
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
      </div>
      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none hidden sm:block">
        Escríbenos al WhatsApp 💬
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white rotate-45" />
      </div>
    </motion.a>
  );
}
