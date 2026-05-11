-- Ajouter colonne Stripe sur les réservations
alter table public.bookings
  add column if not exists stripe_payment_intent_id text;

-- Index pour retrouver une réservation par PaymentIntent (webhook)
create index if not exists bookings_stripe_pi_idx
  on public.bookings(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Fonction: vérifier si un créneau est disponible
create or replace function public.is_slot_available(
  p_studio_id uuid,
  p_start_time timestamptz,
  p_end_time   timestamptz
)
returns boolean
language sql stable
as $$
  select not exists (
    select 1
    from public.bookings
    where studio_id = p_studio_id
      and status in ('pending', 'confirmed')
      and tstzrange(start_time, end_time) && tstzrange(p_start_time, p_end_time)
  );
$$;

-- Fonction: créneaux occupés d'un studio pour un jour donné
create or replace function public.booked_slots(
  p_studio_id uuid,
  p_date      date
)
returns table(hour int)
language sql stable
as $$
  select distinct extract(hour from start_time)::int as hour
  from public.bookings
  where studio_id = p_studio_id
    and status in ('pending', 'confirmed')
    and start_time::date = p_date;
$$;

-- Policy: studio owners can view their bookings
create policy "Studio owners view their bookings"
  on public.bookings for select
  using (
    auth.uid() = artist_id
    or auth.uid() in (
      select owner_id from public.studios where id = studio_id
    )
  );
