import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, ChevronLeft, ChevronRight, Clock, Calendar, FileText, CheckCircle2, Building2, Home } from "lucide-react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import type { Studio } from "@studioradar/shared";

const { width } = Dimensions.get("window");

// Mock studio data — remplacé par Supabase
const STUDIOS: Record<string, Studio> = {
  "1": { id: "1", owner_id: "u1", name: "Studio Nova", type: "pro", description: "", hourly_rate: 45, is_free: false, is_available_now: true, lat: 0, lng: 0, address: "12 rue de la Musique", city: "Paris", photos: [], equipment: [], genres: [], rating: 4.9, reviews_count: 47, created_at: "", updated_at: "" },
  "2": { id: "2", owner_id: "u2", name: "Frequency Studio", type: "pro", description: "", hourly_rate: 30, is_free: false, is_available_now: true, lat: 0, lng: 0, address: "5 passage Verdeau", city: "Paris", photos: [], equipment: [], genres: [], rating: 4.7, reviews_count: 23, created_at: "", updated_at: "" },
  "3": { id: "3", owner_id: "u3", name: "Chez Julien", type: "home", description: "", hourly_rate: 10, is_free: false, is_available_now: true, lat: 0, lng: 0, address: "Montreuil", city: "Montreuil", photos: [], equipment: [], genres: [], rating: 4.5, reviews_count: 12, created_at: "", updated_at: "" },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7h → 22h
const DURATIONS = [1, 2, 3, 4, 6, 8];

function getDaysFromToday(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAYS = getDaysFromToday(14);

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

// Faux créneaux occupés pour la démo
const BOOKED_HOURS: Record<string, number[]> = {
  "0": [9, 10, 14],
  "1": [11, 12, 13],
  "3": [8, 15, 16],
};

type Step = 1 | 2 | 3 | 4;

export default function BookingScreen() {
  const { studioId } = useLocalSearchParams<{ studioId: string }>();
  const router = useRouter();
  const studio = STUDIOS[studioId] ?? STUDIOS["1"];

  const [step, setStep] = useState<Step>(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const bookedToday = BOOKED_HOURS[String(selectedDayIndex)] ?? [];

  const totalPrice = useMemo(
    () => (studio.hourly_rate ?? 0) * duration,
    [studio.hourly_rate, duration]
  );

  const selectedDay = DAYS[selectedDayIndex];

  function formatDate(d: Date) {
    return `${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
  }

  function nextStep() {
    if (step < 3) setStep((s) => (s + 1) as Step);
  }
  function prevStep() {
    if (step > 1) setStep((s) => (s - 1) as Step);
    else router.back();
  }

  async function confirmBooking() {
    setLoading(true);
    // TODO: appel API /api/payment/create-intent puis Stripe
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setConfirmed(true);
  }

  if (confirmed) {
    return <ConfirmationScreen studio={studio} day={selectedDay} hour={selectedHour!} duration={duration} total={totalPrice} onDone={() => router.replace("/(tabs)/map")} />;
  }

  const canNext =
    step === 1 ? selectedHour !== null :
    step === 2 ? true :
    true;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Réserver</Text>
          <Text style={styles.headerSub}>{studio.name}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        {(["Date & heure", "Durée", "Résumé"] as const).map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepCircle, (i + 1) <= step && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, (i + 1) <= step && styles.stepNumActive]}>
                {i + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, (i + 1) === step && styles.stepLabelActive]}>
              {label}
            </Text>
          </View>
        ))}
        <View style={styles.stepLineLeft} />
        <View style={[styles.stepLineRight, step >= 3 && styles.stepLineActive]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(250)}>
            <Step1
              days={DAYS}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={(i) => { setSelectedDayIndex(i); setSelectedHour(null); }}
              formatDate={formatDate}
              hours={HOURS}
              bookedHours={bookedToday}
              selectedHour={selectedHour}
              onSelectHour={setSelectedHour}
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(250)}>
            <Step2
              durations={DURATIONS}
              duration={duration}
              onSelect={setDuration}
              studio={studio}
              selectedHour={selectedHour!}
              totalPrice={totalPrice}
            />
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight.duration(250)}>
            <Step3
              studio={studio}
              day={selectedDay}
              formatDate={formatDate}
              hour={selectedHour!}
              duration={duration}
              totalPrice={totalPrice}
              notes={notes}
              onNotesChange={setNotes}
            />
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        {step === 3 ? (
          <View style={styles.footerInner}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>
                {studio.is_free ? "Gratuit" : `${totalPrice}€`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
              onPress={confirmBooking}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaBtnText}>
                  {studio.is_free ? "Confirmer" : "Payer & Réserver"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtnFull, !canNext && styles.ctaBtnDisabled]}
            onPress={nextStep}
            disabled={!canNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Continuer</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Step 1 : Date + Heure ─────────────────────────────────────────────────

function Step1({
  days, selectedDayIndex, onSelectDay, formatDate,
  hours, bookedHours, selectedHour, onSelectHour,
}: {
  days: Date[];
  selectedDayIndex: number;
  onSelectDay: (i: number) => void;
  formatDate: (d: Date) => string;
  hours: number[];
  bookedHours: number[];
  selectedHour: number | null;
  onSelectHour: (h: number) => void;
}) {
  return (
    <View style={s1.container}>
      <Text style={s1.title}>Choisir une date</Text>

      {/* Calendrier horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s1.daysScroll} contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}>
        {days.map((d, i) => {
          const active = i === selectedDayIndex;
          const isToday = i === 0;
          return (
            <TouchableOpacity
              key={i}
              style={[s1.dayCard, active && s1.dayCardActive]}
              onPress={() => onSelectDay(i)}
              activeOpacity={0.7}
            >
              <Text style={[s1.dayName, active && s1.dayTextActive]}>
                {isToday ? "Auj." : ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][d.getDay()]}
              </Text>
              <Text style={[s1.dayNum, active && s1.dayTextActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={s1.title}>Choisir un créneau</Text>
      <Text style={s1.sub}>{formatDate(days[selectedDayIndex])}</Text>

      {/* Grille horaires */}
      <View style={s1.slotsGrid}>
        {hours.map((h) => {
          const booked = bookedHours.includes(h);
          const active = selectedHour === h;
          return (
            <TouchableOpacity
              key={h}
              style={[
                s1.slot,
                active && s1.slotActive,
                booked && s1.slotBooked,
              ]}
              onPress={() => !booked && onSelectHour(h)}
              disabled={booked}
              activeOpacity={0.7}
            >
              <Text style={[s1.slotText, active && s1.slotTextActive, booked && s1.slotTextBooked]}>
                {String(h).padStart(2, "0")}:00
              </Text>
              {booked && <Text style={s1.slotBookedLabel}>Réservé</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s1 = StyleSheet.create({
  container:       { paddingTop: 8 },
  title:           { fontSize: 16, fontWeight: "700", color: "#fff", paddingHorizontal: 24, marginBottom: 14, marginTop: 20 },
  sub:             { fontSize: 13, color: "rgba(255,255,255,0.4)", paddingHorizontal: 24, marginTop: -10, marginBottom: 14 },
  daysScroll:      { marginBottom: 4 },
  dayCard:         { width: 56, height: 72, borderRadius: 16, backgroundColor: "#12122a", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", gap: 4 },
  dayCardActive:   { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  dayName:         { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  dayNum:          { fontSize: 20, color: "#fff", fontWeight: "900" },
  dayTextActive:   { color: "#fff" },
  slotsGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 24 },
  slot:            { width: (width - 48 - 30) / 4, height: 60, borderRadius: 14, backgroundColor: "#12122a", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  slotActive:      { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  slotBooked:      { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.04)" },
  slotText:        { fontSize: 14, fontWeight: "700", color: "#fff" },
  slotTextActive:  { color: "#fff" },
  slotTextBooked:  { color: "rgba(255,255,255,0.2)", fontSize: 12 },
  slotBookedLabel: { fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 },
});

// ─── Step 2 : Durée ────────────────────────────────────────────────────────

function Step2({
  durations, duration, onSelect, studio, selectedHour, totalPrice,
}: {
  durations: number[];
  duration: number;
  onSelect: (d: number) => void;
  studio: Studio;
  selectedHour: number;
  totalPrice: number;
}) {
  return (
    <View style={s2.container}>
      <Text style={s2.title}>Durée de la session</Text>
      <Text style={s2.sub}>À partir de {String(selectedHour).padStart(2, "0")}:00</Text>

      <View style={s2.grid}>
        {durations.map((d) => {
          const active = d === duration;
          const price = (studio.hourly_rate ?? 0) * d;
          return (
            <TouchableOpacity
              key={d}
              style={[s2.card, active && s2.cardActive]}
              onPress={() => onSelect(d)}
              activeOpacity={0.75}
            >
              <Text style={[s2.hours, active && s2.textActive]}>{d}h</Text>
              <Text style={[s2.price, active && s2.textActive]}>
                {studio.is_free ? "Gratuit" : `${price}€`}
              </Text>
              <Text style={[s2.end, active && s2.endActive]}>
                → {String((selectedHour + d) % 24).padStart(2, "0")}:00
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Récap */}
      <View style={s2.recap}>
        <View style={s2.recapRow}>
          <Clock size={14} color="rgba(255,255,255,0.4)" />
          <Text style={s2.recapLabel}>Durée</Text>
          <Text style={s2.recapValue}>{duration}h</Text>
        </View>
        <View style={s2.recapRow}>
          <Text style={s2.recapLabel}>Tarif horaire</Text>
          <Text style={s2.recapValue}>{studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h`}</Text>
        </View>
        <View style={[s2.recapRow, s2.recapTotal]}>
          <Text style={s2.totalLabel}>Total</Text>
          <Text style={s2.totalValue}>{studio.is_free ? "Gratuit" : `${totalPrice}€`}</Text>
        </View>
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  container:    { paddingTop: 8, paddingHorizontal: 24 },
  title:        { fontSize: 16, fontWeight: "700", color: "#fff", marginTop: 20, marginBottom: 6 },
  sub:          { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  card:         { width: (width - 48 - 20) / 3, backgroundColor: "#12122a", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, alignItems: "center", gap: 4 },
  cardActive:   { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  hours:        { fontSize: 22, fontWeight: "900", color: "#fff" },
  price:        { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  end:          { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  textActive:   { color: "#fff" },
  endActive:    { color: "rgba(255,255,255,0.7)" },
  recap:        { backgroundColor: "#12122a", borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  recapRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  recapLabel:   { flex: 1, color: "rgba(255,255,255,0.4)", fontSize: 14 },
  recapValue:   { color: "#fff", fontSize: 14, fontWeight: "600" },
  recapTotal:   { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 12, marginTop: 4 },
  totalLabel:   { flex: 1, color: "#fff", fontSize: 16, fontWeight: "700" },
  totalValue:   { color: "#5478ff", fontSize: 20, fontWeight: "900" },
});

// ─── Step 3 : Résumé + Notes ───────────────────────────────────────────────

function Step3({
  studio, day, formatDate, hour, duration, totalPrice, notes, onNotesChange,
}: {
  studio: Studio;
  day: Date;
  formatDate: (d: Date) => string;
  hour: number;
  duration: number;
  totalPrice: number;
  notes: string;
  onNotesChange: (v: string) => void;
}) {
  const endHour = (hour + duration) % 24;

  const rows = [
    { label: "Studio",     value: studio.name },
    { label: "Adresse",    value: `${studio.address}, ${studio.city}` },
    { label: "Date",       value: formatDate(day) },
    { label: "Créneau",    value: `${String(hour).padStart(2,"0")}:00 → ${String(endHour).padStart(2,"0")}:00` },
    { label: "Durée",      value: `${duration}h` },
    { label: "Total",      value: studio.is_free ? "Gratuit" : `${totalPrice}€` },
  ];

  return (
    <View style={s3.container}>
      <Text style={s3.title}>Résumé</Text>

      {/* Studio banner */}
      <View style={s3.studioBanner}>
        <View style={s3.studioIcon}>
          {studio.type === "pro"
            ? <Building2 size={24} color="#5478ff" />
            : <Home size={24} color="#00ff88" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s3.studioName}>{studio.name}</Text>
          <Text style={s3.studioType}>
            {studio.type === "pro" ? "Studio professionnel" : "Home Studio"}
          </Text>
        </View>
      </View>

      {/* Détails */}
      <View style={s3.details}>
        {rows.map((row, i) => (
          <View key={row.label} style={[s3.row, i === rows.length - 1 && s3.rowTotal]}>
            <Text style={[s3.rowLabel, i === rows.length - 1 && s3.rowTotalLabel]}>{row.label}</Text>
            <Text style={[s3.rowValue, i === rows.length - 1 && s3.rowTotalValue]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Notes */}
      <Text style={s3.notesLabel}>Message pour le studio (optionnel)</Text>
      <TextInput
        style={s3.notesInput}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Précise ton projet, le nombre de personnes..."
        placeholderTextColor="rgba(255,255,255,0.2)"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Info paiement */}
      {!studio.is_free && (
        <View style={s3.payInfo}>
          <Text style={s3.payInfoText}>
            💳 Paiement sécurisé via Stripe. Tu seras débité de{" "}
            <Text style={{ color: "#fff", fontWeight: "700" }}>{totalPrice}€</Text> maintenant.
            Annulation gratuite jusqu'à 24h avant.
          </Text>
        </View>
      )}
    </View>
  );
}

const s3 = StyleSheet.create({
  container:      { paddingHorizontal: 24, paddingTop: 8 },
  title:          { fontSize: 16, fontWeight: "700", color: "#fff", marginTop: 20, marginBottom: 16 },
  studioBanner:   { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#12122a", borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  studioIcon:     { width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  studioName:     { fontSize: 16, fontWeight: "700", color: "#fff" },
  studioType:     { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  details:        { backgroundColor: "#12122a", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 20 },
  row:            { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  rowTotal:       { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingVertical: 16 },
  rowLabel:       { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  rowValue:       { color: "#fff", fontSize: 14, fontWeight: "500" },
  rowTotalLabel:  { color: "#fff", fontSize: 16, fontWeight: "700" },
  rowTotalValue:  { color: "#5478ff", fontSize: 20, fontWeight: "900" },
  notesLabel:     { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.4)", marginBottom: 10 },
  notesInput:     { backgroundColor: "#12122a", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, padding: 14, color: "#fff", fontSize: 14, minHeight: 90, marginBottom: 16 },
  payInfo:        { backgroundColor: "rgba(45,78,255,0.08)", borderWidth: 1, borderColor: "rgba(45,78,255,0.2)", borderRadius: 14, padding: 14 },
  payInfoText:    { color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 20 },
});

// ─── Écran de confirmation ─────────────────────────────────────────────────

function ConfirmationScreen({
  studio, day, hour, duration, total, onDone,
}: {
  studio: Studio;
  day: Date;
  hour: number;
  duration: number;
  total: number;
  onDone: () => void;
}) {
  const DAY_LABELS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
  const MONTH_LABELS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

  return (
    <View style={cf.container}>
      <View style={cf.inner}>
        {/* Icône */}
        <View style={cf.iconRing}>
          <CheckCircle2 size={56} color="#00ff88" />
        </View>

        <Text style={cf.title}>Réservation confirmée !</Text>
        <Text style={cf.sub}>Tu recevras un email de confirmation dans quelques instants.</Text>

        <View style={cf.card}>
          <Row label="Studio"  value={studio.name} />
          <Row label="Date"    value={`${DAY_LABELS[day.getDay()]} ${day.getDate()} ${MONTH_LABELS[day.getMonth()]}`} />
          <Row label="Heure"   value={`${String(hour).padStart(2,"0")}:00 — ${String((hour+duration)%24).padStart(2,"0")}:00`} />
          <Row label="Durée"   value={`${duration}h`} last />
        </View>

        {total > 0 && (
          <View style={cf.totalRow}>
            <Text style={cf.totalLabel}>Total payé</Text>
            <Text style={cf.totalValue}>{total}€</Text>
          </View>
        )}

        <TouchableOpacity style={cf.btn} onPress={onDone} activeOpacity={0.85}>
          <Text style={cf.btnText}>Retour au Radar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[cf.row, last && { borderBottomWidth: 0 }]}>
      <Text style={cf.rowLabel}>{label}</Text>
      <Text style={cf.rowValue}>{value}</Text>
    </View>
  );
}

const cf = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#0a0a1a", alignItems: "center", justifyContent: "center", padding: 24 },
  inner:       { width: "100%", alignItems: "center" },
  iconRing:    { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(0,255,136,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title:       { fontSize: 28, fontWeight: "900", color: "#fff", textAlign: "center", marginBottom: 10 },
  sub:         { fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 21, marginBottom: 32 },
  card:        { width: "100%", backgroundColor: "#12122a", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 16 },
  row:         { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  rowLabel:    { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  rowValue:    { color: "#fff", fontSize: 14, fontWeight: "600" },
  totalRow:    { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  totalLabel:  { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  totalValue:  { color: "#00ff88", fontSize: 24, fontWeight: "900" },
  btn:         { width: "100%", backgroundColor: "#1a30f5", borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
});

// ─── Styles globaux ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#0a0a1a" },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  headerTitle:  { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerSub:    { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", alignItems: "center", justifyContent: "center" },
  stepsRow:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 28, paddingVertical: 16, position: "relative" },
  stepItem:     { flex: 1, alignItems: "center", gap: 6 },
  stepCircle:   { width: 28, height: 28, borderRadius: 14, backgroundColor: "#12122a", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  stepCircleActive: { backgroundColor: "#1a30f5", borderColor: "#1a30f5" },
  stepNum:      { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  stepNumActive:{ color: "#fff" },
  stepLabel:    { fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: "600" },
  stepLabelActive: { color: "rgba(255,255,255,0.7)" },
  stepLineLeft: { position: "absolute", top: 30, left: "33%", right: "33%", height: 1.5, backgroundColor: "rgba(255,255,255,0.1)" },
  stepLineRight:{ position: "absolute", top: 30, left: "33%", right: "33%", height: 1.5, backgroundColor: "rgba(255,255,255,0.1)" },
  stepLineActive:{ backgroundColor: "#1a30f5" },
  footer:       { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 20, backgroundColor: "rgba(10,10,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  footerInner:  { flexDirection: "row", alignItems: "center", gap: 16 },
  totalLabel:   { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  totalPrice:   { color: "#5478ff", fontSize: 20, fontWeight: "900" },
  ctaBtn:       { flex: 1, backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  ctaBtnLoading:{ opacity: 0.7 },
  ctaBtnFull:   { backgroundColor: "#1a30f5", borderRadius: 16, paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  ctaBtnDisabled:{ opacity: 0.4 },
  ctaBtnText:   { color: "#fff", fontSize: 16, fontWeight: "700" },
});
