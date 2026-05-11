import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, ChevronLeft, CheckCircle2, Building2, Home } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSubmitReview } from "@/hooks/useReviews";
import { scheduleLocalNotification } from "@/lib/notifications";

const LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Décevant",    color: "#ef4444" },
  2: { text: "Moyen",       color: "#f97316" },
  3: { text: "Bien",        color: "#facc15" },
  4: { text: "Très bien",   color: "#4ade80" },
  5: { text: "Excellent !", color: "#00ff88" },
};

const QUICK_COMMENTS = [
  "Super équipement 🎛️",
  "Ingé son au top 🎚️",
  "Acoustique parfaite 🔊",
  "Ambiance top 🔥",
  "Prix correct 💶",
  "Très propre 🧹",
  "Je reviens ! 🙌",
];

export default function ReviewScreen() {
  const { bookingId, studioId, studioName, studioType } = useLocalSearchParams<{
    bookingId:  string;
    studioId:   string;
    studioName: string;
    studioType: string;
  }>();
  const router = useRouter();
  const { submitReview, submitting, error } = useSubmitReview();

  const [rating, setRating]   = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [comment, setComment] = useState("");
  const [done, setDone]       = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Scale animation pour chaque étoile
  const scales = [1, 2, 3, 4, 5].map(() => useSharedValue(1));

  function pressStar(n: 1 | 2 | 3 | 4 | 5) {
    setRating(n);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Bounce sur l'étoile cliquée
    scales[n - 1].value = withSpring(1.4, { damping: 6 }, () => {
      scales[n - 1].value = withSpring(1);
    });
  }

  function appendQuick(tag: string) {
    setComment((prev) =>
      prev ? `${prev.trimEnd()}, ${tag.replace(/\s*[^\w\s]+$/, "").toLowerCase()}` : tag.replace(/\s*[^\w\s]+$/, "")
    );
  }

  async function handleSubmit() {
    if (!rating) return;
    const { error } = await submitReview({
      studio_id:  studioId,
      booking_id: bookingId,
      rating:     rating as 1 | 2 | 3 | 4 | 5,
      comment,
    });
    if (!error) {
      setDone(true);
      await scheduleLocalNotification({
        title: "Merci pour ton avis ! ⭐",
        body:  `Ton avis sur ${studioName} a été publié.`,
      });
    }
  }

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <CheckCircle2 size={56} color="#00ff88" />
        </View>
        <Text style={styles.doneTitle}>Merci !</Text>
        <Text style={styles.doneSub}>
          Ton avis aide d'autres artistes à choisir le bon studio.
        </Text>
        <View style={styles.doneSummary}>
          <View style={styles.doneStars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={24}
                color={n <= rating ? "#facc15" : "rgba(255,255,255,0.1)"}
                fill={n <= rating ? "#facc15" : "transparent"}
              />
            ))}
          </View>
          {comment ? <Text style={styles.doneComment}>"{comment}"</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.replace("/my-bookings")}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Retour à mes réservations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const active   = hoveredStar || rating;
  const label    = active ? LABELS[active] : null;
  const canSubmit = rating > 0 && !submitting;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Laisser un avis</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Studio info */}
        <View style={styles.studioBanner}>
          <View style={[
            styles.studioIcon,
            { backgroundColor: studioType === "pro" ? "rgba(26,48,245,0.15)" : "rgba(0,170,85,0.15)" },
          ]}>
            {studioType === "pro"
              ? <Building2 size={26} color="#5478ff" />
              : <Home      size={26} color="#00ff88" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studioName}>{studioName ?? "Studio"}</Text>
            <Text style={styles.studioType}>
              {studioType === "pro" ? "Studio professionnel" : "Home Studio"}
            </Text>
          </View>
        </View>

        {/* Étoiles */}
        <View style={styles.starsSection}>
          <Text style={styles.starsTitle}>Ta note</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const animStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scales[n - 1].value }],
              }));
              const filled = n <= (hoveredStar || rating);
              return (
                <TouchableOpacity
                  key={n}
                  onPress={() => pressStar(n as 1 | 2 | 3 | 4 | 5)}
                  activeOpacity={0.7}
                >
                  <Animated.View style={animStyle}>
                    <Star
                      size={44}
                      color={filled ? "#facc15" : "rgba(255,255,255,0.15)"}
                      fill={filled ? "#facc15" : "transparent"}
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Label dynamique */}
          <View style={styles.labelWrapper}>
            {label && (
              <Text style={[styles.ratingLabel, { color: label.color }]}>
                {label.text}
              </Text>
            )}
          </View>
        </View>

        {/* Tags rapides */}
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>Ajouter rapidement</Text>
          <View style={styles.quickTags}>
            {QUICK_COMMENTS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.quickTag,
                  comment.toLowerCase().includes(tag.replace(/\s*[^\w\s]+$/, "").toLowerCase()) && styles.quickTagActive,
                ]}
                onPress={() => appendQuick(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Commentaire libre */}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Ton commentaire (optionnel)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Décris ton expérience dans ce studio…"
            placeholderTextColor="rgba(255,255,255,0.2)"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Star size={18} color="#fff" fill="#fff" />
              <Text style={styles.submitBtnText}>Publier mon avis</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0a0a1a" },
  header:          { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  headerTitle:     { fontSize: 18, fontWeight: "800", color: "#fff" },
  studioBanner:    { flexDirection: "row", alignItems: "center", gap: 14, margin: 20, backgroundColor: "#12122a", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  studioIcon:      { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  studioName:      { fontSize: 17, fontWeight: "700", color: "#fff" },
  studioType:      { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 },
  starsSection:    { alignItems: "center", paddingVertical: 8, paddingHorizontal: 20 },
  starsTitle:      { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 20 },
  starsRow:        { flexDirection: "row", gap: 12, marginBottom: 16 },
  labelWrapper:    { height: 28, alignItems: "center", justifyContent: "center" },
  ratingLabel:     { fontSize: 22, fontWeight: "900" },
  quickSection:    { paddingHorizontal: 20, marginTop: 8 },
  quickTitle:      { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  quickTags:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickTag:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  quickTagActive:  { backgroundColor: "rgba(45,78,255,0.15)", borderColor: "#2d4eff" },
  quickTagText:    { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  commentSection:  { paddingHorizontal: 20, marginTop: 24 },
  commentTitle:    { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  commentInput:    { backgroundColor: "#12122a", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, color: "#fff", fontSize: 15, minHeight: 110, lineHeight: 22 },
  charCount:       { color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "right", marginTop: 6 },
  errorText:       { color: "#ef4444", fontSize: 13, textAlign: "center", marginTop: 8 },
  footer:          { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 20, backgroundColor: "rgba(10,10,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  submitBtn:       { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitBtnDisabled:{ opacity: 0.4 },
  submitBtnText:   { color: "#fff", fontSize: 16, fontWeight: "700" },
  doneContainer:   { flex: 1, backgroundColor: "#0a0a1a", alignItems: "center", justifyContent: "center", padding: 32 },
  doneIcon:        { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(0,255,136,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  doneTitle:       { fontSize: 34, fontWeight: "900", color: "#fff", marginBottom: 10 },
  doneSub:         { fontSize: 15, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  doneSummary:     { width: "100%", backgroundColor: "#12122a", borderRadius: 20, padding: 20, alignItems: "center", gap: 12, marginBottom: 32 },
  doneStars:       { flexDirection: "row", gap: 8 },
  doneComment:     { color: "rgba(255,255,255,0.5)", fontSize: 14, fontStyle: "italic", textAlign: "center" },
  doneBtn:         { width: "100%", backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  doneBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
});
