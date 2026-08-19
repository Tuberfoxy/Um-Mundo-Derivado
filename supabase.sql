-- CRX // BANCO DE CRIATURAS
-- Execute no SQL Editor do seu projeto Supabase.
-- Depois crie os usuários em Authentication > Users:
-- mestre  -> mestre@rpg.local
-- rpg123  -> rpg123@rpg.local
-- rpg456  -> rpg456@rpg.local
-- Recomenda-se desativar "Confirm email" para esse sistema de campanha.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  role text not null default 'player' check (role in ('player','master')),
  created_at timestamptz not null default now()
);

create table if not exists public.creatures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text,
  level integer not null default 1,
  porte text not null default 'Médio',
  porte_key text not null default 'medio',
  tipo text,
  habitat text,
  category text not null default 'common' check (category in ('common','player','npc','seasonal')),
  owner_id uuid references public.profiles(id) on delete set null,
  hp integer not null default 1,
  energia integer not null default 0,
  attrs jsonb not null default '{"forca":0,"robustez":0,"agilidade":0,"instinto":0,"afinidade":0,"presenca":0}'::jsonb,
  attacks jsonb not null default '[]'::jsonb,
  perks jsonb not null default '{}'::jsonb,
  specials jsonb not null default '[]'::jsonb,
  loot jsonb not null default '[]'::jsonb,
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

drop trigger if exists creatures_updated_at on public.creatures;
create trigger creatures_updated_at before update on public.creatures
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,username,display_name,role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role','player')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_master()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='master');
$$;

alter table public.profiles enable row level security;
alter table public.creatures enable row level security;

drop policy if exists "profile own read" on public.profiles;
create policy "profile own read" on public.profiles for select using (id=auth.uid() or public.is_master());

drop policy if exists "creatures read authorized" on public.creatures;
create policy "creatures read authorized" on public.creatures for select using (
  public.is_master()
  or (category in ('common','npc'))
  or (category='player' and owner_id=auth.uid())
);

drop policy if exists "master insert" on public.creatures;
create policy "master insert" on public.creatures for insert with check (public.is_master());

drop policy if exists "master update" on public.creatures;
create policy "master update" on public.creatures for update using (public.is_master()) with check (public.is_master());

drop policy if exists "master delete" on public.creatures;
create policy "master delete" on public.creatures for delete using (public.is_master());

-- Depois de criar os usuários, promova o mestre:
-- update public.profiles set role='master' where username='mestre';

-- Para os três personagens atuais, você pode usar o botão de importação no painel do mestre
-- ou inserir manualmente os registros. O site já traz os dados iniciais em seed.js.
