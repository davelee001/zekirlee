-- Run after the memory_spaces migration in a test Supabase project; rolls back.
begin;
select set_config('test.user_a', gen_random_uuid()::text, true);
