import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  TrendingUp, Calendar, Star, Clock,
  ChevronRight, Settings, Building2, Home,
  CheckCircle2, XCircle, AlertCircle, Zap,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useMyStudio, useIncomingBookings, useDashboardStats } from "@/hooks/useDashboard";
import { useAuth } from "@/providers/AuthProvider";
import { scheduleLocalNotification } from "@/lib/notifications";
import type { BookingWithStudio } from "@studioradar/shared";

const DAYS  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function formatSlot(iso: string) {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}h00`;
}
function durationH(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3600000);
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { studio, loading: studioLoading, toggleAvailability } = useMyStudio();
  const { bookings, acceptBooking, declineBooking } = useIncomingBookings(studio?.id);
  const stats = useDashboardStats(studio?.id);

  const pending   = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  async function handleToggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleAvailability();
  }

  async function handleAccept(b: BookingWithStudio) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await acceptBooking(b.id);
    await scheduleLocalNotification({
      title: "✅ Réservation acceptée",
      body:  `${formatSlot(b.start_time)} · ${durationH(b.start_time, b.end_time)}h`,
    });
  }

  async function handleDecline(b: BookingWithStudio) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await declineBooking(b.id);
  }

  if (studioLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#5478ff" size="large" />
      </View>
    );
  }

  // Pas encore de studio enregistré
  if (!studio) {
    return (
      <View style={styles.noStudio}>
        <Building2 size={56} color="rgba(255,255,255,0.15)" />
        <Text style={styles.noStudioTitle}>Pas encore de studio</Text>
        <Text style={styles.noStudioSub}>
          Inscris ton studio pour commencer à recevoir des réservations.
        </Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push("/dashboard/studio-edit")}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>Créer mon studio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Mon studio</Text>
          <Text style={styles.studioName}>{studio.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/dashboard/studio-edit")}
        >
          <Settings size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Toggle disponibilité */}
        <Animated.View entering={FadeInDown.delay(0).duration(300)}>
          <View style={[styles.availCard, studio.is_available_now && styles.availCardOn]}>
            <View style={styles.availLeft}>
              <View style={[styles.availDot, studio.is_available_now && styles.availDotOn]} />
              <View>
                <Text style={styles.availTitle}>
                  {studio.is_available_now ? "Disponible maintenant" : "Non disponible"}
                </Text>
                <Text style={styles.availSub}>
                  {studio.is_available_now
                    ? "Ton studio apparaît sur le Radar"
                    : "Les artistes ne voient pas ton studio"}
                </Text>
              </View>
            </View>
            <Switch
              value={studio.is_available_now}
              onValueChange={handleToggle}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: "#00ff88" }}
              thumbColor="#fff"
            />
          </View>
        </Animated.View>

        {/* Stats du mois */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <Text style={styles.sectionTitle}>Ce mois-ci</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<TrendingUp size={18} color="#00ff88" />}
              value={`${stats.earningsMonth}€`}
              label="Revenus"
              color="#00ff88"
            />
            <StatCard
              icon={<Calendar size={18} color="#5478ff" />}
              value={String(stats.bookingsMonth)}
              label="Sessions"
              color="#5478ff"
            />
            <StatCard
              icon={<Star size={18} color="#facc15" />}
              value={stats.rating ? stats.rating.toFixed(1) : "–"}
              label={`${stats.reviewsCount} avis`}
              color="#facc15"
            />
            <StatCard
              icon={<Zap size={18} color="#f472b6" />}
              value={String(stats.bookingsPending)}
              label="En attente"
              color="#f472b6"
            />
          </View>
        </Animated.View>

        {/* Réservations en attente */}
        {pending.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).duration(300)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>En attente</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending.length}</Text>
              </View>
            </View>
            <View style={styles.bookingsList}>
              {pending.map((b) => (
                <PendingCard
                  key={b.id}
                  booking={b}
                  onAccept={() => handleAccept(b)}
                  onDecline={() => handleDecline(b)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Réservations confirmées à venir */}
        {confirmed.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(300)}>
            <Text style={styles.sectionTitle}>Prochaines sessions</Text>
            <View style={styles.bookingsList}>
              {confirmed.map((b) => (
                <ConfirmedCard key={b.id} booking={b} />
              ))}
            </View>
          </Animated.View>
        )}

        {pending.length === 0 && confirmed.length === 0 && (
          <View style={styles.emptyBookings}>
            <Calendar size={36} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>Aucune réservation en cours</Text>
          </View>
        )}

        {/* Actions rapides */}
        <Animated.View entering={FadeInDown.delay(240).duration(300)}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon={<Calendar size={20} color="#5478ff" />}
              label="Historique"
              sub="Toutes les sessions"
              onPress={() => router.push("/dashboard/bookings")}
            />
            <QuickAction
              icon={<Star size={20} color="#facc15" />}
              label="Avis reçus"
              sub={`${stats.reviewsCount} avis · ${stats.rating ? stats.rating.toFixed(1) : "–"} ⭐`}
              onPress={() => router.push("/dashboard/reviews")}
            />
            <QuickAction
              icon={<TrendingUp size={20} color="#00ff88" />}
              label="Revenus"
              sub={`${stats.earningsTotal}€ au total`}
              onPress={() => router.push("/dashboard/earnings")}
            />
            <QuickAction
              icon={<Settings size={20} color="rgba(255,255,255,0.5)" />}
              label="Mon profil studio"
              sub="Modifier infos & équipement"
              onPress={() => router.push("/dashboard/studio-edit")}
            />
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode; value: string; label: string; color: string;
}) {
  return (
    <View style={[sc.card, { borderColor: color + "22" }]}>
      <View style={[sc.iconWrap, { backgroundColor: color + "15" }]}>{icon}</View>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card:     { flex: 1, backgroundColor: "#12122a", borderRadius: 16, padding: 14, alignItems: "center", gap: 6, borderWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  value:    { fontSize: 22, fontWeight: "900" },
  label:    { fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" },
});

function PendingCard({ booking, onAccept, onDecline }: {
  booking: BookingWithStudio; onAccept: () => void; onDecline: () => void;
}) {
  const dur = durationH(booking.start_time, booking.end_time);
  return (
    <View style={pc.card}>
      <View style={pc.top}>
        <AlertCircle size={16} color="#facc15" />
        <View style={{ flex: 1 }}>
          <Text style={pc.slot}>{formatSlot(booking.start_time)}</Text>
          <Text style={pc.meta}>{dur}h · {booking.total_price ? `${booking.total_price}€` : "Gratuit"}</Text>
        </View>
      </View>
      {booking.notes ? (
        <Text style={pc.notes} numberOfLines={2}>📝 {booking.notes}</Text>
      ) : null}
      <View style={pc.actions}>
        <TouchableOpacity style={pc.declineBtn} onPress={onDecline} activeOpacity={0.8}>
          <XCircle size={16} color="#ef4444" />
          <Text style={pc.declineText}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={pc.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
          <CheckCircle2 size={16} color="#fff" />
          <Text style={pc.acceptText}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const pc = StyleSheet.create({
  card:       { backgroundColor: "#12122a", borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: "rgba(250,204,21,0.2)" },
  top:        { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  slot:       { fontSize: 14, fontWeight: "700", color: "#fff" },
  meta:       { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  notes:      { fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic" },
  actions:    { flexDirection: "row", gap: 10 },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", borderRadius: 12, paddingVertical: 10 },
  declineText:{ color: "#ef4444", fontWeight: "600", fontSize: 13 },
  acceptBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#1a30f5", borderRadius: 12, paddingVertical: 10 },
  acceptText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});

function ConfirmedCard({ booking }: { booking: BookingWithStudio }) {
  const dur = durationH(booking.start_time, booking.end_time);
  return (
    <View style={cc.card}>
      <View style={cc.dot} />
      <View style={{ flex: 1 }}>
        <Text style={cc.slot}>{formatSlot(booking.start_time)}</Text>
        <Text style={cc.meta}>{dur}h · {booking.total_price ? `${booking.total_price}€` : "Gratuit"}</Text>
      </View>
      <CheckCircle2 size={18} color="#00ff88" />
    </View>
  );
}
const cc = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#12122a", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(0,255,136,0.12)" },
  dot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00ff88" },
  slot: { fontSize: 14, fontWeight: "600", color: "#fff" },
  meta: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
});

function QuickAction({ icon, label, sub, onPress }: {
  icon: React.ReactNode; label: string; sub: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={qa.item} onPress={onPress} activeOpacity={0.75}>
      <View style={qa.icon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={qa.label}>{label}</Text>
        <Text style={qa.sub}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );
}
const qa = StyleSheet.create({
  item:  { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#12122a", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  icon:  { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  label: { fontSize: 15, fontWeight: "600", color: "#fff" },
  sub:   { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
});

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0a0a1a" },
  loader:         { flex: 1, backgroundColor: "#0a0a1a", alignItems: "center", justifyContent: "center" },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16 },
  greeting:       { fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 2 },
  studioName:     { fontSize: 24, fontWeight: "900", color: "#fff" },
  settingsBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  availCard:      { marginHorizontal: 20, marginBottom: 8, backgroundColor: "#12122a", borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  availCardOn:    { borderColor: "rgba(0,255,136,0.3)", backgroundColor: "rgba(0,255,136,0.05)" },
  availLeft:      { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  availDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.2)" },
  availDotOn:     { backgroundColor: "#00ff88" },
  availTitle:     { fontSize: 15, fontWeight: "700", color: "#fff" },
  availSub:       { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  sectionTitle:   { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionHeader:  { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  badge:          { backgroundColor: "#facc15", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:      { color: "#000", fontSize: 11, fontWeight: "800" },
  statsGrid:      { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
  bookingsList:   { paddingHorizontal: 20, gap: 10 },
  quickActions:   { paddingHorizontal: 20, gap: 10 },
  emptyBookings:  { alignItems: "center", gap: 10, paddingVertical: 24 },
  emptyText:      { color: "rgba(255,255,255,0.25)", fontSize: 14 },
  noStudio:       { flex: 1, backgroundColor: "#0a0a1a", alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  noStudioTitle:  { fontSize: 24, fontWeight: "900", color: "#fff" },
  noStudioSub:    { fontSize: 15, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 22 },
  createBtn:      { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  createBtnText:  { color: "#fff", fontSize: 16, fontWeight: "700" },
});
