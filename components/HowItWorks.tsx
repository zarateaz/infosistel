"use client";

import { motion } from "framer-motion";
import { MousePointerClick, MessageCircle, PackageCheck } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Elige tu producto",
    description: "Míralo en la tienda online o dinos qué necesitas directo por WhatsApp.",
  },
  {
    icon: MessageCircle,
    title: "Confirmamos al toque",
    description: "Te decimos precio y stock real de una vez — sin sorpresas ni letra chica.",
  },
  {
    icon: PackageCheck,
    title: "Recíbelo o recógelo",
    description: "Pasas por nuestra tienda en Huancayo o coordinamos el envío contigo.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-gray-400">
            <span className="w-4 h-px bg-gradient-brand" />
            Cómo funciona
            <span className="w-4 h-px bg-gradient-brand" />
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-black tracking-tight text-gray-900 leading-[1.02] mt-4">
            Comprar nunca fue <span className="text-gradient-brand">tan fácil</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting line behind the step nodes (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-blue-infositel via-violet-infositel to-cyan-infositel opacity-25" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="relative text-center flex flex-col items-center"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand mb-6">
                <step.icon size={26} className="text-white" strokeWidth={1.75} />
                <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-black flex items-center justify-center border-4 border-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900">{step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed mt-2 max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
