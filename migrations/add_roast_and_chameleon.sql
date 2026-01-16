-- Create table for storing roasts
create table if not exists roasts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_text text not null,
  roast_json jsonb not null,
  burn_score int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure applications table exists
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text, -- Can be external ID or uuid, text covers both
  status text default 'applied',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add tailored_resume_text to applications table
alter table applications 
add column if not exists tailored_resume_text text;

-- Add RLS policies for roasts
alter table roasts enable row level security;

drop policy if exists "Users can insert their own roasts" on roasts;
create policy "Users can insert their own roasts"
  on roasts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own roasts" on roasts;
create policy "Users can view their own roasts"
  on roasts for select
  using (auth.uid() = user_id);

-- Add RLS for applications
alter table applications enable row level security;

drop policy if exists "Users can insert their own applications" on applications;
create policy "Users can insert their own applications"
  on applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own applications" on applications;
create policy "Users can view their own applications"
  on applications for select
  using (auth.uid() = user_id);
