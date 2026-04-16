"use client";
import { motion } from "framer-motion";

/* ── Plasma Ring ── */
export function PlasmaRing({ size, duration, dir, dash, opacity, idPrefix = "prg" }: {
  size: number; duration: number; dir: 1 | -1; dash: number; opacity: number; idPrefix?: string;
}) {
  return (
    <motion.div
      style={{ width: size, height: size, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
      animate={{ rotate: dir * 360 }}
      whileInView={{ rotate: dir * 360 }}
      viewport={{ once: false }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className="absolute pointer-events-none will-change-transform"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <defs>
          <linearGradient id={`${idPrefix}${size}`} x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
            <stop stopColor="#1433C9" stopOpacity="0" />
            <stop offset="0.35" stopColor="#1433C9" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="0.65" stopColor="#1433C9" stopOpacity="0.7" />
            <stop offset="1" stopColor="#1433C9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 2}
          stroke={`url(#${idPrefix}${size})`}
          strokeWidth="1.5"
          strokeDasharray={`${dash} ${dash * 2}`}
          opacity={opacity}
        />
      </svg>
    </motion.div>
  );
}

/* ── Energy Beam ── */
export function EnergyBeam({ angle, delay }: { angle: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: "50%", top: "50%", width: 1400, height: 1.5,
        background: "linear-gradient(90deg,transparent 0%,rgba(20,51,201,.45) 35%,rgba(100,160,255,.9) 50%,rgba(20,51,201,.45) 65%,transparent 100%)",
        rotate: angle, x: "-50%", y: "-50%",
      }}
      whileInView={{ scaleX: [0, 1.2, 0], opacity: [0, 1, 0] }}
      viewport={{ once: false }}
      transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 5, ease: [0.2, 0, 0.8, 1] }}
      className="absolute pointer-events-none will-change-transform"
    />
  );
}

/* ── Orbit Dot ── */
export function OrbitDot({ angle, radius, dur, delay, sz }: {
  angle: number; radius: number; dur: number; delay: number; sz: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: "50%", top: "50%", x: "-50%", y: "-50%" }}
      whileInView={{ rotate: [angle, angle + 360] }}
      viewport={{ once: false }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
      className="absolute pointer-events-none will-change-transform"
    >
      <motion.div
        style={{ x: radius, width: sz, height: sz }}
        animate={{ scale: [0.5, 2, 0.5], opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: dur * 0.35, delay, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full bg-blue-infositel"
      />
    </motion.div>
  );
}

/* ── Lightning ── */
export function LightningArc({ x1, y1, x2, y2, delay }: {
  x1: number; y1: number; x2: number; y2: number; delay: number;
}) {
  const mx = (x1 + x2) / 2 + 60;
  const my = (y1 + y2) / 2 - 60;
  return (
    <motion.path
      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
      stroke="rgba(100,140,255,0.4)"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: [0, 1, 0], opacity: [0, 0.9, 0] }}
      viewport={{ once: false }}
      transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: 6 + delay, ease: "easeOut" }}
    />
  );
}

/**
 * PageBg — ambient energy background for any page.
 * Add as first child of a `relative overflow-hidden` container.
 */
export default function PageBg({ intensity = 1 }: { intensity?: number }) {
  const op = (base: number) => base * intensity;
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Blueprint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(20,51,201,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,51,201,.03) 1px,transparent 1px)",
          backgroundSize: "65px 65px",
        }}
      />

      {/* Ambient radial glow */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 60% 40%, rgba(20,51,201,0.06) 0%, transparent 70%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Plasma rings — centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PlasmaRing size={900} duration={26} dir={1}  dash={50} opacity={op(0.25)} />
        <PlasmaRing size={650} duration={18} dir={-1} dash={30} opacity={op(0.38)} />
        <PlasmaRing size={420} duration={13} dir={1}  dash={18} opacity={op(0.48)} />
      </div>

      {/* Diagonal energy beams */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 30, 60, 90, 120, 150].map((angle, i) => (
          <EnergyBeam key={angle} angle={angle} delay={i * 0.4} />
        ))}
      </div>

      {/* Orbit dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitDot angle={0}   radius={280} dur={14} delay={0}   sz={6} />
        <OrbitDot angle={72}  radius={260} dur={11} delay={1}   sz={4} />
        <OrbitDot angle={144} radius={295} dur={17} delay={0.5} sz={5} />
        <OrbitDot angle={216} radius={275} dur={13} delay={2}   sz={4} />
        <OrbitDot angle={288} radius={285} dur={15} delay={1.5} sz={6} />
      </div>

      {/* SVG Lightning */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <LightningArc x1={100} y1={80}  x2={500} y2={250} delay={1.2} />
        <LightningArc x1={800} y1={100} x2={400} y2={450} delay={3.4} />
        <LightningArc x1={250} y1={500} x2={650} y2={180} delay={5.1} />
        <LightningArc x1={50}  y1={400} x2={900} y2={320} delay={2.7} />
        <LightningArc x1={600} y1={600} x2={200} y2={300} delay={4.3} />
      </svg>

      {/* Corner HUD brackets */}
      {[
        "top-5 left-5 border-t-2 border-l-2",
        "top-5 right-5 border-t-2 border-r-2",
        "bottom-5 left-5 border-b-2 border-l-2",
        "bottom-5 right-5 border-b-2 border-r-2",
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-12 h-12 ${cls} border-blue-infositel/30 pointer-events-none`}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 3.5, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
