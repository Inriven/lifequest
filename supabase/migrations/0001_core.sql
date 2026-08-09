create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  rank text not null default 'Искатель I',
  xp bigint not null default 0,
  crystals bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  group_key text not null default 'world',
  status text not null default 'open',
  scheduled_at timestamptz,
  estimated_minutes int,
  xp_reward int not null default 0,
  goal_id uuid,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  status text not null default 'active',
  target_date date,
  created_at timestamptz not null default now()
);

alter table public.tasks
  add constraint tasks_goal_id_fkey foreign key (goal_id) references public.goals(id) on delete set null;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  level int not null default 1,
  xp bigint not null default 0,
  unique(user_id, name)
);

create table if not exists public.skill_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  delta_xp int not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.timers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  duration_ms bigint not null,
  started_at timestamptz,
  paused_at timestamptz,
  accumulated_pause_ms bigint not null default 0,
  status text not null default 'idle',
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  image_url text,
  source_url text,
  store text,
  price numeric(12,2),
  currency text,
  status text not null default 'wanted',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.skills enable row level security;
alter table public.skill_events enable row level security;
alter table public.timers enable row level security;
alter table public.wishlist_items enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "tasks own rows" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals own rows" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skills own rows" on public.skills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skill events own rows" on public.skill_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "timers own rows" on public.timers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist own rows" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
