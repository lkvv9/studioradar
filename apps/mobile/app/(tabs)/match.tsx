import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Heart, X, MapPin, Music2, MessageCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { scheduleLocalNotification } from "@/lib/notifications";
import { useOpenConversation } from "@/hooks/useChat";
import { useSwipeProfiles } from "@/hooks/useStudios";
import type { SwipeProfile } from "@studioradar/shared";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.35;

const ROLE_CONFIG = {
  artist:      { label: "Artiste",     color: "#5478ff", bg: "rgba(84,120,255,0.15)" },
  pro_studio:  { label: "Studio Pro",  color: "#facc15", bg: "rgba(250,204,21,0.15)" },
  home_studio: { label: "Home Studio", color: "#00ff88", bg: "rgba(0,255,136,0.15)" },
  music_lover: { label: "Passionné",   color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
};

const AVATAR_COLORS = ["#1a30f5", "#7c3aed", "#059669", "#dc2626", "#d97706"];

export default function MatchScreen() {
  const router = useRouter();
  const { openConversation } = useOpenConversation();
  const { profiles: fetchedProfiles, loading, recordSwipe } = useSwipeProfiles();
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [matched, setMatched] = useState<SwipeProfile[]>([]);
  const [showMatchToast, setShowMatchToast] = useState<SwipeProfile | null>(null);

  useEffect(() => { setProfiles(fetchedProfiles); }, [fetchedProfiles]);

  function removeTop(liked: boolean) {
    const current = profiles[0];
    if (!current) return;
    if (liked) {
      setMatched((prev) => [...prev, current]);
      setShowMatchToast(current);
      setTimeout(() => setShowMatchToast(null), 3500);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    recordSwipe(current.id, liked);
    setProfiles((prev) => prev.slice(1));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Music <Text style={{ color: "#f472b6" }}>Match</Text>
        </Text>
        <View style={styles.matchCount}>
          <Heart size={14} color="#f472b6" />
          <Text style={styles.matchCountText}>{matched.length} match{matched.length > 1 ? "s" : ""}</Text>
        </View>
      </View>

      {/* Stack de cartes */}
      <View style={styles.stackArea}>
        {profiles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Music2 size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>Plus de profils</Text>
            <Text style={styles.emptySub}>Reviens plus tard !</Text>
            <TouchableOpacity
              style={styles.restartBtn}
              onPress={() => setProfiles(fetchedProfiles)}
            >
              <Text style={styles.restartBtnText}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cartes derrière */}
            {profiles.slice(1, 3).reverse().map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.card,
                  {
                    transform: [
                      { scale: 1 - (2 - i) * 0.04 },
                      { translateY: (2 - i) * 12 },
                    ],
                    zIndex: i,
                  },
                ]}
              >
                <CardContent profile={p} />
              </View>
            ))}

            {/* Carte active avec gesture */}
            <SwipeCard
              key={profiles[0].id}
              profile={profiles[0]}
              onSwipe={removeTop}
            />
          </>
        )}
      </View>

      {/* Boutons */}
      {profiles.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => removeTop(false)}
            activeOpacity={0.7}
          >
            <X size={26} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => removeTop(true)}
            activeOpacity={0.7}
          >
            <Heart size={30} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Toast match */}
      {showMatchToast && (
        <Animated.View style={styles.toast}>
          <Text style={styles.toastEmoji}>🎉</Text>
          <Text style={styles.toastTitle}>Match !</Text>
          <Text style={styles.toastSub}>Toi et {showMatchToast.full_name}</Text>
          <TouchableOpacity
            style={styles.toastMsgBtn}
            onPress={async () => {
              setShowMatchToast(null);
              const convId = await openConversation(showMatchToast.id);
              if (convId) {
                router.push({ pathname: "/chat/[id]", params: { id: convId, otherName: showMatchToast.full_name, otherRole: showMatchToast.role } });
              }
            }}
            activeOpacity={0.8}
          >
            <MessageCircle size={15} color="#e91e8c" />
            <Text style={styles.toastMsgBtnText}>Envoyer un message</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

function SwipeCard({ profile, onSwipe }: { profile: SwipeProfile; onSwipe: (liked: boolean) => void }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const liked = e.translationX > 0;
        translateX.value = withTiming(liked ? width * 1.5 : -width * 1.5, { duration: 300 });
        runOnJS(onSwipe)(liked);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-width / 2, 0, width / 2], [-15, 0, 15], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.5], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD * 0.5, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animStyle, { zIndex: 10 }]}>
        {/* LIKE overlay */}
        <Animated.View style={[styles.overlayLike, likeOpacity]}>
          <Text style={styles.overlayLikeText}>LIKE</Text>
        </Animated.View>
        {/* NOPE overlay */}
        <Animated.View style={[styles.overlayNope, nopeOpacity]}>
          <Text style={styles.overlayNopeText}>NOPE</Text>
        </Animated.View>
        <CardContent profile={profile} />
      </Animated.View>
    </GestureDetector>
  );
}

function CardContent({ profile }: { profile: SwipeProfile }) {
  const config = ROLE_CONFIG[profile.role];
  const avatarColor = AVATAR_COLORS[profile.id.charCodeAt(1) % AVATAR_COLORS.length];

  return (
    <>
      {/* Avatar section */}
      <View style={[styles.cardAvatar, { backgroundColor: avatarColor + "33" }]}>
        <View style={[styles.avatarCircle, { backgroundColor: avatarColor + "55" }]}>
          <Text style={styles.avatarInitial}>
            {profile.full_name.charAt(0)}
          </Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.roleBadgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.cardInfo}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName}>{profile.full_name}</Text>
          {profile.distance_km && (
            <View style={styles.distanceChip}>
              <MapPin size={10} color="rgba(255,255,255,0.4)" />
              <Text style={styles.distanceText}>{profile.distance_km} km</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardBio}>{profile.bio}</Text>

        <View style={styles.genres}>
          {profile.genres.map((g) => (
            <View key={g} style={styles.genreTag}>
              <Text style={styles.genreText}>{g}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const CARD_HEIGHT = height * 0.52;

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#0a0a1a" },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle:      { fontSize: 26, fontWeight: "900", color: "#fff" },
  matchCount:       { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(244,114,182,0.1)", borderWidth: 1, borderColor: "rgba(244,114,182,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  matchCountText:   { color: "#f472b6", fontSize: 12, fontWeight: "600" },
  stackArea:        { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  card:             { position: "absolute", width: width - 48, height: CARD_HEIGHT, backgroundColor: "#12122a", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  cardAvatar:       { height: CARD_HEIGHT * 0.45, alignItems: "center", justifyContent: "center", position: "relative" },
  avatarCircle:     { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarInitial:    { fontSize: 40, fontWeight: "900", color: "#fff" },
  roleBadge:        { position: "absolute", top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  roleBadgeText:    { fontSize: 12, fontWeight: "700" },
  cardInfo:         { padding: 20, gap: 12 },
  cardNameRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardName:         { fontSize: 22, fontWeight: "900", color: "#fff" },
  distanceChip:     { flexDirection: "row", alignItems: "center", gap: 4 },
  distanceText:     { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  cardBio:          { fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 20 },
  genres:           { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreTag:         { backgroundColor: "rgba(45,78,255,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  genreText:        { color: "#5478ff", fontSize: 12, fontWeight: "600" },
  overlayLike:      { position: "absolute", top: 24, left: 20, zIndex: 20, borderWidth: 3, borderColor: "#00ff88", borderRadius: 8, padding: 6, transform: [{ rotate: "-15deg" }] },
  overlayLikeText:  { color: "#00ff88", fontSize: 24, fontWeight: "900" },
  overlayNope:      { position: "absolute", top: 24, right: 20, zIndex: 20, borderWidth: 3, borderColor: "#ef4444", borderRadius: 8, padding: 6, transform: [{ rotate: "15deg" }] },
  overlayNopeText:  { color: "#ef4444", fontSize: 24, fontWeight: "900" },
  actions:          { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 32, paddingVertical: 24 },
  skipBtn:          { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  likeBtn:          { width: 72, height: 72, borderRadius: 36, backgroundColor: "#e91e8c", alignItems: "center", justifyContent: "center", shadowColor: "#e91e8c", shadowOpacity: 0.4, shadowRadius: 16 },
  emptyCard:        { width: width - 48, height: CARD_HEIGHT, backgroundColor: "#12122a", borderRadius: 24, alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  emptyTitle:       { fontSize: 20, fontWeight: "700", color: "rgba(255,255,255,0.4)" },
  emptySub:         { fontSize: 14, color: "rgba(255,255,255,0.25)" },
  restartBtn:       { marginTop: 8, backgroundColor: "rgba(45,78,255,0.15)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  restartBtnText:   { color: "#5478ff", fontWeight: "600" },
  toast:            { position: "absolute", top: height * 0.35, alignSelf: "center", backgroundColor: "#e91e8c", borderRadius: 20, paddingHorizontal: 32, paddingVertical: 20, alignItems: "center", shadowColor: "#e91e8c", shadowOpacity: 0.5, shadowRadius: 20, elevation: 20, gap: 4 },
  toastEmoji:       { fontSize: 36, marginBottom: 4 },
  toastTitle:       { color: "#fff", fontSize: 22, fontWeight: "900" },
  toastSub:         { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  toastMsgBtn:      { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  toastMsgBtnText:  { color: "#e91e8c", fontSize: 13, fontWeight: "700" },
});
