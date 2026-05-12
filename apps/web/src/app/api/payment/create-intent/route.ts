import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { calculateFees } from "@studioradar/shared";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { studio_id, date, start_hour, duration_hours, notes } = body;

    if (!studio_id || !date || start_hour === undefined || !duration_hours) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Récupérer le studio
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("id, name, hourly_rate, owner_id")
      .eq("id", studio_id)
      .single();

    if (studioError || !studio) {
      return NextResponse.json({ error: "Studio introuvable" }, { status: 404 });
    }

    const studioPrice = (studio.hourly_rate ?? 0) * duration_hours;
    const { platformFee, total } = calculateFees(studioPrice);
    const amountCents = Math.round(total * 100);

    if (amountCents === 0) {
      // Studio gratuit — créer la réservation directement
      const startTime = new Date(`${date}T${String(start_hour).padStart(2, "0")}:00:00`);
      const endTime   = new Date(startTime.getTime() + duration_hours * 60 * 60 * 1000);

      const { data: booking, error } = await supabase.from("bookings").insert({
        studio_id,
        artist_id:    user.id,
        start_time:   startTime.toISOString(),
        end_time:     endTime.toISOString(),
        total_price:  0,
        platform_fee: 0,
        status:       "confirmed",
        notes:        notes ?? null,
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ booking, free: true });
    }

    // Créer le PaymentIntent Stripe (montant total = prix studio + commission 12%)
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: "eur",
      metadata: {
        studio_id,
        user_id:        user.id,
        date,
        start_hour:     String(start_hour),
        duration_hours: String(duration_hours),
        studio_price:   String(studioPrice),
        platform_fee:   String(platformFee),
        notes:          notes ?? "",
      },
      description: `StudioRadar — ${studio.name} — ${duration_hours}h le ${date}`,
    });

    return NextResponse.json({
      client_secret:      paymentIntent.client_secret,
      studio_price:       studioPrice,
      platform_fee:       platformFee,
      total,
      payment_intent_id:  paymentIntent.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
