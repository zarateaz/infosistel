"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  onSale?: boolean;
  salePrice?: number;
}

export default function InstantCheckout({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({ name: "", phone: "" });

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Por favor completa tus datos.");
      return;
    }

    const orderData = {
      customerName: formData.name,
      customerPhone: formData.phone,
      items: [{ name: product.name, quantity: 1, category: product.category }],
      total: product.salePrice ?? product.price,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        // WhatsApp redirection follows
        const message = `¡Hola INFOSISTEL! Me interesa esta oferta:\n\n*Producto:* ${product.name}\n*Precio Especial:* S/. ${product.salePrice}\n\n*Cliente:* ${formData.name}\n*WhatsApp:* ${formData.phone}\n\n¿Sigue disponible?`;
        
        window.open(
          `https://wa.me/51964648202?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        onClose();
      } else {
        alert("Hubo un problema al registrar tu pedido en la base de datos. Por favor intenta de nuevo.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor. Por favor intenta de nuevo.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[110] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-infositel">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Tu Selección</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Oferta Exclusiva
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <div className="flex items-center gap-8 bg-blue-50/30 p-8 rounded-[2.5rem] border border-blue-100/50">
                <div className="relative h-32 w-32 shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">{product.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-blue-infositel">
                      S/. {product.salePrice}
                    </span>
                    <span className="text-lg text-gray-300 line-through font-bold">
                      S/. {product.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h4 className="text-xl font-black">Datos del Comprador</h4>
                  <p className="text-gray-400 font-medium">
                    Completa tus datos para agendar tu pedido.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-2 text-gray-700">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-infositel focus:outline-none transition-all font-medium"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-2 text-gray-700">
                        Número de WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 964648202"
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-infositel focus:outline-none transition-all font-medium"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full group/btn relative bg-blue-infositel text-white h-20 rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-4 overflow-hidden transition-all hover:scale-[1.02] shadow-2xl shadow-blue-500/40"
                  >
                    <div className="absolute inset-0 bg-blue-700 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
                    <MessageCircle className="relative z-10 group-hover/btn:scale-110 transition-transform" />
                    <span className="relative z-10">Solicitar por WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="p-8 bg-gray-50 text-center">
              <p className="text-xs text-gray-400 font-bold">
                * Tu pedido se procesará de inmediato a través de WhatsApp.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
