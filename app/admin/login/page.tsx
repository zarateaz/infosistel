"use client";

import { useState } from "react";
import { Lock, User as UserIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PageBg from "@/components/PageBg";

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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <PageBg />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(20,51,201,0.15)] border border-white"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-infositel/20 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-infositel rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-blue-500/25 rotate-12">
            <Lock className="text-white -rotate-12" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">INFOSISTEL</h1>
          <p className="text-sm font-bold text-blue-infositel uppercase tracking-[0.2em]">Secure Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Usuario</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel/20 transition-all font-medium text-gray-800"
                placeholder="developer"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel/20 transition-all font-medium text-gray-800"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-bold text-center">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-blue-infositel text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <span>Autenticar</span>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
