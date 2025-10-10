-- migration: create_schema
-- description: Creates the complete database schema for the 10x-cards application
-- tables affected: profiles, decks, generations, flashcards
-- notes: This migration includes all tables, indexes, RLS policies, and triggers
--        for automatic updated_at handling

-- ============================================================================
-- helper function for automatic updated_at column updates
-- ============================================================================
-- this function will be used by triggers on all tables with an updated_at column
-- to automatically set the timestamp whenever a row is modified

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- table: profiles
-- ============================================================================
-- extends auth.users table from supabase with public user data
-- one-to-one relationship with auth.users

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table profiles enable row level security;

-- create trigger for automatic updated_at
create trigger on_updated_at
before update on profiles
for each row execute procedure handle_updated_at();

-- rls policies for profiles
-- policy: allow authenticated users to view their own profile
create policy "authenticated users can view their own profile"
on profiles for select
to authenticated
using (auth.uid() = id);

-- policy: allow anonymous users to view profiles (if needed for public profiles)
create policy "anon users cannot view profiles"
on profiles for select
to anon
using (false);

-- policy: allow authenticated users to insert their own profile
create policy "authenticated users can insert their own profile"
on profiles for insert
to authenticated
with check (auth.uid() = id);

-- policy: anonymous users cannot insert profiles
create policy "anon users cannot insert profiles"
on profiles for insert
to anon
with check (false);

-- policy: allow authenticated users to update their own profile
create policy "authenticated users can update their own profile"
on profiles for update
to authenticated
using (auth.uid() = id);

-- policy: anonymous users cannot update profiles
create policy "anon users cannot update profiles"
on profiles for update
to anon
using (false);

-- policy: allow authenticated users to delete their own profile
create policy "authenticated users can delete their own profile"
on profiles for delete
to authenticated
using (auth.uid() = id);

-- policy: anonymous users cannot delete profiles
create policy "anon users cannot delete profiles"
on profiles for delete
to anon
using (false);

-- ============================================================================
-- table: decks
-- ============================================================================
-- stores flashcard decks created by users
-- one-to-many relationship: one user can have multiple decks

create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (name <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table decks enable row level security;

-- create index on user_id for performance
create index idx_decks_user_id on decks(user_id);

-- create trigger for automatic updated_at
create trigger on_updated_at
before update on decks
for each row execute procedure handle_updated_at();

-- rls policies for decks
-- policy: allow authenticated users to view their own decks
create policy "authenticated users can view their own decks"
on decks for select
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot view decks
create policy "anon users cannot view decks"
on decks for select
to anon
using (false);

-- policy: allow authenticated users to insert their own decks
create policy "authenticated users can insert their own decks"
on decks for insert
to authenticated
with check (auth.uid() = user_id);

-- policy: anonymous users cannot insert decks
create policy "anon users cannot insert decks"
on decks for insert
to anon
with check (false);

-- policy: allow authenticated users to update their own decks
create policy "authenticated users can update their own decks"
on decks for update
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot update decks
create policy "anon users cannot update decks"
on decks for update
to anon
using (false);

-- policy: allow authenticated users to delete their own decks
create policy "authenticated users can delete their own decks"
on decks for delete
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot delete decks
create policy "anon users cannot delete decks"
on decks for delete
to anon
using (false);

-- ============================================================================
-- table: generations
-- ============================================================================
-- logs metadata for each ai flashcard generation operation
-- used for collecting metrics and analytics
-- one-to-many relationship: one user can have multiple generation logs

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model text null,
  generated_count integer not null,
  accepted_unedited_count integer null,
  accepted_edited_count integer null,
  source_text_hash text not null,
  source_text_length integer not null check (source_text_length >= 1000 and source_text_length <= 10000),
  generation_duration integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table generations enable row level security;

-- create index on user_id for performance
create index idx_generations_user_id on generations(user_id);

-- create trigger for automatic updated_at
create trigger on_updated_at
before update on generations
for each row execute procedure handle_updated_at();

-- rls policies for generations
-- policy: allow authenticated users to view their own generation logs
create policy "authenticated users can view their own generations"
on generations for select
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot view generation logs
create policy "anon users cannot view generations"
on generations for select
to anon
using (false);

-- policy: allow authenticated users to insert their own generation logs
create policy "authenticated users can insert their own generations"
on generations for insert
to authenticated
with check (auth.uid() = user_id);

-- policy: anonymous users cannot insert generation logs
create policy "anon users cannot insert generations"
on generations for insert
to anon
with check (false);

-- policy: allow authenticated users to update their own generation logs
create policy "authenticated users can update their own generations"
on generations for update
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot update generation logs
create policy "anon users cannot update generations"
on generations for update
to anon
using (false);

-- policy: allow authenticated users to delete their own generation logs
create policy "authenticated users can delete their own generations"
on generations for delete
to authenticated
using (auth.uid() = user_id);

-- policy: anonymous users cannot delete generation logs
create policy "anon users cannot delete generations"
on generations for delete
to anon
using (false);

-- ============================================================================
-- table: flashcards
-- ============================================================================
-- main table for storing individual flashcards
-- one-to-many relationship: one deck can have multiple flashcards
-- optional one-to-many relationship: one generation can produce multiple flashcards

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references decks(id) on delete cascade,
  generation_id uuid null references generations(id) on delete set null,
  front varchar(200) not null,
  back varchar(500) not null,
  source text not null check (source in ('manual', 'ai-full', 'ai-edited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table flashcards enable row level security;

-- create indexes on foreign keys for performance
create index idx_flashcards_deck_id on flashcards(deck_id);
create index idx_flashcards_generation_id on flashcards(generation_id);

-- create trigger for automatic updated_at
create trigger on_updated_at
before update on flashcards
for each row execute procedure handle_updated_at();

-- rls policies for flashcards
-- policy: allow authenticated users to view flashcards in their own decks
-- uses a subquery to check if the deck belongs to the authenticated user
create policy "authenticated users can view flashcards in their own decks"
on flashcards for select
to authenticated
using ((
  select user_id from decks where id = deck_id
) = auth.uid());

-- policy: anonymous users cannot view flashcards
create policy "anon users cannot view flashcards"
on flashcards for select
to anon
using (false);

-- policy: allow authenticated users to insert flashcards in their own decks
create policy "authenticated users can insert flashcards in their own decks"
on flashcards for insert
to authenticated
with check ((
  select user_id from decks where id = deck_id
) = auth.uid());

-- policy: anonymous users cannot insert flashcards
create policy "anon users cannot insert flashcards"
on flashcards for insert
to anon
with check (false);

-- policy: allow authenticated users to update flashcards in their own decks
create policy "authenticated users can update flashcards in their own decks"
on flashcards for update
to authenticated
using ((
  select user_id from decks where id = deck_id
) = auth.uid());

-- policy: anonymous users cannot update flashcards
create policy "anon users cannot update flashcards"
on flashcards for update
to anon
using (false);

-- policy: allow authenticated users to delete flashcards in their own decks
create policy "authenticated users can delete flashcards in their own decks"
on flashcards for delete
to authenticated
using ((
  select user_id from decks where id = deck_id
) = auth.uid());

-- policy: anonymous users cannot delete flashcards
create policy "anon users cannot delete flashcards"
on flashcards for delete
to anon
using (false);

