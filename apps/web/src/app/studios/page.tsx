"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, MapPin, Star, Building2, Home, Zap, Radio, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { Studio } from "@studioradar/shared";

type FilterType = "all" | "pro" | "home";

export default function StudiosPage() {
  const [studios, setStudios]     = useState<Studio[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<FilterType>("all");
  const [availOnly, setAvailOnly] = useState(false);
  const [freeOnly, setFreeOnly]   = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("studios")
      .select("*")
      .order("is_available_now", { ascending: false })
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setStudios((data as Studio[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = studios.filter((s) => {
    if (filter !== "all" && s.type !== filter) return false;
    if (availOnly && !s.is_available_now) return false;
    if (freeOnly && !s.is_free) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-radar-dark pt-20">
        {/* Hero banner */}
        <div className="bg-gradient-to-b from-brand-900/40 to-transparent border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-white mb-2">
              Tous les <span className="text-brand-400">studios</span>
            </h1>
            <p className="text-white/40 mb-8">Pro ou home studio — trouve le bon son pour ton projet.</p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom ou ville…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex bg-white/5 rounded-xl p-1 gap-1">
              {(["all", "pro", "home"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === f ? "bg-brand-600 text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  {f === "all" && <Radio className="w-3.5 h-3.5" />}
                  {f === "pro" && <Building2 className="w-3.5 h-3.5" />}
                  {f === "home" && <Home className="w-3.5 h-3.5" />}
                  {f === "all" ? "Tous" : f === "pro" ? "Studio Pro" : "Home Studio"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAvailOnly(!availOnly)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                availOnly
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              Disponible maintenant
            </button>

            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                freeOnly
                  ? "bg-brand-600/20 text-brand-400 border-brand-600/30"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              )}
            >
              Gratuit
            </button>

            <span className="text-white/30 text-sm ml-auto">{filtered.length} studio{filtered.length > 1 ? "s" : ""}</span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Search className="w-12 h-12 text-white/10" />
              <p className="text-white/30 text-lg font-medium">Aucun studio trouvé</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StudioCard({ studio }: { studio: Studio }) {
  const isPro = studio.type === "pro";
  const avatarColor = isPro ? "from-brand-700 to-brand-900" : "from-emerald-800 to-emerald-950";

  return (
    <Link href={`/studios/${studio.id}`} className="group block">
      <div className="bg-radar-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:-translate-y-0.5">
        {/* Pseudo-image gradient */}
        <div className={cn("h-36 bg-gradient-to-br flex items-center justify-center relative", avatarColor)}>
          {isPro
            ? <Building2 className="w-12 h-12 text-white/20" />
            : <Home className="w-12 h-12 text-white/20" />
          }
          {studio.is_available_now && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Dispo maintenant
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/40 text-white/70 text-xs font-semibold px-2.5 py-1 rounded-full">
            {isPro ? "Studio Pro" : "Home Studio"}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">{studio.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-white/80">{studio.rating ?? "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-white/40 text-xs mb-3">
            <MapPin className="w-3 h-3" />
            {studio.city}
          </div>

          <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">{studio.description}</p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {studio.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-xs bg-brand-600/15 text-brand-400 px-2 py-0.5 rounded-md font-medium">{g}</span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-lg font-black text-white">
              {studio.is_free ? <span className="text-emerald-400">Gratuit</span> : `${studio.hourly_rate}€/h`}
            </span>
            <span className="text-xs text-white/30">{studio.reviews_count} avis</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
