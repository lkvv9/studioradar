import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Star, Clock, Mic2, Building2, Home, MapPin, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Studio } from "@studioradar/shared";

const { width } = Dimensions.get("window");

// Mock — à remplacer par une requête Supabase
const STUDIOS: Record<string, Studio> = {
  "1": { id: "1", owner_id: "u1", name: "Studio Nova", type: "pro", description: "Studio professionnel 80m², cabine acoustique isolée, matériel haut de gamme. Accessible 7j/7 sur réservation.\n\nAmbiance pro et chaleureuse. Ingé son disponible sur demande.", hourly_rate: 45, is_free: false, is_available_now: true, lat: 48.8566, lng: 2.3522, address: "12 rue de la Musique", city: "Paris", photos: [], equipment: ["Neve 8078", "Pro Tools", "Neumann U87", "API 2500", "Yamaha NS10"], genres: ["Hip-hop", "R&B", "Pop", "Soul"], rating: 4.9, reviews_count: 47, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  "2": { id: "2", owner_id: "u2", name: "Frequency Studio", type: "pro", description: "Studio indépendant avec une acoustique parfaite. Spécialisé rap et électro. Ingé son expérimenté inclus dans le tarif.", hourly_rate: 30, is_free: false, is_available_now: true, lat: 48.862, lng: 2.3488, address: "5 passage Verdeau", city: "Paris", photos: [], equipment: ["SSL 4000", "Ableton Live", "AKG C414", "Focal Alpha"], genres: ["Rap", "Électro", "Trap"], rating: 4.7, reviews_count: 23, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  "3": { id: "3", owner_id: "u3", name: "Chez Julien", type: "home", description: "Beatmaker depuis 10 ans. Setup home studio complet. Ambiance détendue, idéal pour les artistes qui veulent créer sans pression.", hourly_rate: 10, is_free: false, is_available_now: true, lat: 48.845, lng: 2.365, address: "Montreuil", city: "Montreuil", photos: [], equipment: ["Focusrite Scarlett 2i2", "Logic Pro X", "Rode NT1", "KRK Rokit 5"], genres: ["Rap", "Afro", "Drill"], rating: 4.5, reviews_count: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  "4": { id: "4", owner_id: "u4", name: "Sarah Records", type: "home", description: "Guitariste et ingénieure du son. J'accueille artistes lo-fi, indie et folk chez moi. Session gratuite pour découvrir.", hourly_rate: 0, is_free: true, is_available_now: false, lat: 48.878, lng: 2.328, address: "9ème arrondissement", city: "Paris", photos: [], equipment: ["GarageBand", "Fender Stratocaster", "SM58", "Scarlett Solo"], genres: ["Indie", "Folk", "Lo-fi"], rating: 4.3, reviews_count: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
};

export default function StudioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const studio = STUDIOS[id] ?? STUDIOS["1"];

  const isPro = studio.type === "pro";

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={isPro ? ["#1a30f5", "#0a0a1a"] : ["#005533", "#0a0a1a"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            {isPro ? (
              <Building2 size={36} color="#fff" />
            ) : (
              <Home size={36} color="#fff" />
            )}
          </View>
          <Text style={styles.heroName}>{studio.name}</Text>
          <View style={styles.heroMeta}>
            <MapPin size={13} color="rgba(255,255,255,0.5)" />
            <Text style={styles.heroMetaText}>{studio.address}, {studio.city}</Text>
          </View>
          {studio.is_available_now && (
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Disponible maintenant</Text>
            </View>
          )}
        </View>

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Stats bar */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€`}
            </Text>
            <Text style={styles.statLabel}>par heure</Text>
          </View>
          {studio.rating && (
            <View style={[styles.statItem, styles.statBorder]}>
              <View style={styles.ratingRow}>
                <Text style={styles.statValue}>{studio.rating}</Text>
                <Star size={14} color="#facc15" />
              </View>
              <Text style={styles.statLabel}>{studio.reviews_count} avis</Text>
            </View>
          )}
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={[styles.statValue, { color: studio.is_available_now ? "#00ff88" : "rgba(255,255,255,0.4)" }]}>
              {studio.is_available_now ? "Now" : "Bientôt"}
            </Text>
            <Text style={styles.statLabel}>disponibilité</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{studio.description}</Text>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Équipement</Text>
            <View style={styles.tags}>
              {studio.equipment.map((eq) => (
                <View key={eq} style={styles.equipTag}>
                  <Text style={styles.equipText}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Genres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.tags}>
              {studio.genres.map((g) => (
                <View key={g} style={styles.genreTag}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Avis */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Avis récents</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {[
              { name: "K.D.", note: "Super setup, l'ingé est au top. Je reviendrai sans hésitation !", stars: 5 },
              { name: "Mia T.", note: "Acoustique parfaite, matériel de qualité. Seul bémol : parking difficile.", stars: 4 },
            ].map((r) => (
              <View key={r.name} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} size={11} color="#facc15" fill="#facc15" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA fixé en bas */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => isPro
            ? router.push(`/booking/${studio.id}`)
            : undefined
          }
          activeOpacity={0.85}
        >
          {isPro ? (
            <>
              <Clock size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Réserver maintenant</Text>
            </>
          ) : (
            <>
              <Mic2 size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Contacter le créateur</Text>
            </>
          )}
          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0a0a1a" },
  hero:            { height: 240, position: "relative", alignItems: "center", justifyContent: "flex-end", paddingBottom: 24 },
  heroContent:     { alignItems: "center", gap: 8 },
  heroIcon:        { width: 72, height: 72, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroName:        { fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "center" },
  heroMeta:        { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText:    { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  availBadge:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,255,136,0.15)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: 4 },
  availDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00ff88" },
  availText:       { color: "#00ff88", fontSize: 12, fontWeight: "700" },
  closeBtn:        { position: "absolute", top: 52, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  statsRow:        { flexDirection: "row", backgroundColor: "#12122a", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  statItem:        { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statBorder:      { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.06)" },
  ratingRow:       { flexDirection: "row", alignItems: "center", gap: 4 },
  statValue:       { fontSize: 18, fontWeight: "900", color: "#fff" },
  statLabel:       { fontSize: 11, color: "rgba(255,255,255,0.35)" },
  body:            { padding: 24, gap: 28 },
  section:         { gap: 12 },
  sectionTitle:    { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8 },
  description:     { fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 22 },
  tags:            { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  equipTag:        { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  equipText:       { color: "rgba(255,255,255,0.55)", fontSize: 13 },
  genreTag:        { backgroundColor: "rgba(45,78,255,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  genreText:       { color: "#5478ff", fontSize: 13, fontWeight: "600" },
  reviewsHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seeAll:          { color: "#5478ff", fontSize: 13, fontWeight: "600" },
  reviewCard:      { backgroundColor: "#12122a", borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  reviewHeader:    { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar:    { width: 30, height: 30, borderRadius: 15, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
  reviewAvatarText:{ color: "#fff", fontWeight: "700", fontSize: 13 },
  reviewName:      { flex: 1, color: "#fff", fontWeight: "600", fontSize: 14 },
  reviewStars:     { flexDirection: "row", gap: 2 },
  reviewText:      { color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 18 },
  cta:             { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: "rgba(10,10,26,0.95)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  ctaBtn:          { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaBtnText:      { color: "#fff", fontSize: 16, fontWeight: "700" },
});
