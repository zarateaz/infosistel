import type { Metadata } from "next";
import { Inter, Outfit, Baloo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
// Mobile-perf fix: the chat widget pulls in @ai-sdk/react + its full UI on
// EVERY route (including /admin) even though most visits never open it.
// ChatBotLazy wraps the dynamic(..., { ssr:false }) import in a Client
// Component, since layout.tsx itself is a Server Component and can't use
// ssr:false directly.
import ChatBot from "@/components/ui/ChatBotLazy";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
// Chunky, rounded weight matching the real storefront sign's lettering —
// used only for the INFOSISTEL wordmark in Logo.tsx, not body/heading text.
const baloo = Baloo_2({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-baloo" });

export const metadata: Metadata = {
  title: "INFOSISTEL | Reparación de Laptops, PC e Impresoras en Huancayo",
  description: "Servicio técnico especializado en Huancayo. Reparación de laptops, mantenimiento de computadoras, impresoras y venta de repuestos. ¡Calidad y rapidez garantizada!",
  keywords: "reparación de laptops huancayo, servicio técnico pc, mantenimiento impresoras, infosistel, repotenciación computadoras",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4" },
      { url: "/favicon.png?v=4" },
    ],
    apple: "/favicon.png?v=4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} ${baloo.variable} font-inter antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-[72px]">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <ChatBot />
      </body>
    </html>
  );
}
