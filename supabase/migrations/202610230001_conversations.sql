-- Saved conversations are immutable snapshots. Only their owner can read/delete.
begin;

create function public.valid_conversation_messages(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; role_text text; message_text text;
begin
  if value is null or jsonb_typeof(value) <> 'array' then return false; end if;
