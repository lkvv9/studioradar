-- Ajouter colonne commission plateforme sur les réservations
alter table public.bookings
  add column if not exists platform_fee numeric(10,2) default 0;
