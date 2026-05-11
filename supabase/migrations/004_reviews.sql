-- Table des avis
create table public.reviews (
  id          uuid default gen_random_uuid() primary key,
  studio_id   uuid references public.studios(id)   on delete cascade not null,
  booking_id  uuid references public.bookings(id)  on delete cascade not null unique,
  author_id   uuid references public.profiles(id)  on delete cascade not null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Un seul avis par réservation
create unique index reviews_booking_unique on public.reviews(booking_id);

-- Index pour récupérer les avis d'un studio rapidement
create index reviews_studio_idx on public.reviews(studio_id);

-- RLS
alter table public.reviews enable row level security;

create policy "Les avis sont publics"
  on public.reviews for select using (true);

create policy "L'auteur peut créer un avis"
  on public.reviews for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.bookings
      where id = booking_id
        and artist_id = auth.uid()
        and status = 'completed'
    )
  );

create policy "L'auteur peut modifier son avis"
  on public.reviews for update
  using (auth.uid() = author_id);

-- Trigger: recalcule rating + reviews_count à chaque insert/update/delete
create or replace function public.refresh_studio_rating()
returns trigger language plpgsql security definer as $$
declare
  v_studio_id uuid;
  v_avg       numeric(3,2);
  v_count     integer;
begin
  v_studio_id := coalesce(NEW.studio_id, OLD.studio_id);

  select
    round(avg(rating)::numeric, 2),
    count(*)
  into v_avg, v_count
  from public.reviews
  where studio_id = v_studio_id;

  update public.studios
  set rating        = v_avg,
      reviews_count = v_count,
      updated_at    = now()
  where id = v_studio_id;

  return coalesce(NEW, OLD);
end;
$$;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_studio_rating();

-- Vue enrichie avec infos auteur
create view public.reviews_with_author as
  select
    r.*,
    p.full_name  as author_name,
    p.avatar_url as author_avatar,
    p.role       as author_role
  from public.reviews r
  join public.profiles p on p.id = r.author_id
  order by r.created_at desc;
