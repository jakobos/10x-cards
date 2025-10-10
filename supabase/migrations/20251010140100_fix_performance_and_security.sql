-- migration: fix_performance_and_security
-- description: Fixes security vulnerability in handle_updated_at() function and optimizes RLS policies performance
-- tables affected: profiles, decks, generations, flashcards
-- notes: This migration addresses:
--        1. Function search_path security issue in handle_updated_at()
--        2. RLS policy performance by using (select auth.uid()) instead of auth.uid()

-- ============================================================================
-- fix: update handle_updated_at() function with secure search_path
-- ============================================================================
-- adding 'set search_path = ''' prevents search path injection attacks

create or replace function handle_updated_at()
returns trigger 
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- fix: optimize profiles table rls policies
-- ============================================================================
-- drop old policies and recreate with optimized auth.uid() calls

-- drop existing policies
drop policy if exists "authenticated users can view their own profile" on profiles;
drop policy if exists "anon users cannot view profiles" on profiles;
drop policy if exists "authenticated users can insert their own profile" on profiles;
drop policy if exists "anon users cannot insert profiles" on profiles;
drop policy if exists "authenticated users can update their own profile" on profiles;
drop policy if exists "anon users cannot update profiles" on profiles;
drop policy if exists "authenticated users can delete their own profile" on profiles;
drop policy if exists "anon users cannot delete profiles" on profiles;

-- recreate policies with performance optimization
create policy "authenticated users can view their own profile"
on profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "anon users cannot view profiles"
on profiles for select
to anon
using (false);

create policy "authenticated users can insert their own profile"
on profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "anon users cannot insert profiles"
on profiles for insert
to anon
with check (false);

create policy "authenticated users can update their own profile"
on profiles for update
to authenticated
using ((select auth.uid()) = id);

create policy "anon users cannot update profiles"
on profiles for update
to anon
using (false);

create policy "authenticated users can delete their own profile"
on profiles for delete
to authenticated
using ((select auth.uid()) = id);

create policy "anon users cannot delete profiles"
on profiles for delete
to anon
using (false);

-- ============================================================================
-- fix: optimize decks table rls policies
-- ============================================================================

-- drop existing policies
drop policy if exists "authenticated users can view their own decks" on decks;
drop policy if exists "anon users cannot view decks" on decks;
drop policy if exists "authenticated users can insert their own decks" on decks;
drop policy if exists "anon users cannot insert decks" on decks;
drop policy if exists "authenticated users can update their own decks" on decks;
drop policy if exists "anon users cannot update decks" on decks;
drop policy if exists "authenticated users can delete their own decks" on decks;
drop policy if exists "anon users cannot delete decks" on decks;

-- recreate policies with performance optimization
create policy "authenticated users can view their own decks"
on decks for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot view decks"
on decks for select
to anon
using (false);

create policy "authenticated users can insert their own decks"
on decks for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "anon users cannot insert decks"
on decks for insert
to anon
with check (false);

create policy "authenticated users can update their own decks"
on decks for update
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot update decks"
on decks for update
to anon
using (false);

create policy "authenticated users can delete their own decks"
on decks for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot delete decks"
on decks for delete
to anon
using (false);

-- ============================================================================
-- fix: optimize generations table rls policies
-- ============================================================================

-- drop existing policies
drop policy if exists "authenticated users can view their own generations" on generations;
drop policy if exists "anon users cannot view generations" on generations;
drop policy if exists "authenticated users can insert their own generations" on generations;
drop policy if exists "anon users cannot insert generations" on generations;
drop policy if exists "authenticated users can update their own generations" on generations;
drop policy if exists "anon users cannot update generations" on generations;
drop policy if exists "authenticated users can delete their own generations" on generations;
drop policy if exists "anon users cannot delete generations" on generations;

-- recreate policies with performance optimization
create policy "authenticated users can view their own generations"
on generations for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot view generations"
on generations for select
to anon
using (false);

create policy "authenticated users can insert their own generations"
on generations for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "anon users cannot insert generations"
on generations for insert
to anon
with check (false);

create policy "authenticated users can update their own generations"
on generations for update
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot update generations"
on generations for update
to anon
using (false);

create policy "authenticated users can delete their own generations"
on generations for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "anon users cannot delete generations"
on generations for delete
to anon
using (false);

-- ============================================================================
-- fix: optimize flashcards table rls policies
-- ============================================================================

-- drop existing policies
drop policy if exists "authenticated users can view flashcards in their own decks" on flashcards;
drop policy if exists "anon users cannot view flashcards" on flashcards;
drop policy if exists "authenticated users can insert flashcards in their own decks" on flashcards;
drop policy if exists "anon users cannot insert flashcards" on flashcards;
drop policy if exists "authenticated users can update flashcards in their own decks" on flashcards;
drop policy if exists "anon users cannot update flashcards" on flashcards;
drop policy if exists "authenticated users can delete flashcards in their own decks" on flashcards;
drop policy if exists "anon users cannot delete flashcards" on flashcards;

-- recreate policies with performance optimization
create policy "authenticated users can view flashcards in their own decks"
on flashcards for select
to authenticated
using ((
  select user_id from decks where id = deck_id
) = (select auth.uid()));

create policy "anon users cannot view flashcards"
on flashcards for select
to anon
using (false);

create policy "authenticated users can insert flashcards in their own decks"
on flashcards for insert
to authenticated
with check ((
  select user_id from decks where id = deck_id
) = (select auth.uid()));

create policy "anon users cannot insert flashcards"
on flashcards for insert
to anon
with check (false);

create policy "authenticated users can update flashcards in their own decks"
on flashcards for update
to authenticated
using ((
  select user_id from decks where id = deck_id
) = (select auth.uid()));

create policy "anon users cannot update flashcards"
on flashcards for update
to anon
using (false);

create policy "authenticated users can delete flashcards in their own decks"
on flashcards for delete
to authenticated
using ((
  select user_id from decks where id = deck_id
) = (select auth.uid()));

create policy "anon users cannot delete flashcards"
on flashcards for delete
to anon
using (false);

