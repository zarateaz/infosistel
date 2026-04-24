/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for PM2 / Docker deployment
  output: "standalone",

  // ── Image optimization ──
  images: {
    // unoptimized: nginx sirve las imágenes directamente (/_next/image no funciona
    // en standalone cuando las imágenes están en /uploads/ via alias de nginx)
    unoptimized: true,
    // Formatos preferidos (informativo, se respeta si el browser los soporta)
    formats: ["image/webp", "image/avif"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },

  // ── HTTP Security Headers ──
  async headers() {
    // Solo aplicar cabeceras de seguridad estrictas en producción para no romper el modo dev (HMR)
    if (process.env.NODE_ENV !== "production") return [];

    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Legacy XSS filter (still useful for older browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser APIs
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS — solo habilitar después de instalar SSL con Certbot
          // { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              // Only load scripts from same origin + WhatsApp
              "default-src 'self'",
              // Next.js requires 'unsafe-inline' for styled components/Framer Motion
              // 'unsafe-eval' only needed in dev — Next.js 13+ production doesn't need it
              "script-src 'self' 'unsafe-inline'",
              // Styles: self + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: self + blob (for image previews) + Google Maps tiles
              "img-src 'self' blob: data: https://maps.gstatic.com https://maps.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              // API connections only to self
              "connect-src 'self'",
              // Allow Google Maps iframes + WhatsApp
              "frame-src 'self' https://www.google.com https://maps.google.com",
              // Workers for Next.js internals
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },

      // ── Cache API routes — never cache (always fresh) ──
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },

      // ── Cache static assets aggressively ──
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ── Cache public images (30 days) ──
      {
        source: "/img/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/uploads/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },

  // ── Webpack optimizations ──
  compiler: {
    // Remove console.log in production (keep errors)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  experimental: {
    allowedDevOrigins: ["127.0.0.1", "localhost"],
  },
};

module.exports = nextConfig;
