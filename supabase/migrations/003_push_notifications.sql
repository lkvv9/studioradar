-- Colonne push_token sur les profils
alter table public.profiles
  add column if not exists push_token text;

-- Trigger: notifier l'artiste quand sa réservation est confirmée
create or replace function public.notify_booking_confirmed()
returns trigger language plpgsql security definer as $$
declare
  v_studio_name text;
  v_start_hour  int;
begin
  if NEW.status = 'confirmed' and OLD.status = 'pending' then
    select name into v_studio_name from public.studios where id = NEW.studio_id;
    v_start_hour := extract(hour from NEW.start_time)::int;

    perform net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body    := jsonb_build_object(
        'user_ids', jsonb_build_array(NEW.artist_id),
        'title',    '✅ Réservation confirmée !',
        'body',     v_studio_name || ' · ' || lpad(v_start_hour::text, 2, '0') || 'h00',
        'data',     jsonb_build_object('screen', 'my-bookings', 'bookingId', NEW.id)
      )
    );
  end if;
  return NEW;
end;
$$;

create trigger on_booking_confirmed
  after update on public.bookings
  for each row
  when (OLD.status is distinct from NEW.status)
  execute function public.notify_booking_confirmed();

-- Trigger: notifier sur un match mutuel
create or replace function public.notify_music_match()
returns trigger language plpgsql security definer as $$
declare
  v_swiper_name text;
  v_target_name text;
  v_mutual      boolean;
begin
  if NEW.direction != 'right' then return NEW; end if;

  -- Vérifier si c'est mutuel
  select exists(
    select 1 from public.swipes
    where swiper_id = NEW.target_id
      and target_id = NEW.swiper_id
      and direction = 'right'
  ) into v_mutual;

  if not v_mutual then return NEW; end if;

  select full_name into v_swiper_name from public.profiles where id = NEW.swiper_id;
  select full_name into v_target_name from public.profiles where id = NEW.target_id;

  -- Notifier les deux
  perform net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/send-notification',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body    := jsonb_build_object(
      'user_ids', jsonb_build_array(NEW.swiper_id, NEW.target_id),
      'title',    '🎉 Nouveau match musical !',
      'body',     v_swiper_name || ' et ' || v_target_name || ' ont matché',
      'data',     jsonb_build_object('screen', 'match')
    )
  );

  return NEW;
end;
$$;

create trigger on_music_match
  after insert on public.swipes
  for each row
  execute function public.notify_music_match();
