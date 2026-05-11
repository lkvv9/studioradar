import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useMyStudio } from "@/hooks/useDashboard";
import { ReviewsList } from "@/components/studio/ReviewsList";

export default function DashboardReviewsScreen() {
  const router = useRouter();
  const { studio } = useMyStudio();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Avis reçus</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {studio ? (
          <ReviewsList studioId={studio.id} limit={50} />
        ) : (
          <Text style={styles.empty}>Aucun studio enregistré</Text>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a1a" },
  header:    { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  title:     { fontSize: 20, fontWeight: "800", color: "#fff" },
  content:   { padding: 20 },
  empty:     { color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 40 },
});
