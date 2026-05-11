import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { ReviewWithAuthor } from "@studioradar/shared";

export function useStudioReviews(studioId: string) {
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("reviews_with_author")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });
    setReviews((data as ReviewWithAuthor[]) ?? []);
    setLoading(false);
  }, [studioId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Temps réel — nouvel avis visible immédiatement
  useEffect(() => {
    const channel = supabase
      .channel(`reviews-${studioId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "reviews",
        filter: `studio_id=eq.${studioId}`,
      }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [studioId, fetch]);

  return { reviews, loading, refetch: fetch };
}

export function useMyReview(bookingId: string) {
  const { user } = useAuth();
  const [review, setReview]   = useState<ReviewWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || !user) { setLoading(false); return; }
    supabase
      .from("reviews_with_author")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("author_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setReview(data as ReviewWithAuthor | null);
        setLoading(false);
      });
  }, [bookingId, user]);

  return { review, loading };
}

export function useSubmitReview() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function submitReview(opts: {
    studio_id:  string;
    booking_id: string;
    rating:     1 | 2 | 3 | 4 | 5;
    comment?:   string;
  }) {
    if (!user) return { error: "Non connecté" };
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("reviews").upsert({
      studio_id:  opts.studio_id,
      booking_id: opts.booking_id,
      author_id:  user.id,
      rating:     opts.rating,
      comment:    opts.comment?.trim() || null,
    }, { onConflict: "booking_id" });

    setSubmitting(false);
    if (error) { setError(error.message); return { error: error.message }; }
    return { error: null };
  }

  return { submitReview, submitting, error };
}
