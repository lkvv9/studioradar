import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1
    );
    pulse.value = withRepeat(
      withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0a0a1a", "#0d1035", "#0a0a1a"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Radar visuel */}
      <View style={styles.radarContainer}>
        <Svg width={300} height={300} viewBox="0 0 300 300">
          {/* Cercles */}
          {[40, 80, 120, 150].map((r) => (
            <Circle
              key={r}
              cx={150}
              cy={150}
              r={r}
              stroke="#2d4eff"
              strokeWidth={0.5}
              fill="none"
              opacity={0.2}
            />
          ))}
          {/* Croix */}
          <Line x1={150} y1={0} x2={150} y2={300} stroke="#2d4eff" strokeWidth={0.3} opacity={0.15} />
          <Line x1={0} y1={150} x2={300} y2={150} stroke="#2d4eff" strokeWidth={0.3} opacity={0.15} />
        </Svg>

        {/* Sweep animé */}
        <Animated.View style={[styles.sweepWrapper, sweepStyle]}>
          <Svg width={300} height={300} viewBox="0 0 300 300" style={StyleSheet.absoluteFillObject}>
            <Circle
              cx={150}
              cy={150}
              r={150}
              fill="url(#sweep)"
              opacity={0.15}
            />
          </Svg>
          <View style={styles.sweepLine} />
        </Animated.View>

        {/* Point central */}
        <View style={styles.centerDot}>
          <Animated.View style={[styles.centerPulse, pulseStyle]} />
          <View style={styles.centerCore} />
        </View>

        {/* Studio dots */}
        {[
          { top: 70,  left: 180, green: true  },
          { top: 130, left: 60,  green: true  },
          { top: 190, left: 200, green: false },
          { top: 80,  left: 100, green: true  },
        ].map((dot, i) => (
          <View
            key={i}
            style={[
              styles.studioDot,
              {
                top: dot.top,
                left: dot.left,
                backgroundColor: dot.green ? "#00ff88" : "rgba(255,255,255,0.3)",
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>
            Studio<Text style={{ color: "#5478ff" }}>Radar</Text>
          </Text>
        </View>

        <Text style={styles.headline}>
          Ton studio,{"\n"}
          <Text style={{ color: "#5478ff" }}>maintenant.</Text>
        </Text>

        <Text style={styles.sub}>
          Trouve et réserve un studio disponible à l'instant autour de toi.
          Home studios, studios pro, et rencontres musicales.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Commencer gratuitement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0a0a1a" },
  radarContainer:  { alignItems: "center", marginTop: 80, position: "relative", width: 300, alignSelf: "center" },
  sweepWrapper:    { position: "absolute", width: 300, height: 300, alignItems: "center", justifyContent: "center" },
  sweepLine:       { position: "absolute", top: 150, left: 150, width: 150, height: 1, backgroundColor: "#2d4eff", opacity: 0.4, transformOrigin: "left center" },
  centerDot:       { position: "absolute", top: 150 - 8, left: 150 - 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" },
  centerCore:      { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2d4eff" },
  centerPulse:     { position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "#2d4eff", opacity: 0.3 },
  studioDot:       { position: "absolute", width: 8, height: 8, borderRadius: 4 },
  content:         { flex: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: "flex-end" },
  logoRow:         { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  logoDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00ff88" },
  logoText:        { fontSize: 18, fontWeight: "700", color: "#fff", letterSpacing: -0.5 },
  headline:        { fontSize: 42, fontWeight: "900", color: "#fff", letterSpacing: -1.5, lineHeight: 48, marginBottom: 16 },
  sub:             { fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 22, marginBottom: 36 },
  actions:         { gap: 12 },
  primaryBtn:      { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  primaryBtnText:  { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn:    { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, paddingVertical: 18, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  secondaryBtnText:{ color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "600" },
});
