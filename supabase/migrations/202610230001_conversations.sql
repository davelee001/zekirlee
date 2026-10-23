-- Saved conversations are immutable snapshots. Only their owner can read/delete.
begin;

create function public.valid_conversation_messages(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; role_text text; message_text text;
begin
  if value is null or jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value) not between 1 and 40 or char_length(value::text) > 80000 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'role') is distinct from 'string'
      or jsonb_typeof(item->'text') is distinct from 'string' then return false; end if;
    role_text := item->>'role'; message_text := item->>'text';
    if role_text not in ('user', 'assistant') or char_length(btrim(message_text)) = 0
      or char_length(message_text) > case when role_text = 'user' then 8000 else 32000 end then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  messages jsonb not null check (public.valid_conversation_messages(messages)),
  created_at timestamptz not null default now()
);
