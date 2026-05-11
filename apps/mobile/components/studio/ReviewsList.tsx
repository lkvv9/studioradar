import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Star } from "lucide-react-native";
import { useStudioReviews } from "@/hooks/useReviews";
import type { ReviewWithAuthor } from "@studioradar/shared";

const ROLE_LABELS: Record<string, string> = {
  artist:      "Artiste",
  home_studio: "Home Studio",
  pro_studio:  "Studio Pro",
  music_lover: "Passionné",
};

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (months > 0)  return `Il y a ${months} mois`;
  if (weeks  > 0)  return `Il y a ${weeks} sem.`;
  if (days   > 0)  return `Il y a ${days}j`;
  return "Aujourd'hui";
}

export function ReviewsList({
  studioId,
  limit = 5,
  onSeeAll,
}: {
  studioId: string;
  limit?: number;
  onSeeAll?: () => void;
}) {
  const { reviews, loading } = useStudioReviews(studioId);
  const shown = reviews.slice(0, limit);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#5478ff" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucun avis pour l'instant</Text>
        <Text style={styles.emptySub}>Sois le premier à noter ce studio !</Text>
      </View>
    );
  }

  // Répartition des étoiles
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
    pct:   Math.round((reviews.filter((r) => r.rating === n).length / reviews.length) * 100),
  }));

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <View style={styles.container}>
      {/* Résumé global */}
      <View style={styles.summary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgNumber}>{avg.toFixed(1)}</Text>
          <View style={styles.avgStars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={14}
                color="#facc15"
                fill={n <= Math.round(avg) ? "#facc15" : "transparent"}
              />
            ))}
          </View>
          <Text style={styles.totalCount}>{reviews.length} avis</Text>
        </View>

        <View style={styles.summaryBars}>
          {dist.map(({ n, pct }) => (
            <View key={n} style={styles.barRow}>
              <Text style={styles.barLabel}>{n}</Text>
              <Star size={10} color="#facc15" fill="#facc15" />
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.barPct}>{pct}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Liste des avis */}
      <View style={styles.list}>
        {shown.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </View>

      {reviews.length > limit && onSeeAll && (
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>
            Voir tous les {reviews.length} avis
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ReviewItem({ review }: { review: ReviewWithAuthor }) {
  const initial = review.author_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{review.author_name}</Text>
          <Text style={styles.authorRole}>{ROLE_LABELS[review.author_role] ?? ""}</Text>
        </View>
        <Text style={styles.timeAgo}>{timeAgo(review.created_at)}</Text>
      </View>

      {/* Étoiles */}
      <View style={styles.itemStars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={13}
            color={n <= review.rating ? "#facc15" : "rgba(255,255,255,0.1)"}
            fill={n <= review.rating ? "#facc15" : "transparent"}
          />
        ))}
      </View>

      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { gap: 16 },
  loader:       { paddingVertical: 24, alignItems: "center" },
  empty:        { paddingVertical: 24, alignItems: "center", gap: 6 },
  emptyText:    { color: "rgba(255,255,255,0.3)", fontSize: 15, fontWeight: "600" },
  emptySub:     { color: "rgba(255,255,255,0.2)", fontSize: 13 },
  summary:      { flexDirection: "row", gap: 20, backgroundColor: "#12122a", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  summaryLeft:  { alignItems: "center", justifyContent: "center", gap: 6, minWidth: 64 },
  avgNumber:    { fontSize: 40, fontWeight: "900", color: "#fff", lineHeight: 44 },
  avgStars:     { flexDirection: "row", gap: 2 },
  totalCount:   { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  summaryBars:  { flex: 1, gap: 5, justifyContent: "center" },
  barRow:       { flexDirection: "row", alignItems: "center", gap: 6 },
  barLabel:     { color: "rgba(255,255,255,0.4)", fontSize: 11, width: 10, textAlign: "right" },
  barTrack:     { flex: 1, height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  barFill:      { height: "100%", backgroundColor: "#facc15", borderRadius: 3 },
  barPct:       { color: "rgba(255,255,255,0.25)", fontSize: 10, width: 28, textAlign: "right" },
  list:         { gap: 12 },
  item:         { backgroundColor: "#12122a", borderRadius: 16, padding: 14, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  itemHeader:   { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar:       { width: 34, height: 34, borderRadius: 17, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
  avatarText:   { color: "#fff", fontWeight: "700", fontSize: 14 },
  authorName:   { fontSize: 14, fontWeight: "700", color: "#fff" },
  authorRole:   { fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 },
  timeAgo:      { fontSize: 11, color: "rgba(255,255,255,0.25)" },
  itemStars:    { flexDirection: "row", gap: 3 },
  comment:      { fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 19 },
  seeAllBtn:    { backgroundColor: "rgba(45,78,255,0.1)", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  seeAllText:   { color: "#5478ff", fontSize: 14, fontWeight: "600" },
});
