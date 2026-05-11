"use client";

import Link from "next/link";
import { Mic2, MapPin, Users, Radio, Star, ArrowRight, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-radar-dark text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-radar-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-radar-green rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Studio<span className="text-brand-400">Radar</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-full transition-colors font-medium"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Radar background animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[600px] h-[600px] opacity-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-brand-400"
                style={{
                  transform: `scale(${i * 0.25})`,
                  opacity: 1 - i * 0.2,
                }}
              />
            ))}
            {/* Sweep line */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden radar-sweep"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(45,78,255,0.3) 60deg, transparent 60deg)",
              }}
            />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-radar-green/10 border border-radar-green/30 text-radar-green text-sm px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-radar-green rounded-full animate-pulse" />
            Studios disponibles maintenant
          </div>

          <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-6">
            Ton studio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-radar-green">
              disponible maintenant
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Trouve un studio d'enregistrement pro ou home studio disponible à
            l'instant autour de toi. Réserve, enregistre, rencontre d'autres
            artistes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/map"
              className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all shadow-lg shadow-brand-600/25"
            >
              <MapPin className="w-5 h-5" />
              Voir les studios près de moi
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/match"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              <Users className="w-5 h-5" />
              Music Match
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Tout ce dont tu as besoin
          </h2>
          <p className="text-white/50 text-center mb-16">
            Une plateforme, trois façons de créer
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              color="yellow"
              title="Studios Pro"
              subtitle="Disponible maintenant"
              description="Accède aux studios professionnels disponibles à l'instant. Réserve en quelques clics, paye en ligne, enregistre."
            />
            <FeatureCard
              icon={<Mic2 className="w-6 h-6 text-radar-green" />}
              color="green"
              title="Home Studios"
              subtitle="Low-cost & indépendant"
              description="Des passionnés ouvrent leurs home studios. Parfait pour artistes émergents. Souvent gratuit ou très accessible."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-brand-400" />}
              color="blue"
              title="Music Match"
              subtitle="Rencontres musicales"
              description="Swipe et connecte-toi avec des musiciens, producteurs, beatmakers près de toi. Crée, collabore, évolue."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "1 200+", label: "Studios listés" },
            { value: "8 400+", label: "Artistes inscrits" },
            { value: "340+", label: "Villes couvertes" },
            { value: "4.8", label: "Note moyenne", icon: <Star className="w-4 h-4 text-yellow-400 inline" /> },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-white mb-1">
                {stat.value} {stat.icon}
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-brand-900/50 to-radar-card border border-brand-800/50 rounded-3xl p-12">
          <h2 className="text-4xl font-black mb-4">Prêt à enregistrer ?</h2>
          <p className="text-white/60 mb-8">
            Rejoins des milliers d'artistes qui utilisent StudioRadar chaque jour.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all shadow-lg shadow-brand-600/25"
          >
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-white/30 text-sm">
        © 2025 StudioRadar — Tous droits réservés
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: "yellow" | "green" | "blue";
}) {
  const borders = {
    yellow: "hover:border-yellow-400/30",
    green:  "hover:border-radar-green/30",
    blue:   "hover:border-brand-400/30",
  };

  return (
    <div
      className={`bg-radar-card border border-white/5 ${borders[color]} rounded-2xl p-6 transition-all group hover:-translate-y-1`}
    >
      <div className="mb-4">{icon}</div>
      <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">
        {subtitle}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
