import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react-native";
import { useMyStudio, useIncomingBookings } from "@/hooks/useDashboard";

const DAYS   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function fmt(iso: string) {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}h00`;
}
function dur(s: string, e: string) { return Math.round((new Date(e).getTime() - new Date(s).getTime()) / 3600000); }

const STATUS = {
  pending:   { label: "En attente", color: "#facc15", icon: <Clock    size={13} color="#facc15" /> },
  confirmed: { label: "Confirmée",  color: "#00ff88", icon: <CheckCircle2 size={13} color="#00ff88" /> },
  cancelled: { label: "Annulée",    color: "#ef4444", icon: <XCircle  size={13} color="#ef4444" /> },
  completed: { label: "Terminée",   color: "rgba(255,255,255,0.3)", icon: <CheckCircle2 size={13} color="rgba(255,255,255,0.3)" /> },
};

export default function DashboardBookingsScreen() {
  const router = useRouter();
  const { studio } = useMyStudio();
  const { bookings, acceptBooking, declineBooking } = useIncomingBookings(studio?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Réservations</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View style={styles.empty}>
            <Calendar size={44} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>Aucune réservation</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {bookings.map((b) => {
              const st = STATUS[b.status as keyof typeof STATUS] ?? STATUS.pending;
              return (
                <View key={b.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.slot}>{fmt(b.start_time)}</Text>
                      <Text style={styles.meta}>{dur(b.start_time, b.end_time)}h · {b.total_price ? `${b.total_price}€` : "Gratuit"}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: st.color + "18" }]}>
                      {st.icon}
                      <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  {b.notes ? <Text style={styles.notes}>📝 {b.notes}</Text> : null}
                  {b.status === "pending" && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.decline} onPress={() => declineBooking(b.id)}>
                        <Text style={styles.declineText}>Refuser</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.accept} onPress={() => acceptBooking(b.id)}>
                        <Text style={styles.acceptText}>Accepter</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#0a0a1a" },
  header:     { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  title:      { fontSize: 20, fontWeight: "800", color: "#fff" },
  empty:      { alignItems: "center", gap: 12, paddingTop: 80 },
  emptyText:  { color: "rgba(255,255,255,0.25)", fontSize: 15 },
  list:       { padding: 20, gap: 12 },
  card:       { backgroundColor: "#12122a", borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  cardTop:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  slot:       { fontSize: 14, fontWeight: "700", color: "#fff" },
  meta:       { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  badge:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText:  { fontSize: 11, fontWeight: "700" },
  notes:      { fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic" },
  actions:    { flexDirection: "row", gap: 10 },
  decline:    { flex: 1, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  declineText:{ color: "#ef4444", fontWeight: "600", fontSize: 13 },
  accept:     { flex: 1, backgroundColor: "#1a30f5", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  acceptText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
