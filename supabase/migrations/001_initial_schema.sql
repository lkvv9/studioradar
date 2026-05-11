-- Enable PostGIS pour les requêtes géospatiales
create extension if not exists postgis;

-- Table des profils utilisateurs
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text not null,
  role        text not null check (role in ('artist','pro_studio','home_studio','music_lover')),
  avatar_url  text,
  bio         text,
  genres      text[] default '{}',
  location    geography(point, 4326),
  city        text,
  created_at  timestamptz default now()
);

-- Table des studios
create table public.studios (
  id                uuid default gen_random_uuid() primary key,
  owner_id          uuid references public.profiles(id) on delete cascade not null,
  name              text not null,
  type              text not null check (type in ('pro','home')),
  description       text,
  hourly_rate       numeric(10,2),
  is_free           boolean default false,
  is_available_now  boolean default false,
  location          geography(point, 4326) not null,
  address           text,
  city              text,
  photos            text[] default '{}',
  equipment         text[] default '{}',
  genres            text[] default '{}',
  rating            numeric(3,2),
  reviews_count     integer default 0,
  contact_email     text,
  contact_phone     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Table des réservations
create table public.bookings (
  id          uuid default gen_random_uuid() primary key,
  studio_id   uuid references public.studios(id) on delete cascade not null,
  artist_id   uuid references public.profiles(id) on delete cascade not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  status      text default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  total_price numeric(10,2),
  notes       text,
  created_at  timestamptz default now()
);

-- Table des swipes (Music Match)
create table public.swipes (
  id              uuid default gen_random_uuid() primary key,
  swiper_id       uuid references public.profiles(id) on delete cascade not null,
  target_id       uuid references public.profiles(id) on delete cascade not null,
  direction       text not null check (direction in ('left','right')),
  created_at      timestamptz default now(),
  unique(swiper_id, target_id)
);

-- Vue pour les matches mutuels
create view public.music_matches as
  select
    s1.swiper_id as user_id,
    s1.target_id as matched_user_id,
    s1.created_at
  from public.swipes s1
  join public.swipes s2
    on s1.swiper_id = s2.target_id
   and s1.target_id = s2.swiper_id
   and s2.direction = 'right'
  where s1.direction = 'right';

-- Index géospatial
create index studios_location_idx on public.studios using gist(location);
create index profiles_location_idx on public.profiles using gist(location);

-- Index disponibilité
create index studios_available_idx on public.studios(is_available_now) where is_available_now = true;

-- Fonction: studios près d'un point dans un rayon (km)
create or replace function public.studios_nearby(
  lat float,
  lng float,
  radius_km float default 10,
  studio_type text default null,
  available_only boolean default false
)
returns setof public.studios
language sql stable
as $$
  select *
  from public.studios
  where
    ST_DWithin(
      location,
      ST_MakePoint(lng, lat)::geography,
      radius_km * 1000
    )
    and (studio_type is null or type = studio_type)
    and (not available_only or is_available_now = true)
  order by location <-> ST_MakePoint(lng, lat)::geography;
$$;

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.studios enable row level security;
alter table public.bookings enable row level security;
alter table public.swipes enable row level security;

-- Policies
create policy "Les profils sont visibles par tous" on public.profiles for select using (true);
create policy "Chaque utilisateur gère son profil" on public.profiles for all using (auth.uid() = id);

create policy "Les studios sont visibles par tous" on public.studios for select using (true);
create policy "Les propriétaires gèrent leurs studios" on public.studios for all using (auth.uid() = owner_id);

create policy "Les réservations sont visibles par les parties concernées" on public.bookings
  for select using (auth.uid() = artist_id or auth.uid() in (
    select owner_id from public.studios where id = studio_id
  ));
create policy "Les artistes créent des réservations" on public.bookings for insert with check (auth.uid() = artist_id);

create policy "Swipes privés" on public.swipes for all using (auth.uid() = swiper_id);

-- Trigger: créer le profil automatiquement après inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data->>'role', 'artist')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
