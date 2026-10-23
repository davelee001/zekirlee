-- Run in a test Supabase project after applying the migration. All rows roll back.
begin;
select set_config('test.user_a', gen_random_uuid()::text, true);
select set_config('test.user_b', gen_random_uuid()::text, true);
select set_config('test.conversation_id', gen_random_uuid()::text, true);
insert into auth.users (id, email) values
  (current_setting('test.user_a')::uuid, current_setting('test.user_a') || '@example.invalid'),
  (current_setting('test.user_b')::uuid, current_setting('test.user_b') || '@example.invalid');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'), 'role', 'authenticated')::text, true);
insert into public.conversations (id, title, messages) values
  (current_setting('test.conversation_id')::uuid, 'Private test', '[{"role":"user","text":"Hello"}]');

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_b'), 'role', 'authenticated')::text, true);
do $$
begin
  if exists (select 1 from public.conversations where id = current_setting('test.conversation_id')::uuid) then raise exception 'User B can read user A'; end if;
  delete from public.conversations where id = current_setting('test.conversation_id')::uuid;
  if found then raise exception 'User B can delete user A'; end if;
  begin
    insert into public.conversations (user_id, title, messages) values (current_setting('test.user_a')::uuid, 'Forbidden', '[{"role":"user","text":"Hello"}]');
