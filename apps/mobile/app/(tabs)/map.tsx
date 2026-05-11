import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Building2, Home, Zap, Star, MapPin, Filter } from "lucide-react-native";
import Svg, { Circle, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import type { Studio } from "@studioradar/shared";

const { width } = Dimensions.get("window");
const RADAR_SIZE = width - 48;

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
    lat: 48.8566, lng: 2.3522,
    address: "12 rue de la Musique",
    city: "Paris",
    photos: [],
    equipment: ["Neve 8078", "Pro Tools", "Neumann U87"],
    genres: ["Hip-hop", "R&B", "Pop"],
    rating: 4.9, reviews_count: 47,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "u2",
    name: "Frequency",
    type: "pro",
    description: "Studio indépendant, acoustique parfaite. Spécialisé rap et électro.",
    hourly_rate: 30,
    is_free: false,
    is_available_now: true,
    lat: 48.862, lng: 2.3488,
    address: "5 passage Verdeau",
    city: "Paris",
    photos: [],
    equipment: ["SSL 4000", "Ableton Live", "AKG C414"],
    genres: ["Rap", "Électro", "Trap"],
    rating: 4.7, reviews_count: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    owner_id: "u3",
    name: "Chez Julien",
    type: "home",
    description: "Beatmaker depuis 10 ans. Setup home studio complet, ambiance cool.",
    hourly_rate: 10,
    is_free: false,
    is_available_now: true,
    lat: 48.845, lng: 2.365,
    address: "Montreuil",
    city: "Montreuil",
    photos: [],
    equipment: ["Focusrite", "Logic Pro", "Rode NT1"],
    genres: ["Rap", "Afro", "Drill"],
    rating: 4.5, reviews_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    owner_id: "u4",
    name: "Sarah Records",
    type: "home",
    description: "Guitariste & ingénieure du son. Accueille artistes lo-fi, indie.",
    hourly_rate: 0,
    is_free: true,
    is_available_now: false,
    lat: 48.878, lng: 2.328,
    address: "9ème arrondissement",
    city: "Paris",
    photos: [],
    equipment: ["GarageBand", "Fender Strat", "Various mics"],
    genres: ["Indie", "Folk", "Lo-fi"],
    rating: 4.3, reviews_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type Filter = "all" | "pro" | "home" | "dispo" | "gratuit";

const DOT_POSITIONS = [
  { top: 0.3, left: 0.62 },
  { top: 0.45, left: 0.22 },
  { top: 0.65, left: 0.68 },
  { top: 0.2,  left: 0.38 },
];

export default function MapScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("dispo");
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1
    );
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const filtered = MOCK_STUDIOS.filter((s) => {
    if (activeFilter === "pro")     return s.type === "pro";
    if (activeFilter === "home")    return s.type === "home";
    if (activeFilter === "dispo")   return s.is_available_now;
    if (activeFilter === "gratuit") return s.is_free;
    return true;
  });

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "dispo",   label: "⚡ Dispo" },
    { id: "all",     label: "Tous" },
    { id: "pro",     label: "🏢 Pro" },
    { id: "home",    label: "🏠 Home" },
    { id: "gratuit", label: "Gratuit" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.headerTitle}>
            Studio<Text style={{ color: "#5478ff" }}>Radar</Text>
          </Text>
        </View>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>En direct</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Radar map */}
        <View style={styles.radarWrapper}>
          <Svg width={RADAR_SIZE} height={RADAR_SIZE} viewBox="0 0 300 300">
            {[40, 80, 120, 150].map((r) => (
              <Circle key={r} cx={150} cy={150} r={r} stroke="#2d4eff" strokeWidth={0.6} fill="none" opacity={0.2} />
            ))}
            <Line x1={150} y1={0} x2={150} y2={300} stroke="#2d4eff" strokeWidth={0.4} opacity={0.12} />
            <Line x1={0} y1={150} x2={300} y2={150} stroke="#2d4eff" strokeWidth={0.4} opacity={0.12} />
          </Svg>

          <Animated.View style={[styles.sweep, sweepStyle]}>
            <View style={styles.sweepLine} />
          </Animated.View>

          {/* User position */}
          <View style={styles.userDotWrapper}>
            <View style={styles.userDotPulse} />
            <View style={styles.userDot} />
          </View>

          {/* Studio markers */}
          {filtered.map((studio, i) => {
            const pos = DOT_POSITIONS[i % DOT_POSITIONS.length];
            return (
              <TouchableOpacity
                key={studio.id}
                style={[
                  styles.studioMarker,
                  {
                    top: RADAR_SIZE * pos.top - 14,
                    left: RADAR_SIZE * pos.left - 14,
                    backgroundColor: studio.is_available_now ? "#00ff88" : "rgba(255,255,255,0.2)",
                  },
                ]}
                onPress={() => router.push(`/studio/${studio.id}`)}
              >
                {studio.type === "pro" ? (
                  <Building2 size={14} color={studio.is_available_now ? "#000" : "#fff"} />
                ) : (
                  <Home size={14} color={studio.is_available_now ? "#000" : "#fff"} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Labels km */}
          {["2km", "5km", "8km"].map((label, i) => (
            <Text key={label} style={[styles.kmLabel, { bottom: 4 + i * 0, right: 8 + i * 22 }]}>
              {label}
            </Text>
          ))}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Count */}
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{filtered.length}</Text>
            {" "}studio{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Studio cards */}
        <View style={styles.list}>
          {filtered.map((studio) => (
            <StudioCard
              key={studio.id}
              studio={studio}
              onPress={() => router.push(`/studio/${studio.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StudioCard({ studio, onPress }: { studio: Studio; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Color band */}
      <View style={[styles.cardBand, { backgroundColor: studio.type === "pro" ? "#1a30f5" : "#00aa55" }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{studio.name}</Text>
              {studio.is_available_now && (
                <View style={styles.availBadge}>
                  <View style={styles.availDot} />
                  <Text style={styles.availText}>Dispo</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSub}>
              {studio.type === "pro" ? "Studio pro" : "Home studio"} · {studio.city}
            </Text>
          </View>
          <Text style={styles.cardPrice}>
            {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h`}
          </Text>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{studio.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardRating}>
            <Star size={12} color="#facc15" />
            <Text style={styles.cardRatingText}>{studio.rating}</Text>
            <Text style={styles.cardRatingCount}>({studio.reviews_count})</Text>
          </View>
          <View style={styles.cardGenres}>
            {studio.genres.slice(0, 2).map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#0a0a1a" },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20 },
  greeting:         { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 2 },
  headerTitle:      { fontSize: 26, fontWeight: "900", color: "#fff" },
  liveChip:         { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,255,136,0.1)", borderWidth: 1, borderColor: "rgba(0,255,136,0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00ff88" },
  liveText:         { color: "#00ff88", fontSize: 12, fontWeight: "600" },
  radarWrapper:     { width: RADAR_SIZE, height: RADAR_SIZE, marginHorizontal: 24, borderRadius: 20, backgroundColor: "#0d0d2b", overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  sweep:            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  sweepLine:        { position: "absolute", top: "50%", left: "50%", width: "50%", height: 1.5, backgroundColor: "#2d4eff", opacity: 0.5, transformOrigin: "left center" },
  userDotWrapper:   { position: "absolute", top: "50%", left: "50%", width: 12, height: 12, marginTop: -6, marginLeft: -6, alignItems: "center", justifyContent: "center" },
  userDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2d4eff", borderWidth: 2, borderColor: "#fff" },
  userDotPulse:     { position: "absolute", width: 22, height: 22, borderRadius: 11, backgroundColor: "#2d4eff", opacity: 0.2 },
  studioMarker:     { position: "absolute", width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  kmLabel:          { position: "absolute", color: "rgba(255,255,255,0.2)", fontSize: 9 },
  filters:          { marginTop: 20 },
  filterChip:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  filterChipActive: { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  filterText:       { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  listHeader:       { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  listCount:        { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  list:             { paddingHorizontal: 24, gap: 12, paddingBottom: 100 },
  card:             { backgroundColor: "#12122a", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", flexDirection: "row" },
  cardBand:         { width: 4 },
  cardBody:         { flex: 1, padding: 14, gap: 8 },
  cardTop:          { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardNameRow:      { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardName:         { fontSize: 15, fontWeight: "700", color: "#fff" },
  availBadge:       { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,255,136,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  availDot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: "#00ff88" },
  availText:        { color: "#00ff88", fontSize: 11, fontWeight: "600" },
  cardSub:          { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  cardPrice:        { fontSize: 13, fontWeight: "700", color: "#5478ff" },
  cardDesc:         { fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 18 },
  cardFooter:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardRating:       { flexDirection: "row", alignItems: "center", gap: 4 },
  cardRatingText:   { color: "#facc15", fontSize: 12, fontWeight: "600" },
  cardRatingCount:  { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  cardGenres:       { flexDirection: "row", gap: 6 },
  genreTag:         { backgroundColor: "rgba(45,78,255,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  genreText:        { color: "#5478ff", fontSize: 11, fontWeight: "500" },
});
