-- Add resume_text column to profiles table if it doesn't exist
alter table profiles add column if not exists resume_text text;

-- Add updated_at column if it doesn't exist
alter table profiles add column if not exists updated_at timestamptz default now();

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Allow users to insert their own profile (upsert)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Allow users to view their own profile
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );
