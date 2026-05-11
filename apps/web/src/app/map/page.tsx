"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Filter, Mic2, Building2, Home, X, Star, Clock, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Studio } from "@studioradar/shared";

// Mock data — à remplacer par Supabase
const MOCK_STUDIOS: Studio[] = [
  {
    id: "1",
    owner_id: "u1",
    name: "Studio Nova",
    type: "pro",
    description: "Studio professionnel 80m², cabine acoustique isolée, matériel haut de gamme.",
    hourly_rate: 45,
    is_free: false,
    is_available_now: true,
    lat: 48.8566,
    lng: 2.3522,
    address: "12 rue de la Musique",
    city: "Paris",
    photos: [],
    equipment: ["Neve 8078", "Pro Tools", "Neumann U87", "API 2500"],
    genres: ["Hip-hop", "R&B", "Pop", "Soul"],
    rating: 4.9,
    reviews_count: 47,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "u2",
    name: "Frequency Studio",
    type: "pro",
    description: "Studio indépendant avec une acoustique parfaite. Spécialisé rap et électro.",
    hourly_rate: 30,
    is_free: false,
    is_available_now: true,
    lat: 48.862,
    lng: 2.3488,
    address: "5 passage Verdeau",
    city: "Paris",
    photos: [],
    equipment: ["SSL 4000", "Ableton Live", "AKG C414"],
    genres: ["Rap", "Électro", "Trap"],
    rating: 4.7,
    reviews_count: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    owner_id: "u3",
    name: "Chez Julien — Home Studio",
    type: "home",
    description: "Beatmaker depuis 10 ans. Setup home studio complet, ambiance cool.",
    hourly_rate: 10,
    is_free: false,
    is_available_now: true,
    lat: 48.845,
    lng: 2.365,
    address: "Montreuil",
    city: "Montreuil",
    photos: [],
    equipment: ["Focusrite Scarlett", "Logic Pro", "Rode NT1"],
    genres: ["Rap", "Afro", "Drill"],
    rating: 4.5,
    reviews_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    owner_id: "u4",
    name: "Sarah Records",
    type: "home",
    description: "Guitariste et ingénieure du son. Accueille artistes lo-fi, indie, folk.",
    hourly_rate: 0,
    is_free: true,
    is_available_now: false,
    lat: 48.878,
    lng: 2.328,
    address: "9ème arrondissement",
    city: "Paris",
    photos: [],
    equipment: ["GarageBand", "Fender Stratocaster", "Various mics"],
    genres: ["Indie", "Folk", "Lo-fi"],
    rating: 4.3,
    reviews_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type FilterType = "all" | "pro" | "home" | "available_now" | "free";

export default function MapPage() {
  const [selected, setSelected] = useState<Studio | null>(null);
  const [filter, setFilter] = useState<FilterType>("available_now");
  const [studios, setStudios] = useState<Studio[]>(MOCK_STUDIOS);
  const [mapLoaded, setMapLoaded] = useState(false);

  const filtered = studios.filter((s) => {
    if (filter === "pro") return s.type === "pro";
    if (filter === "home") return s.type === "home";
    if (filter === "available_now") return s.is_available_now;
    if (filter === "free") return s.is_free;
    return true;
  });

  return (
    <div className="h-screen bg-radar-dark flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-radar-dark/90 backdrop-blur z-10">
        <a href="/" className="text-xl font-bold tracking-tight shrink-0">
          Studio<span className="text-brand-400">Radar</span>
        </a>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
          {(
            [
              { id: "available_now", label: "Dispo maintenant", icon: <Zap className="w-3 h-3" /> },
              { id: "all",           label: "Tous",             icon: <MapPin className="w-3 h-3" /> },
              { id: "pro",           label: "Pro",              icon: <Building2 className="w-3 h-3" /> },
              { id: "home",          label: "Home Studio",      icon: <Home className="w-3 h-3" /> },
              { id: "free",          label: "Gratuit",          icon: null },
            ] as { id: FilterType; label: string; icon: React.ReactNode }[]
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                filter === f.id
                  ? "bg-brand-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map placeholder */}
        <div className="flex-1 relative bg-[#0d0d2b]">
          {/* Simulated map with radar aesthetic */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4466ff" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Radar circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[80, 160, 240, 320].map((r) => (
                  <div
                    key={r}
                    className="absolute rounded-full border border-brand-500/10"
                    style={{ width: r * 2, height: r * 2 }}
                  />
                ))}
              </div>

              {/* Studio markers */}
              {filtered.map((studio, i) => {
                const positions = [
                  { top: "42%", left: "48%" },
                  { top: "35%", left: "55%" },
                  { top: "58%", left: "52%" },
                  { top: "38%", left: "40%" },
                ];
                const pos = positions[i % positions.length];

                return (
                  <button
                    key={studio.id}
                    onClick={() => setSelected(studio)}
                    className={cn(
                      "absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg",
                      studio.is_available_now
                        ? "bg-radar-green text-black hover:scale-110"
                        : "bg-white/20 text-white hover:scale-110",
                      selected?.id === studio.id && "ring-2 ring-white scale-110"
                    )}
                    style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
                  >
                    {studio.type === "pro" ? (
                      <Building2 className="w-3 h-3" />
                    ) : (
                      <Home className="w-3 h-3" />
                    )}
                    {studio.is_available_now && (
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    )}
                    {studio.name.split(" ")[0]}
                  </button>
                );
              })}

              {/* User location */}
              <div
                className="absolute"
                style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              >
                <div className="relative">
                  <div className="w-4 h-4 bg-brand-500 rounded-full border-2 border-white z-10 relative" />
                  <div className="absolute inset-0 w-4 h-4 bg-brand-500 rounded-full animate-radar-ping" />
                </div>
              </div>

              {/* Map notice */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white/50 text-xs px-3 py-2 rounded-lg">
                Carte interactive — connectez Mapbox dans .env
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar list */}
        <div className="w-80 bg-radar-dark border-l border-white/5 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <p className="text-sm text-white/50">
              <span className="text-white font-semibold">{filtered.length}</span>{" "}
              studio{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((studio) => (
              <StudioCard
                key={studio.id}
                studio={studio}
                selected={selected?.id === studio.id}
                onClick={() => setSelected(studio === selected ? null : studio)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Studio detail sheet */}
      {selected && (
        <StudioSheet studio={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StudioCard({
  studio,
  selected,
  onClick,
}: {
  studio: Studio;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 transition-all hover:bg-white/3",
        selected && "bg-brand-900/20"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{studio.name}</h3>
            {studio.is_available_now && (
              <span className="shrink-0 flex items-center gap-1 bg-radar-green/10 text-radar-green text-xs px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-radar-green rounded-full animate-pulse" />
                Dispo
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            {studio.type === "pro" ? "Studio pro" : "Home studio"} · {studio.city}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-3 text-xs text-white/40">
        {studio.rating && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {studio.rating}
          </span>
        )}
        <span>
          {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h`}
        </span>
      </div>
    </button>
  );
}

function StudioSheet({
  studio,
  onClose,
}: {
  studio: Studio;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-[57px] md:w-96 bg-radar-card border-t md:border-t-0 md:border-l border-white/10 z-20 overflow-y-auto max-h-[70vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{studio.name}</h2>
            {studio.is_available_now && (
              <span className="flex items-center gap-1 bg-radar-green/10 text-radar-green text-xs px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-radar-green rounded-full animate-pulse" />
                Disponible
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">
            {studio.type === "pro" ? "Studio professionnel" : "Home Studio"} · {studio.city}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Photo placeholder */}
        <div className="w-full h-36 bg-white/5 rounded-2xl flex items-center justify-center">
          {studio.type === "pro" ? (
            <Building2 className="w-8 h-8 text-white/20" />
          ) : (
            <Home className="w-8 h-8 text-white/20" />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">
              {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€`}
            </div>
            <div className="text-xs text-white/40">par heure</div>
          </div>
          {studio.rating && (
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                {studio.rating}
                <Star className="w-3 h-3 text-yellow-400" />
              </div>
              <div className="text-xs text-white/40">{studio.reviews_count} avis</div>
            </div>
          )}
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-radar-green">
              {studio.is_available_now ? "Now" : "Bientôt"}
            </div>
            <div className="text-xs text-white/40">disponibilité</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Description</h3>
          <p className="text-sm text-white/60 leading-relaxed">{studio.description}</p>
        </div>

        {/* Equipment */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Équipement</h3>
          <div className="flex flex-wrap gap-2">
            {studio.equipment.map((eq) => (
              <span
                key={eq}
                className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/60"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {studio.genres.map((g) => (
              <span
                key={g}
                className="text-xs bg-brand-900/40 border border-brand-800/50 text-brand-300 px-3 py-1.5 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          {studio.type === "pro" ? (
            <>
              <Clock className="w-4 h-4" />
              Réserver maintenant
            </>
          ) : (
            <>
              <Mic2 className="w-4 h-4" />
              Contacter le créateur
            </>
          )}
        </button>
      </div>
    </div>
  );
}
