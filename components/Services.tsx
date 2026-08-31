"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    title: "Mantenimiento Preventivo",
    description: "Limpieza interna, cambio de pasta térmica de alta calidad y optimización de software.",
    image: "/img/servicios/mantenimiento-preventivo.jpg",
    from: "#1433C9",
    to: "#06B6D4",
  },
  {
    title: "Reparación de Laptops",
    description: "Cambio de pantallas, reparación de bisagras, teclados y solución de cortos en placa.",
    image: "/img/servicios/reparacion-laptops.jpg",
    from: "#7C3AED",
    to: "#1433C9",
  },
  {
    title: "Servicio de Impresoras",
    description: "Reset de almohadillas, limpieza de cabezales y reparación mecánica general.",
    image: "/img/servicios/servicio-impresoras.jpg",
    from: "#06B6D4",
    to: "#7C3AED",
  },
  {
    title: "Venta de Repuestos",
    description: "Cargadores originales, baterías, pantallas y periféricos de las mejores marcas.",
    image: "/img/servicios/venta-repuestos.jpg",
    from: "#1433C9",
    to: "#7C3AED",
  },
  {
    title: "Repotenciación SSD/RAM",
    description: "Damos nueva vida a tu equipo antiguo con discos de estado sólido y más memoria.",
    image: "/img/servicios/repotenciacion-ssd-ram.jpg",
    from: "#7C3AED",
    to: "#06B6D4",
  },
  {
    title: "Soporte Corporativo",
    description: "Contratos de mantenimiento para empresas y colegios con atención prioritaria.",
    image: "/img/servicios/soporte-corporativo.jpg",
    from: "#06B6D4",
    to: "#1433C9",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="relative py-28 bg-white overflow-hidden">
      {/* Faint circuit-grid backdrop, consistent with the other product sections */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1433C9 1px, transparent 1px), linear-gradient(90deg, #1433C9 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-16 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-gray-400">
            <span className="w-4 h-px bg-gradient-brand" />
            Servicios
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-black tracking-tight text-gray-900 leading-[1.02] mt-4">
            Soluciones de <span className="text-gradient-brand">alta ingeniería</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                style={{ ["--c-from" as string]: service.from, ["--c-to" as string]: service.to }}
                className="service-card group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden"
              >
                <div className="relative w-full aspect-[5/4] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-8 pt-6 space-y-2">
                  <span className="font-mono text-[11px] text-gray-300 block">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">{service.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
