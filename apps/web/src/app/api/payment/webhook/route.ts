import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalide" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { studio_id, user_id, date, start_hour, duration_hours, notes } = pi.metadata;

    const durationH = parseInt(duration_hours);
    const startTime = new Date(`${date}T${String(start_hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + durationH * 3600 * 1000);

    const supabase = await createClient();
    await supabase.from("bookings").insert({
      studio_id,
      artist_id: user_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: pi.amount / 100,
      status: "confirmed",
      notes: notes || null,
      stripe_payment_intent_id: pi.id,
    });
  }

  return NextResponse.json({ received: true });
}
