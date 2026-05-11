import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Studio, BookingWithStudio } from "@studioradar/shared";

export interface DashboardStats {
  earningsMonth:   number;
  earningsTotal:   number;
  bookingsMonth:   number;
  bookingsPending: number;
  rating:          number;
  reviewsCount:    number;
}

export function useMyStudio() {
  const { user } = useAuth();
  const [studio, setStudio]   = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("studios")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();
    setStudio(data as Studio | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function toggleAvailability() {
    if (!studio) return;
    const next = !studio.is_available_now;
    setStudio((s) => s ? { ...s, is_available_now: next } : s);
    await supabase
      .from("studios")
      .update({ is_available_now: next, updated_at: new Date().toISOString() })
      .eq("id", studio.id);
  }

  async function updateStudio(patch: Partial<Studio>) {
    if (!studio) return { error: "Aucun studio" };
    const { error } = await supabase
      .from("studios")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", studio.id);
    if (!error) setStudio((s) => s ? { ...s, ...patch } : s);
    return { error: error?.message ?? null };
  }

  return { studio, loading, refetch: fetch, toggleAvailability, updateStudio };
}

export function useIncomingBookings(studioId: string | undefined) {
  const [bookings, setBookings] = useState<BookingWithStudio[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    if (!studioId) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, studio:studios(id,name,type,hourly_rate,city,address)")
      .eq("studio_id", studioId)
      .in("status", ["pending", "confirmed"])
      .order("start_time", { ascending: true });
    setBookings((data as BookingWithStudio[]) ?? []);
    setLoading(false);
  }, [studioId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Temps réel — nouvelle réservation reçue
  useEffect(() => {
    if (!studioId) return;
    const channel = supabase
      .channel(`bookings-studio-${studioId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "bookings",
        filter: `studio_id=eq.${studioId}`,
      }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [studioId, fetch]);

  async function acceptBooking(id: string) {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
  }

  async function declineBooking(id: string) {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return { bookings, loading, refetch: fetch, acceptBooking, declineBooking };
}

export function useDashboardStats(studioId: string | undefined): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    earningsMonth: 0, earningsTotal: 0,
    bookingsMonth: 0, bookingsPending: 0,
    rating: 0, reviewsCount: 0,
  });

  useEffect(() => {
    if (!studioId) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    Promise.all([
      // Revenus + bookings du mois
      supabase
        .from("bookings")
        .select("total_price, status, created_at")
        .eq("studio_id", studioId)
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString()),

      // Total général
      supabase
        .from("bookings")
        .select("total_price")
        .eq("studio_id", studioId)
        .eq("status", "completed"),

      // En attente
      supabase
        .from("bookings")
        .select("id")
        .eq("studio_id", studioId)
        .eq("status", "pending"),

      // Rating
      supabase
        .from("studios")
        .select("rating, reviews_count")
        .eq("id", studioId)
        .single(),
    ]).then(([month, total, pending, studioData]) => {
      const earningsMonth  = (month.data ?? []).reduce((s: number, b: { total_price: number }) => s + (b.total_price ?? 0), 0);
      const earningsTotal  = (total.data ?? []).reduce((s: number, b: { total_price: number }) => s + (b.total_price ?? 0), 0);
      const studio         = studioData.data as { rating: number; reviews_count: number } | null;

      setStats({
        earningsMonth,
        earningsTotal,
        bookingsMonth:   month.data?.length ?? 0,
        bookingsPending: pending.data?.length ?? 0,
        rating:          studio?.rating ?? 0,
        reviewsCount:    studio?.reviews_count ?? 0,
      });
    });
  }, [studioId]);

  return stats;
}
