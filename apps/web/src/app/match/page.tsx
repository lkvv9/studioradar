"use client";

import { useState } from "react";
import { Heart, X, Music2, MapPin, Radio, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SwipeProfile } from "@studioradar/shared";

const MOCK_PROFILES: SwipeProfile[] = [
  {
    id: "p1",
    full_name: "Liam B.",
    bio: "Beatmaker trap/afro depuis 5 ans. Je cherche des rappeurs pour des sessions. Studio à dispo chez moi.",
    genres: ["Trap", "Afro", "Drill"],
    role: "home_studio",
    distance_km: 1.2,
  },
  {
    id: "p2",
    full_name: "Aïcha R.",
    bio: "Chanteuse R&B et soul. Je compose mes propres morceaux et cherche un producteur pour m'accompagner.",
    genres: ["R&B", "Soul", "Pop"],
    role: "artist",
    distance_km: 2.8,
  },
  {
    id: "p3",
    full_name: "Marco V.",
    bio: "Guitariste indie/jazz. Jam sessions les weekends. Ouvert à tout projet créatif.",
    genres: ["Indie", "Jazz", "Folk"],
    role: "music_lover",
    distance_km: 0.7,
  },
  {
    id: "p4",
    full_name: "Studio K",
    bio: "Studio professionnel disponible. On cherche des artistes émergents pour des sessions découverte à tarif réduit.",
    genres: ["Hip-hop", "Pop", "Électro"],
    role: "pro_studio",
    distance_km: 3.5,
  },
];

const ROLE_LABELS = {
  artist: "Artiste",
  pro_studio: "Studio Pro",
  home_studio: "Home Studio",
  music_lover: "Passionné",
};

const ROLE_COLORS = {
  artist: "text-brand-400 bg-brand-400/10",
  pro_studio: "text-yellow-400 bg-yellow-400/10",
  home_studio: "text-radar-green bg-radar-green/10",
  music_lover: "text-pink-400 bg-pink-400/10",
};

export default function MatchPage() {
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [matched, setMatched] = useState<SwipeProfile[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState<SwipeProfile | null>(null);

  const current = profiles[0];

  function swipe(direction: "left" | "right") {
    if (!current) return;
    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        setMatched((prev) => [...prev, current]);
        setShowMatch(current);
        setTimeout(() => setShowMatch(null), 2000);
      }
      setProfiles((prev) => prev.slice(1));
      setSwipeDirection(null);
    }, 300);
  }

  return (
    <div className="min-h-screen bg-radar-dark text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <a href="/" className="text-xl font-bold tracking-tight">
          Studio<span className="text-brand-400">Radar</span>
        </a>
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <Heart className="w-4 h-4 text-pink-400" />
          <span>{matched.length} match{matched.length > 1 ? "s" : ""}</span>
        </div>
      </nav>

      <div className="max-w-sm mx-auto px-4 pt-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-1">
            Music <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-brand-400">Match</span>
          </h1>
          <p className="text-white/40 text-sm">Rencontre des passionnés près de toi</p>
        </div>

        {/* Card stack */}
        <div className="relative h-[480px] mb-8">
          {profiles.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-radar-card border border-white/5 rounded-3xl">
              <Radio className="w-12 h-12 text-white/20" />
              <p className="text-white/40 text-sm">Plus de profils pour l'instant</p>
              <button
                onClick={() => setProfiles(MOCK_PROFILES)}
                className="text-brand-400 text-sm font-medium"
              >
                Recommencer
              </button>
            </div>
          ) : (
            <>
              {/* Background cards */}
              {profiles.slice(1, 3).map((p, i) => (
                <div
                  key={p.id}
                  className="absolute inset-0 bg-radar-card border border-white/5 rounded-3xl"
                  style={{
                    transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 12}px)`,
                    zIndex: 10 - i,
                  }}
                />
              ))}

              {/* Active card */}
              <div
                className={cn(
                  "absolute inset-0 bg-radar-card border border-white/10 rounded-3xl z-20 transition-all duration-300 overflow-hidden",
                  swipeDirection === "right" && "translate-x-full rotate-12 opacity-0",
                  swipeDirection === "left"  && "-translate-x-full -rotate-12 opacity-0"
                )}
              >
                {/* Avatar */}
                <div className="h-48 bg-gradient-to-br from-brand-900 to-radar-dark flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                    <Music2 className="w-10 h-10 text-white/30" />
                  </div>
                  <div
                    className={cn(
                      "absolute top-4 right-4 text-xs font-medium px-3 py-1.5 rounded-full",
                      ROLE_COLORS[current.role]
                    )}
                  >
                    {ROLE_LABELS[current.role]}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold">{current.full_name}</h2>
                      {current.distance_km && (
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          À {current.distance_km} km
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    {current.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {current.genres.map((g) => (
                      <span
                        key={g}
                        className="text-xs bg-brand-900/40 border border-brand-800/40 text-brand-300 px-3 py-1.5 rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {profiles.length > 0 && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => swipe("left")}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-white/40 group-hover:text-red-400 transition-colors" />
            </button>
            <button
              onClick={() => swipe("right")}
              className="w-20 h-20 rounded-full bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/25 flex items-center justify-center transition-all hover:scale-105"
            >
              <Heart className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Match toast */}
      {showMatch && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-br from-pink-500 to-brand-600 px-8 py-6 rounded-3xl text-center shadow-2xl animate-bounce">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-xl font-black">C'est un Match !</div>
            <div className="text-sm text-white/80 mt-1">
              Toi et {showMatch.full_name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
