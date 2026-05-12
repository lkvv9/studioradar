"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MapPin, Star, Building2, Home, Clock, ArrowLeft, Check,
  Music2, MessageSquare, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { Studio } from "@studioradar/shared";

export default function StudioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [studio, setStudio]   = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("studios")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setStudio(data as Studio);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-radar-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!studio) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-radar-dark pt-24 flex items-center justify-center">
          <p className="text-white/30">Studio introuvable.</p>
        </div>
      </>
    );
  }

  const isPro = studio.type === "pro";

  const gradientFrom = isPro ? "#1a30f5" : "#065f46";
  const gradientTo   = "#0a0a1a";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-radar-dark pt-16">
        {/* Hero */}
        <div
          className="relative h-72 flex items-end"
          style={{ background: `linear-gradient(to bottom, ${gradientFrom}44, ${gradientTo})` }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, transparent 60%)` }}
          />
          <div className="relative max-w-6xl mx-auto px-4 w-full pb-8">
            <button
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div className="flex items-end gap-5">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
                isPro ? "bg-brand-700/50" : "bg-emerald-800/50"
              )}>
                {isPro ? <Building2 className="w-8 h-8 text-white" /> : <Home className="w-8 h-8 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-black text-white">{studio.name}</h1>
                  {studio.is_available_now && (
                    <span className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Disponible
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/50 text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {studio.address}, {studio.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {studio.rating} ({studio.reviews_count} avis)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-radar-card border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 flex divide-x divide-white/5">
            {[
              { label: "Tarif", value: studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h` },
              { label: "Type", value: isPro ? "Studio Pro" : "Home Studio" },
              { label: "Note", value: `${studio.rating} / 5` },
              { label: "Avis", value: `${studio.reviews_count}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 py-4 text-center">
                <div className="text-lg font-black text-white">{value}</div>
                <div className="text-xs text-white/30 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — info */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Description */}
              <Section title="À propos">
                <p className="text-white/55 leading-relaxed whitespace-pre-line">{studio.description}</p>
              </Section>

              {/* Equipment */}
              <Section title="Équipement">
                <div className="flex flex-wrap gap-2">
                  {studio.equipment.map((eq) => (
                    <span key={eq} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 text-sm px-3 py-1.5 rounded-lg">
                      <Check className="w-3 h-3 text-brand-400" />
                      {eq}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Genres */}
              <Section title="Genres">
                <div className="flex flex-wrap gap-2">
                  {studio.genres.map((g) => (
                    <span key={g} className="bg-brand-600/15 text-brand-400 text-sm font-medium px-3 py-1.5 rounded-lg">
                      {g}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Mock reviews */}
              <Section title="Avis clients">
                <div className="flex flex-col gap-4">
                  {[
                    { name: "Marco V.", rating: 5, text: "Son acoustique incroyable, ingé son très professionnel. Je recommande vivement.", date: "Il y a 3 jours" },
                    { name: "Aïcha R.", rating: 5, text: "Super expérience, ambiance détendue et matériel au top. On va revenir !", date: "Il y a 2 semaines" },
                    { name: "Liam B.", rating: 4, text: "Très bonne session, salle bien équipée. Petit bémol sur le parking.", date: "Il y a 1 mois" },
                  ].map((r) => (
                    <div key={r.name} className="bg-radar-card border border-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white">
                            {r.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white text-sm">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{r.text}</p>
                      <p className="text-white/25 text-xs mt-2">{r.date}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Right — CTA sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col gap-4">
                <div className="bg-radar-card border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-white">
                        {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€`}
                      </span>
                      {!studio.is_free && <span className="text-white/40 text-sm ml-1">/heure</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-white">{studio.rating}</span>
                    </div>
                  </div>

                  {isPro ? (
                    <button
                      onClick={() => router.push(`/booking/${studio.id}`)}
                      className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4" />
                      Réserver maintenant
                    </button>
                  ) : (
                    <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4" />
                      Contacter le créateur
                    </button>
                  )}

                  {isPro && (
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-white/10">
                      <MessageSquare className="w-4 h-4" />
                      Envoyer un message
                    </button>
                  )}
                </div>

                <div className="bg-radar-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider">Infos pratiques</h3>
                  {[
                    { icon: MapPin, text: studio.address },
                    { icon: Clock, text: "Disponible 7j/7" },
                    { icon: Music2, text: studio.genres.join(", ") },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 text-sm text-white/50">
                      <Icon className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}
