import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Plus, X } from "lucide-react-native";
import { useMyStudio } from "@/hooks/useDashboard";

const GENRE_OPTIONS = [
  "Hip-hop","Rap","Trap","Drill","Afro","R&B","Soul",
  "Pop","Rock","Indie","Folk","Lo-fi","Jazz","Électro","House","Techno",
];

const EQUIPMENT_SUGGESTIONS = [
  "Pro Tools","Logic Pro X","Ableton Live","FL Studio",
  "Neve 8078","SSL 4000","API 2500",
  "Neumann U87","AKG C414","Rode NT1","SM7B",
  "Focusrite Scarlett","Universal Audio Apollo",
  "Yamaha NS10","Focal Alpha","KRK Rokit",
];

export default function StudioEditScreen() {
  const router = useRouter();
  const { studio, loading, updateStudio } = useMyStudio();
  const [saving, setSaving] = useState(false);

  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [hourlyRate, setRate]       = useState("");
  const [address, setAddress]       = useState("");
  const [city, setCity]             = useState("");
  const [genres, setGenres]         = useState<string[]>([]);
  const [equipment, setEquipment]   = useState<string[]>([]);
  const [newEquip, setNewEquip]     = useState("");

  useEffect(() => {
    if (!studio) return;
    setName(studio.name);
    setDesc(studio.description ?? "");
    setRate(studio.hourly_rate?.toString() ?? "");
    setAddress(studio.address ?? "");
    setCity(studio.city ?? "");
    setGenres(studio.genres ?? []);
    setEquipment(studio.equipment ?? []);
  }, [studio]);

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function addEquipment() {
    const v = newEquip.trim();
    if (!v || equipment.includes(v)) return;
    setEquipment((prev) => [...prev, v]);
    setNewEquip("");
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert("Champ requis", "Le nom est obligatoire."); return; }
    setSaving(true);
    const { error } = await updateStudio({
      name:        name.trim(),
      description: description.trim(),
      hourly_rate: parseFloat(hourlyRate) || 0,
      is_free:     !parseFloat(hourlyRate),
      address:     address.trim(),
      city:        city.trim(),
      genres,
      equipment,
    });
    setSaving(false);
    if (error) Alert.alert("Erreur", error);
    else router.back();
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#5478ff" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon studio</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnLoading]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <><Check size={16} color="#fff" /><Text style={styles.saveBtnText}>Sauvegarder</Text></>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Infos de base */}
        <Section title="Informations">
          <Field label="Nom du studio" required>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Studio Nova"
              placeholderTextColor="rgba(255,255,255,0.2)"
            />
          </Field>

          <Field label="Description">
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={description}
              onChangeText={setDesc}
              placeholder="Décris ton studio, son ambiance, ses points forts…"
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Field>

          <Field label="Tarif horaire (€)" hint="Laisse 0 pour gratuit">
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setRate}
              placeholder="Ex: 30"
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="numeric"
            />
          </Field>
        </Section>

        {/* Localisation */}
        <Section title="Localisation">
          <Field label="Adresse">
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Rue et numéro"
              placeholderTextColor="rgba(255,255,255,0.2)"
            />
          </Field>
          <Field label="Ville">
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Paris, Lyon…"
              placeholderTextColor="rgba(255,255,255,0.2)"
            />
          </Field>
        </Section>

        {/* Genres */}
        <Section title="Genres musicaux">
          <View style={styles.tagsGrid}>
            {GENRE_OPTIONS.map((g) => {
              const active = genres.includes(g);
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => toggleGenre(g)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Équipement */}
        <Section title="Équipement">
          {/* Suggestions */}
          <Text style={styles.hint}>Suggestions :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
            {EQUIPMENT_SUGGESTIONS.filter((e) => !equipment.includes(e)).map((e) => (
              <TouchableOpacity
                key={e}
                style={styles.suggTag}
                onPress={() => setEquipment((prev) => [...prev, e])}
              >
                <Plus size={11} color="rgba(255,255,255,0.5)" />
                <Text style={styles.suggTagText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Équipements sélectionnés */}
          <View style={styles.tagsGrid}>
            {equipment.map((e) => (
              <TouchableOpacity
                key={e}
                style={styles.equipTag}
                onPress={() => setEquipment((prev) => prev.filter((x) => x !== e))}
              >
                <Text style={styles.equipTagText}>{e}</Text>
                <X size={12} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Ajout manuel */}
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newEquip}
              onChangeText={setNewEquip}
              placeholder="Ajouter un équipement…"
              placeholderTextColor="rgba(255,255,255,0.2)"
              onSubmitEditing={addEquipment}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addEquipment}>
              <Plus size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Section>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabel}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0a0a1a" },
  loader:         { flex: 1, backgroundColor: "#0a0a1a", alignItems: "center", justifyContent: "center" },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  headerTitle:    { flex: 1, fontSize: 18, fontWeight: "800", color: "#fff" },
  saveBtn:        { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1a30f5", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText:    { color: "#fff", fontWeight: "700", fontSize: 14 },
  section:        { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle:   { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  sectionBody:    { gap: 12 },
  field:          { gap: 8 },
  fieldLabel:     { flexDirection: "row", alignItems: "center", gap: 6 },
  label:          { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  required:       { color: "#5478ff", fontWeight: "700" },
  hint:           { fontSize: 11, color: "rgba(255,255,255,0.25)" },
  input:          { backgroundColor: "#12122a", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: "#fff", fontSize: 15 },
  inputMulti:     { minHeight: 100, paddingTop: 13 },
  tagsGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  tagActive:      { backgroundColor: "rgba(45,78,255,0.2)", borderColor: "#2d4eff" },
  tagText:        { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "500" },
  tagTextActive:  { color: "#fff", fontWeight: "700" },
  suggTag:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  suggTagText:    { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  equipTag:       { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(45,78,255,0.12)", borderWidth: 1, borderColor: "rgba(45,78,255,0.3)" },
  equipTagText:   { color: "#5478ff", fontSize: 13, fontWeight: "500" },
  addRow:         { flexDirection: "row", gap: 10, marginTop: 8 },
  addBtn:         { width: 48, height: 48, borderRadius: 14, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
});
