-- Project Parallax — backend schema
-- Shared sightings DB + moderation queue + push-subscription/watch-zone storage.
-- Requires PostGIS for "sightings within a radius" matching.

create extension if not exists postgis;
create extension if not exists pgcrypto;

-- ---------- Sightings (citizen submissions) ----------
create table if not exists public.sightings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  location      text not null,
  lat           double precision not null,
  lon           double precision not null,
  -- generated geography point for fast radius queries
  geog          geography(Point,4326)
                generated always as (ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) stored,
  year          int,
  shape         text,
  description   text not null,
  heading       int,           -- compass bearing captured on device
  tilt          int,           -- device tilt
  photo_url     text,
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  reporter_id   uuid references auth.users(id) on delete set null,
  moderated_at  timestamptz,
  moderated_by  uuid
);
create index if not exists sightings_geog_idx   on public.sightings using gist (geog);
create index if not exists sightings_status_idx on public.sightings (status);

-- ---------- Push subscriptions + their watch zones ----------
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  endpoint    text unique not null,
  p256dh      text not null,
  auth        text not null,
  user_id     uuid references auth.users(id) on delete cascade
);

create table if not exists public.watch_zones (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  subscription_id  uuid not null references public.push_subscriptions(id) on delete cascade,
  name             text,
  lat              double precision not null,
  lon              double precision not null,
  radius_km        double precision not null,
  center           geography(Point,4326)
                   generated always as (ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) stored
);
create index if not exists watch_zones_center_idx on public.watch_zones using gist (center);

-- ---------- Row-Level Security ----------
-- Public app: the world may READ approved sightings only. Everything else is
-- performed by Edge Functions using the service-role key (which bypasses RLS).
alter table public.sightings          enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.watch_zones        enable row level security;

drop policy if exists "read approved sightings" on public.sightings;
create policy "read approved sightings"
  on public.sightings for select
  using (status = 'approved');
-- (no anon insert/update policies: submissions & moderation go through Edge Functions)

-- ---------- Radius match: subscribers whose watch zone contains a point ----------
create or replace function public.subscribers_near(p_lat double precision, p_lon double precision)
returns table(endpoint text, p256dh text, auth text)
language sql stable as $$
  select distinct ps.endpoint, ps.p256dh, ps.auth
  from public.watch_zones wz
  join public.push_subscriptions ps on ps.id = wz.subscription_id
  where ST_DWithin(
    wz.center,
    ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
    wz.radius_km * 1000
  );
$$;

-- ---------- Storage bucket for sighting photos (public read) ----------
insert into storage.buckets (id, name, public)
values ('sighting-photos', 'sighting-photos', true)
on conflict (id) do nothing;
