import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@studioradar/shared";

const ROLES: { value: UserRole; emoji: string; label: string; description: string }[] = [
  { value: "artist",      emoji: "🎤", label: "Artiste",      description: "Je cherche un studio" },
  { value: "pro_studio",  emoji: "🏢", label: "Studio Pro",   description: "J'ai un studio pro" },
  { value: "home_studio", emoji: "🏠", label: "Home Studio",  description: "J'ai un setup chez moi" },
  { value: "music_lover", emoji: "🎵", label: "Passionné",    description: "Je veux juste connecter" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>("artist");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) return;
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    if (error) {
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => (step === 2 ? setStep(1) : router.back())}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progress}>
          {[1, 2].map((s) => (
            <View
              key={s}
              style={[styles.progressBar, s <= step && styles.progressActive]}
            />
          ))}
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.title}>Tu es…</Text>
            <Text style={styles.sub}>
              Choisis ton profil pour personnaliser l'expérience
            </Text>
            <View style={styles.roles}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, role === r.value && { color: "#fff" }]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setStep(2)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Créer ton compte</Text>
            <Text style={styles.sub}>Presque terminé 🎤</Text>

            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={styles.label}>Nom ou pseudo</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Comment tu t'appelles ?"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  autoCapitalize="words"
                />
              </View>
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
                  placeholder="8 caractères minimum"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, (!fullName || !email || !password || loading) && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={!fullName || !email || !password || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.link}>
            Déjà un compte ?{" "}
            <Text style={{ color: "#5478ff" }}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0a0a1a" },
  scroll:          { flexGrow: 1, paddingBottom: 40 },
  back:            { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText:        { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  progress:        { flexDirection: "row", gap: 8, paddingHorizontal: 24, marginBottom: 32 },
  progressBar:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive:  { backgroundColor: "#1a30f5" },
  title:           { fontSize: 32, fontWeight: "900", color: "#fff", paddingHorizontal: 24, marginBottom: 8 },
  sub:             { fontSize: 15, color: "rgba(255,255,255,0.4)", paddingHorizontal: 24, marginBottom: 28 },
  roles:           { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 24, marginBottom: 28 },
  roleCard:        { width: "47%", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 },
  roleCardActive:  { borderColor: "#2d4eff", backgroundColor: "rgba(45,78,255,0.1)" },
  roleEmoji:       { fontSize: 28, marginBottom: 8 },
  roleLabel:       { fontSize: 15, fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  roleDesc:        { fontSize: 12, color: "rgba(255,255,255,0.35)" },
  fields:          { gap: 16, paddingHorizontal: 24, marginBottom: 28 },
  field:           { gap: 8 },
  label:           { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  input:           { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15 },
  btn:             { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginHorizontal: 24, marginBottom: 20 },
  btnDisabled:     { opacity: 0.5 },
  btnText:         { color: "#fff", fontSize: 16, fontWeight: "700" },
  link:            { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 },
});
