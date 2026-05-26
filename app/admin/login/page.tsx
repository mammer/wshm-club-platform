"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, Shield, ChevronRight } from "lucide-react";

const STAGES = [
  "Vérification des identifiants…",
  "Authentification en cours…",
  "Chargement du tableau de bord…",
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [shake, setShake] = useState(false);
  const [yearCount, setYearCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setYearCount((c) => (c < 70 ? c + 1 : 70)), 18);
    return () => clearInterval(timer);
  }, []);

  function animate(from: number, to: number, ms: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = 20;
      const step = (to - from) / steps;
      const interval = ms / steps;
      let current = from;
      const timer = setInterval(() => {
        current += step;
        setProgress(Math.min(current, to));
        if (current >= to) { clearInterval(timer); resolve(); }
      }, interval);
    });
  }

  const runProgress = async () => {
    setProgress(0); setStage(0);
    await animate(0, 40, 500); setStage(1);
    await animate(40, 80, 700); setStage(2);
    await animate(80, 100, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    const [, result] = await Promise.all([
      runProgress(),
      signIn("credentials", { email: username, password, redirect: false }),
    ]);
    if (result?.error) {
      setProgress(0); setShake(true);
      setTimeout(() => setShake(false), 600);
      setError("Identifiant ou mot de passe incorrect.");
      setLoading(false);
    } else {
      setTimeout(() => router.push("/admin/dashboard"), 300);
    }
  };

  const ACCOUNTS = [
    { role: "Admin",       id: "admin",      pass: "admin",      color: "text-[#CC0000]" },
    { role: "Secrétaire",  id: "secretaire", pass: "secret123",  color: "text-blue-600" },
    { role: "Auteur",      id: "auteur",     pass: "blog123",    color: "text-green-600" },
    { role: "Entraîneur",  id: "coach",      pass: "coach123",   color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] bg-[#1a1a1a] flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#CC0000 0,#CC0000 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CC0000]/8 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C8A84B]/8 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative flex flex-col items-center justify-center flex-1 px-14 py-16 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#CC0000]/25 rounded-full blur-3xl scale-[2]" />
            <Image src="/logo.png" alt="W.S.H.M" width={130} height={130}
              className="relative rounded-full border-4 border-white/10 shadow-2xl" />
          </div>

          <span className="text-[#C8A84B] font-bold text-[10px] tracking-[5px] uppercase mb-3">
            Fondé en 1956 · Madagh, Maroc
          </span>
          <h1 className="text-white font-black text-5xl mb-1">W.S.H.M</h1>
          <p className="text-white/60 text-base font-medium mb-1">Wefak Sportive Hassanyat Madagh</p>
          <p className="text-white/30 text-sm mb-10" dir="rtl" style={{ fontFamily: "Cairo, sans-serif" }}>
            الوفاق الرياضي الحسني لمداغ
          </p>

          <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] mb-12">
            {[
              { v: "35",              l: "Joueurs actifs" },
              { v: "4",               l: "Catégories" },
              { v: yearCount + " ans", l: "D'histoire" },
            ].map((s) => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl py-4 px-2">
                <div className="text-[#CC0000] font-black text-2xl">{s.v}</div>
                <div className="text-white/40 text-[11px] mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          <blockquote className="text-white/25 text-xs italic max-w-[280px] leading-loose" style={{ fontFamily: "Cairo, sans-serif" }}>
            "الرياضة شرف وأخلاق قبل أن تكون بطولة وألقاب"
          </blockquote>
        </div>

        <div className="relative border-t border-white/8 py-4 px-12 flex items-center gap-2">
          <Shield size={13} className="text-[#CC0000]" />
          <span className="text-white/25 text-xs">Espace d'administration sécurisé — Accès réservé</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
        <div className={`w-full max-w-sm transition-all ${shake ? "animate-bounce" : ""}`}
          style={shake ? { animation: "shake .5s ease-in-out" } : {}}>

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="W.S.H.M" width={70} height={70} className="rounded-full shadow-lg mb-2" />
            <h1 className="font-black text-xl text-[#1a1a1a]">W.S.H.M</h1>
          </div>

          <div className="mb-7">
            <h2 className="text-[26px] font-extrabold text-[#1a1a1a] leading-tight">Bienvenue 👋</h2>
            <p className="text-gray-400 text-sm mt-1.5">Connectez-vous à l'espace de gestion du club</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Identifiant</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={username} placeholder="ex: admin"
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? "text" : "password"} required value={password} placeholder="••••••••"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-lg shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Progress bar */}
            {loading && (
              <div className="space-y-2 pt-1">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#CC0000] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-gray-400 text-center animate-pulse">{STAGES[stage]}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !username || !password}
              className="w-full bg-[#CC0000] hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 mt-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Connexion en cours…</>
              ) : (
                <><span>Se connecter</span><ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Accounts hint */}
          <div className="mt-5 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comptes de démonstration</p>
            </div>
            {ACCOUNTS.map((a, i) => (
              <button key={a.id} onClick={() => { setUsername(a.id); setPassword(a.pass); setError(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${i < ACCOUNTS.length - 1 ? "border-b border-gray-100" : ""}`}>
                <span className={`font-bold ${a.color}`}>{a.role}</span>
                <span className="text-gray-400 font-mono">{a.id} / {a.pass}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-gray-300 text-xs mt-6">
            © {new Date().getFullYear()} W.S.H.M · Madagh, Maroc · v2.0
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
