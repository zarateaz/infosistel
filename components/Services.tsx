"use client";

import { Laptop, Cpu, Printer, Monitor, HardDrive, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    title: "Mantenimiento Preventivo",
    description: "Limpieza interna, cambio de pasta térmica de alta calidad y optimización de software.",
    icon: Cpu,
    delay: 0,
  },
  {
    title: "Reparación de Laptops",
    description: "Cambio de pantallas, reparación de bisagras, teclados y solución de cortos en placa.",
    icon: Laptop,
    delay: 0.07,
  },
  {
    title: "Servicio de Impresoras",
    description: "Reset de almohadillas, limpieza de cabezales y reparación mecánica general.",
    icon: Printer,
    delay: 0.14,
  },
  {
    title: "Venta de Repuestos",
    description: "Cargadores originales, baterías, pantallas y periféricos de las mejores marcas.",
    icon: Monitor,
    delay: 0.21,
  },
  {
    title: "Repotenciación SSD/RAM",
    description: "Damos nueva vida a tu equipo antiguo con discos de estado sólido y más memoria.",
    icon: HardDrive,
    delay: 0.28,
  },
  {
    title: "Soporte Corporativo",
    description: "Contratos de mantenimiento para empresas y colegios con atención prioritaria.",
    icon: ShieldCheck,
    delay: 0.35,
  },
];

export default function Services() {
  return (
    <section id="servicios" className="relative py-32 bg-white overflow-hidden">
      {/* Subtle dynamic background grid */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(#1433C9 1px, transparent 1px), linear-gradient(90deg, #1433C9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ── HEADER HUD ── */}
        <div className="relative mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 text-blue-infositel font-black text-xs tracking-[0.4em] uppercase"
          >
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-blue-infositel/20" />
              ))}
            </div>
            Core Services
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-tighter text-black"
            >
              Soluciones de <br />
              <span className="text-blue-infositel">Alta Ingeniería</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-xl font-medium max-w-sm leading-relaxed"
            >
              Hardware y software de última generación. Optimización experta para la excelencia operativa.
            </motion.p>
          </div>
        </div>

        {/* ── HUD CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white border border-gray-100 rounded-[3rem] p-10 hover:border-blue-infositel/30 transition-all duration-500 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.02)]"
              >
                {/* HUD Corner Accents */}
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-blue-infositel/5 group-hover:border-blue-infositel transition-colors" />
                <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-blue-infositel/5 group-hover:border-blue-infositel transition-colors" />

                {/* Scanline Animation */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-infositel/[0.03] to-transparent h-20 w-full pointer-events-none"
                  animate={{ y: ['-100%', '300%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="p-6 bg-blue-infositel/5 rounded-[1.5rem] group-hover:bg-blue-infositel group-hover:scale-110 transition-all duration-500">
                      <Icon size={32} className="text-blue-infositel group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-black group-hover:text-blue-infositel transition-colors leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Tech Coordinates Footer */}
                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[9px] font-mono text-blue-infositel uppercase tracking-tighter">
                      Protocol: ACTIVE // SECURED
                    </div>
                    <div className="w-8 h-px bg-blue-infositel/30" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
