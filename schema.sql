-- Database Schema for Freepik Clone
-- Run this in your Supabase project SQL Editor to setup tables and triggers.

-- 1. Create Profiles Table (extends Supabase Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  role text not null default 'user' check (role in ('user', 'contributor', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for Profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow individual write access to profiles" on public.profiles
  for update using (auth.uid() = id);

-- 2. Create Assets Table
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null check (category in ('vectors', 'photos', 'psds', '3d')),
  type text not null default 'free' check (type in ('free', 'premium')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  imageUrl text not null,
  tags text[] default '{}'::text[] not null,
  contributor text not null,
  downloads integer default 0 not null,
  likes integer default 0 not null,
  feedback text default '',
  createdDate timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assets enable row level security;

-- Policies for Assets
create policy "Allow public select for approved assets" on public.assets
  for select using (status = 'approved');

create policy "Allow contributors select their own assets" on public.assets
  for select using (auth.role() = 'authenticated');

create policy "Allow contributors insert assets" on public.assets
  for insert with check (auth.role() = 'authenticated');

create policy "Allow admins full access to assets" on public.assets
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 3. Create Downloads Tracking Table
create table public.downloads (
  id uuid default gen_random_uuid() primary key,
  asset_id uuid references public.assets on delete cascade not null,
  user_id uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.downloads enable row level security;

create policy "Allow authenticated insert download" on public.downloads
  for insert with check (auth.role() = 'authenticated');

create policy "Allow admins view downloads" on public.downloads
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 4. Create Payouts / Withdrawals Table
create table public.payouts (
  id uuid default gen_random_uuid() primary key,
  contributor text not null,
  amount numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payouts enable row level security;

create policy "Allow contributors view payouts" on public.payouts
  for select using (auth.role() = 'authenticated');

create policy "Allow contributors insert payouts" on public.payouts
  for insert with check (auth.role() = 'authenticated');

-- 5. Trigger to automatically create a Profile entry upon auth sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed initial assets for quick testing in case of database wipe
-- Run these inserts if you want to pre-populate database:
-- insert into public.assets (title, category, type, status, imageUrl, tags, contributor, downloads, likes)
-- values ('Minimalist Abstract Pastel Landscape', 'vectors', 'free', 'approved', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', ARRAY['abstract', 'landscape', 'pastel'], 'DesignWave', 1240, 85);
