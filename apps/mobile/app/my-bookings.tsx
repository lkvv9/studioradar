import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Calendar, Clock, Building2, Home, CheckCircle2, XCircle, AlertCircle } from "lucide-react-native";
import type { BookingWithStudio } from "@studioradar/shared";

// Mock data — à remplacer par GET /api/bookings
const MOCK_BOOKINGS: BookingWithStudio[] = [
  {
    id: "b1",
    studio_id: "1",
    artist_id: "me",
    start_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    end_time:   new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    status: "confirmed",
    total_price: 135,
    notes: "Session album, besoin d'un micro Neumann",
    created_at: new Date().toISOString(),
    studio: { id: "1", name: "Studio Nova", type: "pro", hourly_rate: 45, city: "Paris", address: "12 rue de la Musique" },
  },
  {
    id: "b2",
    studio_id: "3",
    artist_id: "me",
    start_time: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    end_time:   new Date(Date.now() - 2 * 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
    status: "completed",
    total_price: 20,
    created_at: new Date().toISOString(),
    studio: { id: "3", name: "Chez Julien", type: "home", hourly_rate: 10, city: "Montreuil", address: "Montreuil" },
  },
  {
    id: "b3",
    studio_id: "2",
    artist_id: "me",
    start_time: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    end_time:   new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    status: "cancelled",
    total_price: 30,
    created_at: new Date().toISOString(),
    studio: { id: "2", name: "Frequency Studio", type: "pro", hourly_rate: 30, city: "Paris", address: "5 passage Verdeau" },
  },
];

const STATUS_CONFIG = {
  confirmed:  { label: "Confirmée",  color: "#00ff88", bg: "rgba(0,255,136,0.1)", icon: <CheckCircle2 size={14} color="#00ff88" /> },
  pending:    { label: "En attente", color: "#facc15", bg: "rgba(250,204,21,0.1)", icon: <AlertCircle size={14} color="#facc15" /> },
  completed:  { label: "Terminée",   color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)", icon: <CheckCircle2 size={14} color="rgba(255,255,255,0.3)" /> },
  cancelled:  { label: "Annulée",    color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={14} color="#ef4444" /> },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const days = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const months = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}:00`;
}

function durationHours(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3600000);
}

export default function MyBookingsScreen() {
  const router = useRouter();

  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past     = MOCK_BOOKINGS.filter((b) => b.status === "completed" || b.status === "cancelled");

  function handleCancel(id: string) {
    Alert.alert(
      "Annuler la réservation",
      "Es-tu sûr de vouloir annuler ? Si la session est dans moins de 24h, des frais peuvent s'appliquer.",
      [
        { text: "Garder", style: "cancel" },
        { text: "Annuler la session", style: "destructive", onPress: () => {
          // TODO: DELETE /api/bookings?id=...
        }},
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes réservations</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {upcoming.length > 0 && (
          <Section title="À venir">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Historique">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </Section>
        )}

        {MOCK_BOOKINGS.length === 0 && (
          <View style={styles.empty}>
            <Calendar size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySub}>Trouve un studio sur le Radar !</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.replace("/(tabs)/map")}
            >
              <Text style={styles.emptyBtnText}>Voir les studios</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionList}>{children}</View>
    </View>
  );
}

function BookingCard({ booking, onCancel }: { booking: BookingWithStudio; onCancel?: () => void }) {
  const status = STATUS_CONFIG[booking.status];
  const duration = durationHours(booking.start_time, booking.end_time);
  const isPro = booking.studio.type === "pro";
  const isUpcoming = booking.status === "confirmed" || booking.status === "pending";

  return (
    <View style={styles.card}>
      {/* Top */}
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: isPro ? "rgba(26,48,245,0.15)" : "rgba(0,170,85,0.15)" }]}>
          {isPro
            ? <Building2 size={20} color="#5478ff" />
            : <Home size={20} color="#00ff88" />
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardStudio}>{booking.studio.name}</Text>
          <Text style={styles.cardAddress}>{booking.studio.city}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          {status.icon}
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Calendar size={13} color="rgba(255,255,255,0.35)" />
          <Text style={styles.detailText}>{formatDateTime(booking.start_time)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={13} color="rgba(255,255,255,0.35)" />
          <Text style={styles.detailText}>{duration}h de session</Text>
        </View>
      </View>

      {/* Prix + action */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>
          {booking.total_price === 0 ? "Gratuit" : `${booking.total_price}€`}
        </Text>
        {isUpcoming && onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        )}
        {booking.status === "completed" && (
          <TouchableOpacity style={styles.reviewBtn}>
            <Text style={styles.reviewBtnText}>Laisser un avis</Text>
          </TouchableOpacity>
        )}
      </View>

      {booking.notes ? (
        <Text style={styles.notes} numberOfLines={1}>📝 {booking.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0a0a1a" },
  header:         { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  title:          { fontSize: 20, fontWeight: "800", color: "#fff" },
  section:        { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle:   { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  sectionList:    { gap: 12 },
  card:           { backgroundColor: "#12122a", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12 },
  cardTop:        { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon:       { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardStudio:     { fontSize: 15, fontWeight: "700", color: "#fff" },
  cardAddress:    { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  statusBadge:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText:     { fontSize: 11, fontWeight: "700" },
  cardDetails:    { gap: 6 },
  detailItem:     { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText:     { color: "rgba(255,255,255,0.55)", fontSize: 13 },
  cardFooter:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardPrice:      { fontSize: 18, fontWeight: "900", color: "#5478ff" },
  cancelBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)" },
  cancelBtnText:  { color: "#ef4444", fontSize: 13, fontWeight: "600" },
  reviewBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(45,78,255,0.12)" },
  reviewBtnText:  { color: "#5478ff", fontSize: 13, fontWeight: "600" },
  notes:          { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  empty:          { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle:     { fontSize: 20, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  emptySub:       { fontSize: 14, color: "rgba(255,255,255,0.2)" },
  emptyBtn:       { marginTop: 12, backgroundColor: "rgba(45,78,255,0.15)", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText:   { color: "#5478ff", fontWeight: "600" },
});
