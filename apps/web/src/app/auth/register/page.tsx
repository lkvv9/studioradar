"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Mail, Lock, User, ArrowRight, Loader2, Mic2, Building2, Home, Music } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@studioradar/shared";

const ROLES: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "artist",
    label: "Artiste",
    description: "Je cherche un studio",
    icon: <Mic2 className="w-5 h-5" />,
  },
  {
    value: "pro_studio",
    label: "Studio Pro",
    description: "J'ai un studio professionnel",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: "home_studio",
    label: "Home Studio",
    description: "J'ai un setup chez moi",
    icon: <Home className="w-5 h-5" />,
  },
  {
    value: "music_lover",
    label: "Passionné",
    description: "Je veux juste connecter",
    icon: <Music className="w-5 h-5" />,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>("artist");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/map");
  }

  return (
    <div className="min-h-screen bg-radar-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-radar-green rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Studio<span className="text-brand-400">Radar</span>
          </span>
        </Link>

        <div className="bg-radar-card border border-white/5 rounded-3xl p-8">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-brand-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold mb-2">Tu es…</h1>
              <p className="text-white/50 text-sm mb-6">
                Choisis ton profil pour personnaliser ton expérience
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      role === r.value
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/3"
                    }`}
                  >
                    <div className={`mb-2 ${role === r.value ? "text-brand-400" : "text-white/50"}`}>
                      {r.icon}
                    </div>
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{r.description}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-semibold transition-colors mt-6"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Créer ton compte</h1>
              <p className="text-white/50 text-sm mb-6">
                Presque terminé 🎤
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 block mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ton nom ou pseudo"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="toi@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      minLength={8}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/60 text-sm font-medium transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Créer mon compte</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-white/40 text-sm mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
