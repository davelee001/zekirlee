-- One resettable memory namespace per authenticated account, shared across devices.
create table public.memory_spaces (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  generation uuid not null default gen_random_uuid()
);
alter table public.memory_spaces enable row level security;
alter table public.memory_spaces force row level security;
revoke all on public.memory_spaces from public, anon, authenticated;
grant select, insert on public.memory_spaces to authenticated;
grant update (generation) on public.memory_spaces to authenticated;
create policy memory_spaces_read on public.memory_spaces for select to authenticated using (user_id = (select auth.uid()));
create policy memory_spaces_create on public.memory_spaces for insert to authenticated with check (user_id = (select auth.uid()));
create policy memory_spaces_rotate on public.memory_spaces for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
