import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Settings, Star, Calendar, Heart, ChevronRight, LogOut, Mic2, Radio } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();

  const stats = [
    { label: "Réservations", value: "3" },
    { label: "Matches",      value: "12" },
    { label: "Avis donnés",  value: "5" },
  ];

  const menuItems = [
    { icon: <Calendar size={18} color="#5478ff" />, label: "Mes réservations", onPress: () => router.push("/my-bookings") },
    { icon: <Heart    size={18} color="#f472b6" />, label: "Mes matches",       onPress: () => {} },
    { icon: <Star     size={18} color="#facc15" />, label: "Mes avis",           onPress: () => {} },
    { icon: <Mic2     size={18} color="#00ff88" />, label: "Mon studio",         onPress: () => {} },
    { icon: <Settings size={18} color="rgba(255,255,255,0.4)" />, label: "Paramètres", onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBg}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Profil</Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>A</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
          </View>

          <Text style={styles.name}>Artiste</Text>
          <View style={styles.roleChip}>
            <Radio size={12} color="#5478ff" />
            <Text style={styles.roleText}>Artiste · Paris</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes genres</Text>
          <View style={styles.genresRow}>
            {["Hip-hop", "R&B", "Trap", "Soul"].map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addTag}>
              <Text style={styles.addTagText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>{item.icon}</View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/(auth)/welcome")}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0a0a1a" },
  headerBg:       { backgroundColor: "#0d0d28", paddingBottom: 28, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  header:         { width: "100%", paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20 },
  screenTitle:    { fontSize: 26, fontWeight: "900", color: "#fff" },
  avatarSection:  { position: "relative", marginBottom: 12 },
  avatar:         { width: 88, height: 88, borderRadius: 44, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
  avatarInitial:  { fontSize: 36, fontWeight: "900", color: "#fff" },
  liveIndicator:  { position: "absolute", bottom: 4, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: "#0d0d28", alignItems: "center", justifyContent: "center" },
  liveDot:        { width: 12, height: 12, borderRadius: 6, backgroundColor: "#00ff88" },
  name:           { fontSize: 22, fontWeight: "900", color: "#fff", marginBottom: 8 },
  roleChip:       { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(84,120,255,0.1)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText:       { color: "#5478ff", fontSize: 13, fontWeight: "600" },
  statsRow:       { flexDirection: "row", paddingHorizontal: 24, paddingVertical: 20, gap: 0 },
  statItem:       { flex: 1, alignItems: "center", gap: 4 },
  statValue:      { fontSize: 24, fontWeight: "900", color: "#fff" },
  statLabel:      { fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" },
  section:        { paddingHorizontal: 24, marginTop: 8, marginBottom: 4 },
  sectionTitle:   { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.35)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 },
  genresRow:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreTag:       { backgroundColor: "rgba(45,78,255,0.12)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  genreText:      { color: "#5478ff", fontSize: 13, fontWeight: "600" },
  addTag:         { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderStyle: "dashed" },
  addTagText:     { color: "rgba(255,255,255,0.35)", fontSize: 13 },
  menu:           { backgroundColor: "#12122a", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  menuItem:       { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  menuIcon:       { width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  menuLabel:      { flex: 1, color: "#fff", fontSize: 15, fontWeight: "500" },
  logoutBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 24, marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.15)" },
  logoutText:     { color: "#ef4444", fontSize: 15, fontWeight: "700" },
});
