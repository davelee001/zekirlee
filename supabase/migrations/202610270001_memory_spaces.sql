-- One resettable memory namespace per authenticated account, shared across devices.
create table public.memory_spaces (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  generation uuid not null default gen_random_uuid()
);
alter table public.memory_spaces enable row level security;
alter table public.memory_spaces force row level security;
