import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, TrendingUp } from "lucide-react-native";
import Svg, { Rect, Line, Text as SvgText, Path } from "react-native-svg";
import { supabase } from "@/lib/supabase/client";
import { useMyStudio } from "@/hooks/useDashboard";

const { width } = Dimensions.get("window");
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const CHART_W = width - 48;
const CHART_H = 160;

interface MonthlyData { month: number; year: number; total: number; count: number; }

export default function EarningsScreen() {
  const router = useRouter();
  const { studio } = useMyStudio();
  const [data, setData]       = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    if (!studio) return;
    supabase
      .from("bookings")
      .select("total_price, created_at")
      .eq("studio_id", studio.id)
      .eq("status", "completed")
      .then(({ data: rows }) => {
        if (!rows) { setLoading(false); return; }

        // Agréger par mois sur les 6 derniers mois
        const map = new Map<string, MonthlyData>();
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          map.set(key, { month: d.getMonth(), year: d.getFullYear(), total: 0, count: 0 });
        }

        rows.forEach((r: { total_price: number; created_at: string }) => {
          const d   = new Date(r.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (map.has(key)) {
            const entry = map.get(key)!;
            entry.total += r.total_price ?? 0;
            entry.count += 1;
          }
        });

        const arr = Array.from(map.values());
        setData(arr);
        setTotal(rows.reduce((s, r) => s + (r.total_price ?? 0), 0));
        setLoading(false);
      });
  }, [studio?.id]);

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const barW   = (CHART_W - 40) / Math.max(data.length, 1);

  // Courbe de tendance (path SVG)
  const points = data.map((d, i) => ({
    x: 20 + i * barW + barW / 2,
    y: CHART_H - 20 - ((d.total / maxVal) * (CHART_H - 40)),
  }));
  const pathD = points.length
    ? points.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "")
    : "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Revenus</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <TrendingUp size={24} color="#00ff88" />
          </View>
          <Text style={styles.totalLabel}>Total encaissé</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("fr-FR")} €</Text>
        </View>

        {/* Graphique */}
        <Text style={styles.sectionTitle}>6 derniers mois</Text>
        <View style={styles.chartCard}>
          {loading ? (
            <ActivityIndicator color="#5478ff" style={{ paddingVertical: 40 }} />
          ) : (
            <Svg width={CHART_W} height={CHART_H + 30}>
              {/* Grille */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <Line
                  key={ratio}
                  x1={20} y1={CHART_H - 20 - ratio * (CHART_H - 40)}
                  x2={CHART_W - 20} y2={CHART_H - 20 - ratio * (CHART_H - 40)}
                  stroke="rgba(255,255,255,0.05)" strokeWidth={1}
                />
              ))}

              {/* Barres */}
              {data.map((d, i) => {
                const h  = (d.total / maxVal) * (CHART_H - 40);
                const x  = 20 + i * barW + barW * 0.1;
                const bw = barW * 0.8;
                return (
                  <Rect
                    key={i}
                    x={x} y={CHART_H - 20 - h}
                    width={bw} height={Math.max(h, 2)}
                    rx={6}
                    fill={i === data.length - 1 ? "#2d4eff" : "rgba(45,78,255,0.35)"}
                  />
                );
              })}

              {/* Courbe */}
              {pathD && (
                <Path d={pathD} stroke="#00ff88" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Labels mois */}
              {data.map((d, i) => (
                <SvgText
                  key={i}
                  x={20 + i * barW + barW / 2}
                  y={CHART_H + 16}
                  fontSize={10}
                  fill="rgba(255,255,255,0.3)"
                  textAnchor="middle"
                >
                  {MONTHS[d.month]}
                </SvgText>
              ))}
            </Svg>
          )}
        </View>

        {/* Détail mensuel */}
        <Text style={styles.sectionTitle}>Détail</Text>
        <View style={styles.detailList}>
          {[...data].reverse().map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailMonth}>
                {MONTHS[d.month]} {d.year}
              </Text>
              <Text style={styles.detailCount}>{d.count} session{d.count > 1 ? "s" : ""}</Text>
              <Text style={[styles.detailTotal, d.total > 0 && { color: "#00ff88" }]}>
                {d.total > 0 ? `${d.total}€` : "–"}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#0a0a1a" },
  header:       { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  title:        { fontSize: 20, fontWeight: "800", color: "#fff" },
  totalCard:    { margin: 20, backgroundColor: "#12122a", borderRadius: 20, padding: 24, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(0,255,136,0.15)" },
  totalIcon:    { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(0,255,136,0.1)", alignItems: "center", justifyContent: "center" },
  totalLabel:   { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  totalValue:   { fontSize: 42, fontWeight: "900", color: "#fff" },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginHorizontal: 20, marginBottom: 12 },
  chartCard:    { marginHorizontal: 20, backgroundColor: "#12122a", borderRadius: 18, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  detailList:   { marginHorizontal: 20, backgroundColor: "#12122a", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  detailRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  detailMonth:  { flex: 1, fontSize: 14, fontWeight: "600", color: "#fff" },
  detailCount:  { fontSize: 13, color: "rgba(255,255,255,0.35)", marginRight: 16 },
  detailTotal:  { fontSize: 15, fontWeight: "700", color: "rgba(255,255,255,0.3)", minWidth: 50, textAlign: "right" },
});
