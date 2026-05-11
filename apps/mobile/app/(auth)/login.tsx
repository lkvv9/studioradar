import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }
    router.replace("/(tabs)/map");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.sub}>Heureux de te revoir 👋</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="toi@example.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!email || !password || loading) && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={!email || !password || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>
            Pas de compte ?{" "}
            <Text style={{ color: "#5478ff" }}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#0a0a1a" },
  back:       { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText:   { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  inner:      { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title:      { fontSize: 32, fontWeight: "900", color: "#fff", marginBottom: 8 },
  sub:        { fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 36 },
  error:      { backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 },
  fields:     { gap: 16, marginBottom: 28 },
  field:      { gap: 8 },
  label:      { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  input:      { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15 },
  btn:        { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginBottom: 20 },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: "#fff", fontSize: 16, fontWeight: "700" },
  link:       { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 },
});
