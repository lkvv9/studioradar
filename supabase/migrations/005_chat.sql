-- Conversations (une par paire d'utilisateurs)
create table public.conversations (
  id              uuid default gen_random_uuid() primary key,
  participant_1   uuid references public.profiles(id) on delete cascade not null,
  participant_2   uuid references public.profiles(id) on delete cascade not null,
  last_message    text,
  last_message_at timestamptz default now(),
  created_at      timestamptz default now()
);

-- Contrainte : une seule conversation par paire (indépendamment de l'ordre)
create unique index conversations_unique
  on public.conversations (least(participant_1::text, participant_2::text), greatest(participant_1::text, participant_2::text));

-- Messages
create table public.messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references public.profiles(id) on delete cascade not null,
  content         text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  read_at         timestamptz,
  created_at      timestamptz default now()
);

-- Index performances
create index messages_conversation_idx on public.messages(conversation_id, created_at desc);
create index conversations_p1_idx on public.conversations(participant_1);
create index conversations_p2_idx on public.conversations(participant_2);

-- RLS
alter table public.conversations enable row level security;
alter table public.messages     enable row level security;

create policy "Participants voient leur conversation"
  on public.conversations for select
  using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Participants créent une conversation"
  on public.conversations for insert
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Participants mettent à jour la conversation"
  on public.conversations for update
  using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Participants voient les messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Expéditeur envoie des messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Destinataire marque lu"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

-- Trigger : met à jour last_message sur la conversation
create or replace function public.update_conversation_last_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations
  set last_message    = left(NEW.content, 80),
      last_message_at = NEW.created_at
  where id = NEW.conversation_id;
  return NEW;
end;
$$;

create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- Fonction : obtenir ou créer une conversation entre deux utilisateurs
create or replace function public.get_or_create_conversation(
  p_other_user_id uuid
)
returns uuid
language plpgsql security definer as $$
declare
  v_conversation_id uuid;
  v_uid             uuid := auth.uid();
begin
  -- Chercher une conversation existante
  select id into v_conversation_id
  from public.conversations
  where (participant_1 = v_uid and participant_2 = p_other_user_id)
     or (participant_1 = p_other_user_id and participant_2 = v_uid)
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (participant_1, participant_2)
    values (v_uid, p_other_user_id)
    returning id into v_conversation_id;
  end if;

  return v_conversation_id;
end;
$$;

-- Vue : conversations enrichies avec infos de l'autre participant
create view public.conversations_with_other as
  select
    c.id,
    c.last_message,
    c.last_message_at,
    c.created_at,
    case
      when c.participant_1 = auth.uid() then c.participant_2
      else c.participant_1
    end as other_id,
    p.full_name  as other_name,
    p.avatar_url as other_avatar,
    p.role       as other_role,
    (
      select count(*) from public.messages m
      where m.conversation_id = c.id
        and m.sender_id != auth.uid()
        and m.read_at is null
    ) as unread_count
  from public.conversations c
  join public.profiles p on p.id = case
    when c.participant_1 = auth.uid() then c.participant_2
    else c.participant_1
  end
  where c.participant_1 = auth.uid() or c.participant_2 = auth.uid()
  order by c.last_message_at desc nulls last;
