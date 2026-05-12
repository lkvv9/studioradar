import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Studio, SwipeProfile } from "@studioradar/shared";

interface UseStudiosOptions {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  type?: "pro" | "home";
  availableOnly?: boolean;
}

export function useStudios(options: UseStudiosOptions = {}) {
  const [studios, setStudios]   = useState<Studio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query: ReturnType<typeof supabase.from<"studios", Studio>> | null = null;

      if (options.lat && options.lng) {
        // Utilise la fonction PostGIS
        const { data, error } = await supabase.rpc("studios_nearby", {
          lat:            options.lat,
          lng:            options.lng,
          radius_km:      options.radiusKm ?? 10,
          studio_type:    options.type ?? null,
          available_only: options.availableOnly ?? false,
        });
        if (error) throw error;
        setStudios((data as Studio[]) ?? []);
      } else {
        // Fallback sans géo
        let q = supabase.from("studios").select("*").order("created_at", { ascending: false });
        if (options.type)          q = q.eq("type", options.type);
        if (options.availableOnly) q = q.eq("is_available_now", true);
        const { data, error } = await q;
        if (error) throw error;
        setStudios((data as Studio[]) ?? []);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [options.lat, options.lng, options.radiusKm, options.type, options.availableOnly]);

  useEffect(() => { fetch(); }, [fetch]);

  // Temps réel — écoute les changements de disponibilité
  useEffect(() => {
    const channel = supabase
      .channel("studios-availability")
      .on("postgres_changes", {
        event:  "UPDATE",
        schema: "public",
        table:  "studios",
        filter: "is_available_now=eq.true",
      }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { studios, loading, error, refetch: fetch };
}

export function useStudio(id: string) {
  const [studio, setStudio]   = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("studios")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setStudio(data as Studio);
        setLoading(false);
      });
  }, [id]);

  return { studio, loading };
}

export function useSwipeProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    // Profils non encore swipés par l'utilisateur courant
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio, genres, role")
      .neq("id", user.id)
      .not("id", "in", `(select target_id from swipes where swiper_id = '${user.id}')`)
      .limit(20)
      .then(({ data }) => {
        setProfiles((data ?? []) as SwipeProfile[]);
        setLoading(false);
      });
  }, [user]);

  async function recordSwipe(targetId: string, liked: boolean) {
    if (!user) return;
    await supabase.from("swipes").upsert({
      swiper_id: user.id,
      target_id: targetId,
      direction: liked ? "right" : "left",
    }, { onConflict: "swiper_id,target_id" });
  }

  return { profiles, loading, recordSwipe };
}
