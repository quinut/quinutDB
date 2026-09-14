-- ==============================================================================
-- QuinutDB Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Profiles Table (Automatically synced from auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger: Automatically insert/update profile on auth.users creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(excluded.username, profiles.username),
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Catalog Items Table (Frontends and CFW/OS items)
create table if not exists public.items (
  id text primary key,
  type text not null check (type in ('frontend', 'cfw')),
  name text not null,
  short_desc text not null,
  pricing text not null,
  status text not null,

  -- Frontend-specific fields
  supported_platforms text[] default '{}',
  has_built_in_scraper boolean,
  theme_support text,
  touch_optimized boolean,
  gamepad_optimized boolean,
  can_replace_home_launcher boolean,

  -- CFW-specific fields
  category text,
  target_devices text[] default '{}',
  base_system text,
  exploit_type text,
  default_frontend text,

  -- Baseline ratings
  baseline_adoption smallint default 3 check (baseline_adoption between 1 and 5),
  baseline_ease_of_use smallint default 3 check (baseline_ease_of_use between 1 and 5),
  baseline_activity smallint default 3 check (baseline_activity between 1 and 5),

  -- Media & External Links
  logo_url text default '',
  cover_image_url text default '',
  official_url text,
  download_url text,
  github_repo text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_items_type on public.items(type);
create index if not exists idx_items_status on public.items(status);

-- 3. Item Ratings Table (1 vote per user per item; 1 to 5 scores)
create table if not exists public.item_ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id text references public.items(id) on delete cascade not null,
  adoption smallint check (adoption between 1 and 5) not null,
  ease_of_use smallint check (ease_of_use between 1 and 5) not null,
  activity smallint check (activity between 1 and 5) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id)
);

create index if not exists idx_item_ratings_item on public.item_ratings(item_id);
create index if not exists idx_item_ratings_user on public.item_ratings(user_id);

-- 4. Item Reviews Table (User text reviews)
create table if not exists public.item_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id text references public.items(id) on delete cascade not null,
  content text not null check (char_length(content) between 2 and 1500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_item_reviews_item on public.item_reviews(item_id);
create index if not exists idx_item_reviews_user on public.item_reviews(user_id);

-- 5. Materialized or Live Aggregated Stats View
create or replace view public.item_rating_stats as
select
  item_id,
  count(*)::int as vote_count,
  round(avg(adoption)::numeric, 1) as avg_adoption,
  round(avg(ease_of_use)::numeric, 1) as avg_ease_of_use,
  round(avg(activity)::numeric, 1) as avg_activity
from public.item_ratings
group by item_id;

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_ratings enable row level security;
alter table public.item_reviews enable row level security;

-- Items Policies (Public read, Authenticated insert/update/delete)
drop policy if exists "Items are viewable by everyone" on public.items;
create policy "Items are viewable by everyone"
  on public.items for select
  using (true);

drop policy if exists "Authenticated users can insert items" on public.items;
create policy "Authenticated users can insert items"
  on public.items for insert
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update items" on public.items;
create policy "Authenticated users can update items"
  on public.items for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can delete items" on public.items;
create policy "Authenticated users can delete items"
  on public.items for delete
  using (auth.uid() is not null);

-- Profiles Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Item Ratings Policies
drop policy if exists "Ratings are viewable by everyone" on public.item_ratings;
create policy "Ratings are viewable by everyone"
  on public.item_ratings for select
  using (true);

drop policy if exists "Authenticated users can insert/update own rating" on public.item_ratings;
create policy "Authenticated users can insert/update own rating"
  on public.item_ratings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Item Reviews Policies
drop policy if exists "Reviews are viewable by everyone" on public.item_reviews;
create policy "Reviews are viewable by everyone"
  on public.item_reviews for select
  using (true);

drop policy if exists "Authenticated users can insert own review" on public.item_reviews;
create policy "Authenticated users can insert own review"
  on public.item_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update own review" on public.item_reviews;
create policy "Authenticated users can update own review"
  on public.item_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete own review" on public.item_reviews;
create policy "Authenticated users can delete own review"
  on public.item_reviews for delete
  using (auth.uid() = user_id);
