"use client";

import { motion } from "framer-motion";
import React from "react";

interface ImageFrameProps {
  children: React.ReactNode;
  className?: string;
  badgeText?: string;
}

export default function ImageFrame({ children, className = "", badgeText }: ImageFrameProps) {

  return (
    <div className={`relative group ${className}`}>
      {/* ── Outer Professional Borders ── */}
      <div className="absolute -inset-[0.5px] border border-gray-100 rounded-[inherit] pointer-events-none z-10 group-hover:border-blue-infositel/30 transition-colors duration-500" />

      {/* ── Watermark Mask (Top Left Badge) ── */}
      {badgeText && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className="flex items-center gap-2 bg-blue-infositel/90 backdrop-blur-md px-3 py-1 rounded-md border border-white/20 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] font-black text-white tracking-[0.2em] uppercase">
              {badgeText}
            </span>
          </div>
        </div>
      )}

      {/* ── Scanline Effect (Only on Hover) ── */}
      <motion.div 
        initial={{ top: "-100%" }}
        whileHover={{ top: "100%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-blue-400/20 z-20 pointer-events-none blur-[1px]"
      />

      {/* ── Image Container ── */}
      <div className="relative overflow-hidden rounded-[inherit] w-full h-full bg-white flex items-center justify-center">
        {children}
        
        {/* Subtle inner blue vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-infositel/5 via-transparent to-blue-infositel/5 pointer-events-none" />
      </div>
    </div>
  );
}
