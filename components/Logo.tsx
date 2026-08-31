"use client";

import Image from "next/image";

type LogoProps = {
  width?: number;
  showTagline?: boolean;
  dark?: boolean;
  className?: string;
};

// The real INFOSISTEL wordmark (client-supplied artwork, background removed)
// — see public/brand/infosistel-logo.png. No more hand-built text/SVG stand-in.
export default function Logo({ width = 180, showTagline = false, dark = false, className = "" }: LogoProps) {
  const height = Math.round(width * (229 / 1912));
  return (
    <div className={`flex flex-col ${className}`}>
      <Image
        src="/brand/infosistel-logo.png"
        alt="Infosistel"
        width={1912}
        height={229}
        style={{ width, height }}
        className="object-contain"
        priority
      />
      {showTagline && (
        <span className={`text-[9px] font-bold uppercase tracking-[0.25em] mt-1.5 ${dark ? "text-white/35" : "text-gray-400"}`}>
          Informática · Sistemas · Telecomunicaciones
        </span>
      )}
    </div>
  );
}
