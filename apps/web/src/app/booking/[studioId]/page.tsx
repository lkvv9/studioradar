"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ChevronLeft, ChevronRight, Clock, Check, Building2, Home, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateFees } from "@studioradar/shared";
import type { Studio } from "@studioradar/shared";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const DURATIONS = [1, 2, 3, 4, 6, 8];
const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function getDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}
const DAYS = getDays(14);

function formatDate(d: Date) {
  return `${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

export default function BookingPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const router = useRouter();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(2);
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const fees = useMemo(
    () => calculateFees((studio?.hourly_rate ?? 0) * duration),
    [studio?.hourly_rate, duration]
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.from("studios").select("*").eq("id", studioId).single()
      .then(({ data }) => { setStudio(data as Studio); setLoading(false); });
  }, [studioId]);

  useEffect(() => {
    if (!studioId) return;
    const supabase = createClient();
    const dateStr = DAYS[selectedDayIdx].toISOString().split("T")[0];
    supabase.rpc("booked_slots", { p_studio_id: studioId, p_date: dateStr })
      .then(({ data }) => setBookedSlots((data ?? []).map((r: { hour: number }) => r.hour)));
  }, [studioId, selectedDayIdx]);

  async function handleProceedToPayment() {
    if (!studio) return;
    const selectedDay = DAYS[selectedDayIdx];
    const dateStr = selectedDay.toISOString().split("T")[0];

    const res = await fetch("/api/payment/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studio_id: studioId,
        date: dateStr,
        start_hour: selectedHour,
        duration_hours: duration,
        notes,
      }),
    });
    const data = await res.json();
    if (data.free) { setConfirmed(true); return; }
    if (data.client_secret) setClientSecret(data.client_secret);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-white/40">Studio introuvable.</p>
      </div>
    );
  }

  if (confirmed) {
    return <ConfirmationScreen studio={studio} day={DAYS[selectedDayIdx]} hour={selectedHour!} duration={duration} total={fees.total} onDone={() => router.push("/studios")} />;
  }

  const canNext = step === 1 ? selectedHour !== null : true;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.back()}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="font-bold text-base">Réserver</p>
          <p className="text-xs text-white/40">{studio.name}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-0 py-6 px-8 max-w-lg mx-auto">
        {(["Date & heure", "Durée", "Résumé"] as const).map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i + 1 <= step ? "bg-blue-600 text-white" : "bg-white/5 text-white/30"}`}>
                {i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${i + 1 === step ? "text-white/70" : "text-white/25"}`}>{label}</span>
            </div>
            {i < 2 && <div className={`h-px flex-1 mx-2 mb-4 transition-colors ${i + 1 < step ? "bg-blue-600" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 pb-32">
        {step === 1 && (
          <div>
            <h2 className="font-bold text-base mb-4">Choisir une date</h2>
            <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
              {DAYS.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDayIdx(i); setSelectedHour(null); }}
                  className={`flex-shrink-0 w-14 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-colors ${i === selectedDayIdx ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/5 hover:border-white/20"}`}>
                  <span className="text-[10px] font-semibold text-white/60">{i === 0 ? "Auj." : DAY_LABELS[d.getDay()]}</span>
                  <span className="text-lg font-black">{d.getDate()}</span>
                </button>
              ))}
            </div>

            <h2 className="font-bold text-base mb-1">Choisir un créneau</h2>
            <p className="text-xs text-white/40 mb-4">{formatDate(DAYS[selectedDayIdx])}</p>
            <div className="grid grid-cols-4 gap-2">
              {HOURS.map((h) => {
                const booked = bookedSlots.includes(h);
                const active = selectedHour === h;
                return (
                  <button key={h} onClick={() => !booked && setSelectedHour(h)} disabled={booked}
                    className={`h-14 rounded-xl flex flex-col items-center justify-center border text-xs font-bold transition-colors ${active ? "bg-blue-600 border-blue-600" : booked ? "bg-white/2 border-white/4 text-white/20 cursor-not-allowed" : "bg-white/5 border-white/8 hover:border-white/20"}`}>
                    <span>{String(h).padStart(2, "0")}:00</span>
                    {booked && <span className="text-[9px] font-normal text-white/20 mt-0.5">Réservé</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-bold text-base mb-1">Durée de la session</h2>
            <p className="text-xs text-white/40 mb-5">À partir de {String(selectedHour).padStart(2, "0")}:00</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {DURATIONS.map((d) => {
                const price = (studio.hourly_rate ?? 0) * d;
                const active = d === duration;
                return (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`rounded-2xl p-4 flex flex-col items-center gap-1 border transition-colors ${active ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/8 hover:border-white/20"}`}>
                    <span className="text-2xl font-black">{d}h</span>
                    <span className={`text-xs font-semibold ${active ? "text-white/70" : "text-white/40"}`}>
                      {studio.is_free ? "Gratuit" : `${price}€`}
                    </span>
                    <span className={`text-[10px] ${active ? "text-white/50" : "text-white/25"}`}>
                      → {String((selectedHour! + d) % 24).padStart(2, "0")}:00
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
              {[
                { label: "Durée", value: `${duration}h` },
                { label: "Tarif horaire", value: studio.is_free ? "Gratuit" : `${studio.hourly_rate}€/h` },
                ...(!studio.is_free ? [
                  { label: "Prix studio", value: `${fees.studioPrice}€` },
                  { label: "Frais de service (12%)", value: `${fees.platformFee}€` },
                ] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <div className="border-t border-white/8 pt-3 flex justify-between">
                <span className="font-bold">Total TTC</span>
                <span className="text-blue-400 text-lg font-black">
                  {studio.is_free ? "Gratuit" : `${fees.total}€`}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && !clientSecret && (
          <div>
            <h2 className="font-bold text-base mb-5">Résumé</h2>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                {studio.type === "pro" ? <Building2 className="w-6 h-6 text-blue-400" /> : <Home className="w-6 h-6 text-emerald-400" />}
              </div>
              <div>
                <p className="font-bold">{studio.name}</p>
                <p className="text-xs text-white/40">{studio.type === "pro" ? "Studio professionnel" : "Home Studio"}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden mb-5">
              {[
                { label: "Date", value: formatDate(DAYS[selectedDayIdx]) },
                { label: "Créneau", value: `${String(selectedHour).padStart(2, "0")}:00 → ${String((selectedHour! + duration) % 24).padStart(2, "0")}:00` },
                { label: "Durée", value: `${duration}h` },
                ...(!studio.is_free ? [
                  { label: "Prix studio", value: `${fees.studioPrice}€` },
                  { label: "Frais de service (12%)", value: `${fees.platformFee}€` },
                ] : []),
                { label: "Total TTC", value: studio.is_free ? "Gratuit" : `${fees.total}€` },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className={`flex justify-between px-4 py-3 text-sm ${i < arr.length - 1 ? "border-b border-white/5" : "border-t border-white/8"}`}>
                  <span className={i === arr.length - 1 ? "font-bold text-base" : "text-white/40"}>{label}</span>
                  <span className={i === arr.length - 1 ? "text-blue-400 text-lg font-black" : "font-semibold"}>{value}</span>
                </div>
              ))}
            </div>

            <label className="text-xs font-semibold text-white/40 mb-2 block">Message pour le studio (optionnel)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Précise ton projet, le nombre de personnes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 resize-none h-24 focus:outline-none focus:border-white/20 mb-4" />

            {!studio.is_free && (
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
                💳 Paiement sécurisé via Stripe. Tu seras débité de <span className="text-white font-bold">{fees.total}€</span> maintenant.
              </div>
            )}
          </div>
        )}

        {step === 3 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#2d4eff", borderRadius: "12px" } } }}>
            <PaymentForm onSuccess={() => setConfirmed(true)} total={fees.total} />
          </Elements>
        )}
      </div>

      {/* Footer CTA */}
      {!(step === 3 && clientSecret) && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0a0a1a]/95 border-t border-white/5">
          <div className="max-w-lg mx-auto">
            {step === 3 ? (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-white/40">Total TTC</p>
                  <p className="text-xl font-black text-blue-400">{studio.is_free ? "Gratuit" : `${fees.total}€`}</p>
                </div>
                <button onClick={handleProceedToPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors text-sm">
                  {studio.is_free ? "Confirmer" : "Payer & Réserver"}
                </button>
              </div>
            ) : (
              <button onClick={() => canNext && setStep((s) => (s + 1) as 1 | 2 | 3)} disabled={!canNext}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-colors ${canNext ? "bg-blue-600 hover:bg-blue-500" : "bg-white/5 text-white/30 cursor-not-allowed"}`}>
                Continuer <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentForm({ onSuccess, total }: { onSuccess: () => void; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/booking/success" },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Erreur de paiement");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="font-bold text-base">Paiement</h2>
      <PaymentElement />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0a0a1a]/95 border-t border-white/5">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div>
            <p className="text-xs text-white/40">Total TTC</p>
            <p className="text-xl font-black text-blue-400">{total}€</p>
          </div>
          <button type="submit" disabled={!stripe || loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Traitement..." : "Confirmer le paiement"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ConfirmationScreen({ studio, day, hour, duration, total, onDone }: {
  studio: Studio; day: Date; hour: number; duration: number; total: number; onDone: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Réservation confirmée !</h1>
        <p className="text-white/40 text-sm mb-8">Tu recevras un email de confirmation dans quelques instants.</p>

        <div className="w-full bg-white/5 rounded-2xl border border-white/5 overflow-hidden mb-5">
          {[
            { label: "Studio", value: studio.name },
            { label: "Date", value: formatDate(day) },
            { label: "Heure", value: `${String(hour).padStart(2, "0")}:00 — ${String((hour + duration) % 24).padStart(2, "0")}:00` },
            { label: "Durée", value: `${duration}h` },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className={`flex justify-between px-5 py-4 text-sm ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
              <span className="text-white/40">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="flex justify-between w-full mb-8">
            <span className="text-white/40 text-sm">Total payé</span>
            <span className="text-emerald-400 text-xl font-black">{total}€</span>
          </div>
        )}

        <button onClick={onDone} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors">
          Retour aux studios
        </button>
      </div>
    </div>
  );
}
