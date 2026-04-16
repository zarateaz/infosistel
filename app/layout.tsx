import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "INFOSISTEL | Reparación de Laptops, PC e Impresoras en Huancayo",
  description: "Servicio técnico especializado en Huancayo. Reparación de laptops, mantenimiento de computadoras, impresoras y venta de repuestos. ¡Calidad y rapidez garantizada!",
  keywords: "reparación de laptops huancayo, servicio técnico pc, mantenimiento impresoras, infosistel, repotenciación computadoras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-[72px]">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
