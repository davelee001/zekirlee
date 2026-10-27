-- Run after the memory_spaces migration in a test Supabase project; rolls back.
begin;
select set_config('test.user_a', gen_random_uuid()::text, true);
select set_config('test.user_b', gen_random_uuid()::text, true);
insert into auth.users (id, email) values
  (current_setting('test.user_a')::uuid, current_setting('test.user_a') || '@example.invalid'),
  (current_setting('test.user_b')::uuid, current_setting('test.user_b') || '@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'), 'role', 'authenticated')::text, true);
insert into public.memory_spaces default values;
do $$ begin
  update public.memory_spaces set generation = gen_random_uuid() where user_id = auth.uid();
  if not found then raise exception 'Owner cannot rotate'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_b'), 'role', 'authenticated')::text, true);
do $$ begin
  if exists (select 1 from public.memory_spaces) then raise exception 'Cross-account read allowed'; end if;
  update public.memory_spaces set generation = gen_random_uuid() where user_id = current_setting('test.user_a')::uuid;
  if found then raise exception 'Cross-account rotation allowed'; end if;
  begin
    insert into public.memory_spaces (user_id) values (current_setting('test.user_a')::uuid);
    raise exception 'Spoofed owner allowed';
  exception when insufficient_privilege then null;
  end;
