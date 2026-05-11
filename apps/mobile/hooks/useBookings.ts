import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { BookingWithStudio, BookingDraft } from "@studioradar/shared";

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithStudio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, studio:studios(id,name,type,hourly_rate,city,address)")
      .eq("artist_id", user.id)
      .order("start_time", { ascending: false });

    if (error) setError(error.message);
    else setBookings((data as BookingWithStudio[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function cancelBooking(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("artist_id", user!.id);

    if (!error) setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)
    );
    return { error: error?.message ?? null };
  }

  async function createFreeBooking(draft: BookingDraft) {
    if (!user) return { error: "Non connecté" };

    const startTime = new Date(`${draft.date}T${String(draft.start_hour).padStart(2, "0")}:00:00`);
    const endTime   = new Date(startTime.getTime() + draft.duration_hours * 3600 * 1000);

    const { data, error } = await supabase.from("bookings").insert({
      studio_id:   draft.studio_id,
      artist_id:   user.id,
      start_time:  startTime.toISOString(),
      end_time:    endTime.toISOString(),
      total_price: 0,
      status:      "confirmed",
      notes:       draft.notes ?? null,
    }).select().single();

    if (!error && data) await fetch();
    return { booking: data, error: error?.message ?? null };
  }

  return { bookings, loading, error, refetch: fetch, cancelBooking, createFreeBooking };
}

export function useBookedSlots(studioId: string, date: string) {
  const [bookedHours, setBookedHours] = useState<number[]>([]);

  useEffect(() => {
    if (!studioId || !date) return;
    supabase.rpc("booked_slots", { p_studio_id: studioId, p_date: date })
      .then(({ data }) => {
        setBookedHours((data ?? []).map((r: { hour: number }) => r.hour));
      });
  }, [studioId, date]);

  return bookedHours;
}
