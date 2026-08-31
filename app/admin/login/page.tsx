"use client";

import { useState } from "react";
import { Lock, User as UserIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error de credenciales");
        setIsLoggingIn(false);
        return;
      }

      router.push("/admin");
    } catch (err) {
      setError("Error de red");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-aurora animate-aurora overflow-hidden">
      {/* Grid + ambient glows — same language as the public Hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] rounded-full bg-violet-500/15 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 w-full max-w-md bg-white/[0.04] backdrop-blur-2xl p-9 sm:p-11 rounded-[2rem] border border-white/10 shadow-[0_40px_100px_rgba(20,51,201,0.25)]"
      >
        <div className="text-center mb-9">
          <div className="flex justify-center mb-5">
            <Logo width={200} dark />
          </div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.25em] mt-2">Panel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Usuario</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={17} />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-infositel/40 focus:border-transparent transition-all font-medium text-white placeholder:text-white/20"
                placeholder="usuario"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={17} />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-infositel/40 focus:border-transparent transition-all font-medium text-white placeholder:text-white/20"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm font-bold text-center bg-red-500/10 rounded-xl py-2.5"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-glow-brand hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <span>Ingresar</span>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
