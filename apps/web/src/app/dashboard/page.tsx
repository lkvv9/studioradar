"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Calendar, Star, Power, ChevronRight, Check, X,
  Edit3, BarChart3, MessageSquare, Clock, Euro, Loader2, AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { Studio, Booking } from "@studioradar/shared";

interface DashStats {
  monthRevenue: number;
  monthBookings: number;
  avgRating: number;
  totalReviews: number;
  pendingCount: number;
}

interface BookingRow extends Booking {
  artist_name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [studio, setStudio]       = useState<Studio | null>(null);
  const [bookings, setBookings]   = useState<BookingRow[]>([]);
  const [stats, setStats]         = useState<DashStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [toggling, setToggling]   = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth/login"); return; }

    const [{ data: studioData }, { data: bookingData }] = await Promise.all([
      supabase.from("studios").select("*").eq("owner_id", user.id).single(),
      supabase
        .from("bookings")
        .select("*, profiles!bookings_artist_id_fkey(full_name)")
        .eq("studio_id", (await supabase.from("studios").select("id").eq("owner_id", user.id).single()).data?.id ?? "")
        .order("start_time", { ascending: true })
        .limit(30),
    ]);

    if (studioData) {
      setStudio(studioData as Studio);

      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const rows  = (bookingData ?? []) as any[];
      const mapped: BookingRow[] = rows.map((b) => ({ ...b, artist_name: b.profiles?.full_name }));

      const confirmed = mapped.filter((b) => b.status === "confirmed");
      const pending   = mapped.filter((b) => b.status === "pending");
      const thisMonth = confirmed.filter((b) => b.start_time >= start);
      const revenue   = thisMonth.reduce((s, b) => s + (b.total_price ?? 0), 0);

      setBookings(mapped.filter((b) => b.status === "pending").slice(0, 10));
      setStats({
        monthRevenue:  revenue,
        monthBookings: thisMonth.length,
        avgRating:     studioData.rating ?? 0,
        totalReviews:  studioData.reviews_count ?? 0,
        pendingCount:  pending.length,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleAvailability() {
    if (!studio) return;
    setToggling(true);
    await supabase.from("studios").update({ is_available_now: !studio.is_available_now }).eq("id", studio.id);
    setStudio((s) => s ? { ...s, is_available_now: !s.is_available_now } : s);
    setToggling(false);
  }

  async function respond(bookingId: string, status: "confirmed" | "cancelled") {
    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setStats((s) => s ? { ...s, pendingCount: s.pendingCount - 1 } : s);
  }

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
        <main className="min-h-screen bg-radar-dark pt-24 px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <AlertCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Aucun studio enregistré</h2>
            <p className="text-white/40 mb-8">Crée ton studio pour commencer à recevoir des réservations.</p>
            <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Créer mon studio
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-radar-dark pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">{studio.name}</h1>
              <p className="text-white/40 mt-1">{studio.city} · {studio.type === "pro" ? "Studio Pro" : "Home Studio"}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAvailability}
                disabled={toggling}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all",
                  studio.is_available_now
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                )}
              >
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                {studio.is_available_now ? "Disponible maintenant" : "Indisponible"}
              </button>
              <button
                onClick={() => router.push("/dashboard/edit")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Revenus ce mois", value: `${stats?.monthRevenue ?? 0}€`, icon: Euro, color: "text-brand-400", bg: "bg-brand-600/10" },
              { label: "Réservations", value: stats?.monthBookings ?? 0, icon: Calendar, color: "text-violet-400", bg: "bg-violet-600/10" },
              { label: "Note moyenne", value: stats?.avgRating ? `${stats.avgRating.toFixed(1)} ★` : "—", icon: Star, color: "text-yellow-400", bg: "bg-yellow-600/10" },
              { label: "En attente", value: stats?.pendingCount ?? 0, icon: Clock, color: "text-orange-400", bg: "bg-orange-600/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-radar-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pending bookings */}
            <div className="lg:col-span-2">
              <div className="bg-radar-card border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="font-bold text-white">Réservations en attente</h2>
                  {(stats?.pendingCount ?? 0) > 0 && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {stats?.pendingCount}
                    </span>
                  )}
                </div>

                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Calendar className="w-10 h-10 text-white/10" />
                    <p className="text-white/30 text-sm">Aucune demande en attente</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {bookings.map((b) => {
                      const start = new Date(b.start_time);
                      const end   = new Date(b.end_time);
                      return (
                        <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-brand-700/30 flex items-center justify-center flex-shrink-0 font-bold text-brand-400 text-sm">
                            {b.artist_name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">{b.artist_name ?? "Artiste"}</p>
                            <p className="text-white/40 text-xs mt-0.5">
                              {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
                              {start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} →{" "}
                              {end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {b.total_price && (
                            <span className="text-white/60 text-sm font-semibold">{b.total_price}€</span>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => respond(b.id, "confirmed")}
                              className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => respond(b.id, "cancelled")}
                              className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-4">
              <div className="bg-radar-card border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="font-bold text-white">Actions rapides</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { label: "Toutes les réservations", icon: Calendar, href: "/dashboard/bookings" },
                    { label: "Statistiques & Revenus",  icon: BarChart3, href: "/dashboard/earnings" },
                    { label: "Avis clients",            icon: Star,      href: "/dashboard/reviews" },
                    { label: "Messages",                icon: MessageSquare, href: "/dashboard/messages" },
                  ].map(({ label, icon: Icon, href }) => (
                    <button
                      key={label}
                      onClick={() => router.push(href)}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                    >
                      <Icon className="w-4 h-4 text-white/30 group-hover:text-brand-400 transition-colors" />
                      <span className="flex-1 text-sm text-white/60 group-hover:text-white transition-colors">{label}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Studio info card */}
              <div className="bg-radar-card border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">Ton studio</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Tarif horaire</span>
                  <span className="text-sm font-bold text-white">
                    {studio.is_free ? "Gratuit" : `${studio.hourly_rate ?? 0}€/h`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Type</span>
                  <span className="text-sm font-bold text-white">
                    {studio.type === "pro" ? "Studio Pro" : "Home Studio"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Avis</span>
                  <span className="text-sm font-bold text-white">
                    {studio.reviews_count ?? 0} avis
                  </span>
                </div>
                <button
                  onClick={() => router.push("/dashboard/edit")}
                  className="mt-1 w-full bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 border border-brand-600/30 rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier le studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
