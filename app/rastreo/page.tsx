"use client";

import { useState } from "react";
import { Search, Package, Clock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrackingStatus {
  id: string;
  dni: string;
  equipment: string;
  problem: string;
  progress: number;
  lastUpdate: string;
  statusText: string;
}

// Mock data - in a real app this would come from an API
const MOCK_TRACKING: TrackingStatus[] = [
  {
    id: "INF001",
    dni: "12345678",
    equipment: "Laptop Asus ROG",
    problem: "Limpieza y cambio de pasta térmica",
    progress: 85,
    lastUpdate: "12/04/2026 10:30 AM",
    statusText: "En fase final de pruebas",
  },
];

export default function TrackingPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TrackingStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/repairs?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json();
        setError(err.error || "No se encontró ningún equipo con ese DNI o código.");
      }
    } catch (e) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Tracking */}
      <div className="bg-blue-infositel py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-black">Rastreo de Equipo</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Consulta en tiempo real el progreso de tu reparación. Ingresa tu DNI o el código de servicio.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 pb-24">
        {/* Search Card */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ingresa DNI o Código (ej. INF001)"
                className="w-full pl-16 pr-6 py-6 bg-gray-50 border-none rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-infositel/10 focus:bg-white transition-all outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-black text-white px-10 py-6 rounded-2xl font-black text-xl hover:bg-blue-infositel transition-all disabled:bg-gray-400 flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20"
            >
              {isLoading ? "Buscando..." : "Rastrear"}
              {!isLoading && <ArrowRight size={24} />}
            </button>
          </div>
          {error && <p className="mt-6 text-red-500 font-bold text-center">{error}</p>}
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="bg-white border-2 border-blue-infositel rounded-[3rem] p-8 md:p-12 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="p-5 bg-blue-50 rounded-3xl">
                      <Package size={42} className="text-blue-infositel" />
                    </div>
                    <div>
                      <span className="text-blue-infositel font-black text-sm uppercase tracking-widest">Código: {result.id}</span>
                      <h2 className="text-3xl font-black">{result.equipment}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full font-black text-sm">
                      EN PROCESO
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter">Última actualización: {result.lastUpdate}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Estado de la Reparación</span>
                    <span className="text-4xl font-black text-blue-infositel">{result.progress}%</span>
                  </div>
                  <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-blue-infositel relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                    <UserCheck className="text-blue-infositel" size={24} />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Cliente (DNI)</h4>
                    <p className="text-lg font-black">{result.dni}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                    <ShieldCheck className="text-blue-infositel" size={24} />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Problema Reportado</h4>
                    <p className="text-lg font-black">{result.problem}</p>
                  </div>
                  <div className="p-6 bg-blue-infositel text-white rounded-3xl space-y-2 lg:col-span-1 shadow-xl shadow-blue-500/20">
                    <Clock size={24} />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-blue-100">Estado Actual</h4>
                    <p className="text-lg font-black">{result.statusText}</p>
                  </div>
                </div>
              </div>

              <div className="text-center p-8 bg-gray-50 rounded-[2.5rem]">
                <p className="text-gray-500 font-medium">¿Tienes dudas? Contáctanos directamente vía WhatsApp</p>
                <a
                  href="https://wa.me/51964648202"
                  className="mt-4 inline-flex items-center space-x-2 text-blue-infositel font-black hover:underline"
                >
                  <span>Consultar con un especialista</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
}
