-- Run this file in the Supabase SQL editor for a new project.
create extension if not exists pgcrypto;

create table if not exists public.containers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  location text check (location is null or char_length(location) <= 200),
  image_url text check (image_url is null or image_url = '' or image_url ~ '^https?://'),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references public.containers(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  image_url text check (image_url is null or image_url = '' or image_url ~ '^https?://'),
  is_favorited boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists items_container_id_idx on public.items(container_id);
create index if not exists items_is_favorited_idx on public.items(is_favorited) where is_favorited;

alter table public.containers enable row level security;
alter table public.items enable row level security;

-- No public table policies are created. The trusted Express server uses the
-- service-role key and is protected by the application-level access gate.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
