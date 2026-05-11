import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import { Building2, Home, Zap, Star, MapPin } from "lucide-react-native";
import { useLocation } from "@/hooks/useLocation";
import { useStudios } from "@/hooks/useStudios";
import type { Studio } from "@studioradar/shared";

const { width } = Dimensions.get("window");

type FilterType = "dispo" | "all" | "pro" | "home" | "gratuit";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "dispo",   label: "⚡ Dispo maintenant" },
  { id: "all",     label: "Tous" },
  { id: "pro",     label: "🏢 Pro" },
  { id: "home",    label: "🏠 Home Studio" },
  { id: "gratuit", label: "Gratuit" },
];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("dispo");
  const [selected, setSelected]         = useState<Studio | null>(null);

  const { coords, loading: locLoading } = useLocation();
  const { studios, loading: studiosLoading } = useStudios({
    lat:           coords?.lat,
    lng:           coords?.lng,
    radiusKm:      10,
    availableOnly: activeFilter === "dispo",
    type:          activeFilter === "pro" ? "pro" : activeFilter === "home" ? "home" : undefined,
  });

  const filtered = studios.filter((s) => {
    if (activeFilter === "gratuit") return s.is_free;
    return true;
  });

  function centerOnUser() {
    if (!coords) return;
    mapRef.current?.animateToRegion({
      latitude:       coords.lat,
      longitude:      coords.lng,
      latitudeDelta:  0.05,
      longitudeDelta: 0.05,
    }, 500);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.title}>
            Studio<Text style={{ color: "#5478ff" }}>Radar</Text>
          </Text>
        </View>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {studiosLoading ? "Chargement…" : `${filtered.length} studio${filtered.length > 1 ? "s" : ""}`}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chip, activeFilter === f.id && styles.chipActive]}
            onPress={() => { setActiveFilter(f.id); setSelected(null); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, activeFilter === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapWrapper}>
        {locLoading ? (
          <View style={styles.mapLoader}>
            <ActivityIndicator color="#5478ff" size="large" />
            <Text style={styles.mapLoaderText}>Localisation en cours…</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude:       coords?.lat ?? 48.8566,
              longitude:      coords?.lng ?? 2.3522,
              latitudeDelta:  0.08,
              longitudeDelta: 0.08,
            }}
            customMapStyle={DARK_MAP_STYLE}
            showsUserLocation
            showsMyLocationButton={false}
            onPress={() => setSelected(null)}
          >
            {/* Cercle de rayon */}
            {coords && (
              <Circle
                center={{ latitude: coords.lat, longitude: coords.lng }}
                radius={10000}
                strokeColor="rgba(45,78,255,0.2)"
                fillColor="rgba(45,78,255,0.04)"
              />
            )}

            {/* Markers studios */}
            {filtered.map((studio) => (
              <Marker
                key={studio.id}
                coordinate={{ latitude: studio.lat, longitude: studio.lng }}
                onPress={() => setSelected(studio)}
              >
                <View style={[
                  styles.marker,
                  studio.is_available_now && styles.markerAvail,
                  selected?.id === studio.id && styles.markerSelected,
                ]}>
                  {studio.type === "pro"
                    ? <Building2 size={14} color={studio.is_available_now ? "#000" : "#fff"} />
                    : <Home      size={14} color={studio.is_available_now ? "#000" : "#fff"} />
                  }
                  {studio.is_available_now && (
                    <View style={styles.markerDot} />
                  )}
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Bouton recentrer */}
        <TouchableOpacity style={styles.centerBtn} onPress={centerOnUser}>
          <MapPin size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Liste studios */}
      <View style={styles.listContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingVertical: 4 }}
        >
          {studiosLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#5478ff" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun studio trouvé dans ce rayon</Text>
            </View>
          ) : (
            filtered.map((studio) => (
              <StudioCard
                key={studio.id}
                studio={studio}
                selected={selected?.id === studio.id}
                onPress={() => {
                  setSelected(studio);
                  mapRef.current?.animateToRegion({
                    latitude:       studio.lat,
                    longitude:      studio.lng,
                    latitudeDelta:  0.02,
                    longitudeDelta: 0.02,
                  }, 400);
                }}
                onBook={() => router.push(`/studio/${studio.id}`)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function StudioCard({
  studio, selected, onPress, onBook,
}: {
  studio: Studio;
  selected: boolean;
  onPress: () => void;
  onBook: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Dispo indicator */}
      {studio.is_available_now && (
        <View style={styles.availBadge}>
          <View style={styles.availDot} />
          <Text style={styles.availText}>Dispo</Text>
        </View>
      )}

      {/* Icon */}
      <View style={[
        styles.cardIcon,
        { backgroundColor: studio.type === "pro" ? "rgba(26,48,245,0.15)" : "rgba(0,170,85,0.15)" },
      ]}>
        {studio.type === "pro"
          ? <Building2 size={22} color="#5478ff" />
          : <Home      size={22} color="#00ff88" />
        }
      </View>

      <Text style={styles.cardName} numberOfLines={1}>{studio.name}</Text>
      <Text style={styles.cardCity}>{studio.city}</Text>

      <View style={styles.cardMeta}>
        {studio.rating && (
          <View style={styles.ratingRow}>
            <Star size={11} color="#facc15" />
            <Text style={styles.ratingText}>{studio.rating}</Text>
          </View>
        )}
        <Text style={styles.cardPrice}>
          {studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h`}
        </Text>
      </View>

      <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>Voir</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0a0a1a" },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 12 },
  greeting:        { fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 2 },
  title:           { fontSize: 24, fontWeight: "900", color: "#fff" },
  liveChip:        { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,255,136,0.08)", borderWidth: 1, borderColor: "rgba(0,255,136,0.25)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00ff88" },
  liveText:        { color: "#00ff88", fontSize: 12, fontWeight: "600" },
  filtersScroll:   { marginBottom: 10 },
  chip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  chipActive:      { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  chipText:        { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  chipTextActive:  { color: "#fff" },
  mapWrapper:      { flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: "hidden", position: "relative" },
  map:             { flex: 1 },
  mapLoader:       { flex: 1, backgroundColor: "#0d0d2b", alignItems: "center", justifyContent: "center", gap: 12 },
  mapLoaderText:   { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  centerBtn:       { position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(10,10,26,0.85)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  marker:          { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  markerAvail:     { backgroundColor: "#00ff88", borderColor: "#00ff88" },
  markerSelected:  { transform: [{ scale: 1.25 }], borderColor: "#fff" },
  markerDot:       { position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff", borderWidth: 1, borderColor: "#00ff88" },
  listContainer:   { paddingVertical: 12 },
  loadingCard:     { width: 180, height: 140, backgroundColor: "#12122a", borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyCard:       { width: width - 40, height: 80, backgroundColor: "#12122a", borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyText:       { color: "rgba(255,255,255,0.35)", fontSize: 14 },
  card:            { width: 180, backgroundColor: "#12122a", borderRadius: 18, padding: 14, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", position: "relative" },
  cardSelected:    { borderColor: "#2d4eff" },
  availBadge:      { position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,255,136,0.12)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  availDot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: "#00ff88" },
  availText:       { color: "#00ff88", fontSize: 10, fontWeight: "700" },
  cardIcon:        { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  cardName:        { fontSize: 14, fontWeight: "700", color: "#fff" },
  cardCity:        { fontSize: 11, color: "rgba(255,255,255,0.35)" },
  cardMeta:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  ratingRow:       { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText:      { color: "#facc15", fontSize: 11, fontWeight: "600" },
  cardPrice:       { fontSize: 12, fontWeight: "700", color: "#5478ff" },
  bookBtn:         { backgroundColor: "#1a30f5", borderRadius: 10, paddingVertical: 8, alignItems: "center", marginTop: 4 },
  bookBtnText:     { color: "#fff", fontSize: 13, fontWeight: "700" },
});

// Style sombre pour MapView
const DARK_MAP_STYLE = [
  { elementType: "geometry",            stylers: [{ color: "#0d0d2b" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#8892b0" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#0a0a1a" }] },
  { featureType: "road",                elementType: "geometry", stylers: [{ color: "#1a1a3e" }] },
  { featureType: "road.highway",        elementType: "geometry", stylers: [{ color: "#1e2057" }] },
  { featureType: "water",               elementType: "geometry", stylers: [{ color: "#050517" }] },
  { featureType: "poi",                 stylers: [{ visibility: "off" }] },
  { featureType: "transit",             stylers: [{ visibility: "off" }] },
  { featureType: "administrative",      elementType: "geometry.stroke", stylers: [{ color: "#2d2d5e" }] },
];
