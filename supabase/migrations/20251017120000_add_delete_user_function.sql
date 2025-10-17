-- migration: add_delete_user_function
-- description: Creates a secure function to allow users to delete their own accounts
-- tables affected: auth.users (and cascades to profiles, decks, flashcards, generations)
-- notes: This function is marked as SECURITY DEFINER to allow authenticated users
--        to delete their own account from the auth.users table

-- ============================================================================
-- function: delete_user
-- ============================================================================
-- allows an authenticated user to delete their own account
-- this will cascade to all related tables (profiles, decks, flashcards, generations)
-- due to the on delete cascade constraints

create or replace function delete_user()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_user_id uuid;
begin
  -- verify that the user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- store the user id before deletion
  deleted_user_id := auth.uid();

  -- delete the user from auth.users
  -- this will cascade to all related tables
  delete from auth.users
  where id = deleted_user_id;

  -- return success response
  return json_build_object(
    'success', true,
    'message', 'User deleted successfully',
    'deleted_user_id', deleted_user_id
  );
exception
  when others then
    raise exception 'Failed to delete user: %', sqlerrm;
end;
$$;

-- grant execute permission to authenticated users only
revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;

comment on function delete_user() is 
  'Allows an authenticated user to delete their own account. This action cascades to all related data.';

