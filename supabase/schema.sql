create extension if not exists pgcrypto;

do $$ begin
  create type public.project_type as enum ('lyrics', 'adaptation', 'ost', 'idol', 'topline', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.stage_status as enum ('not_started', 'in_progress', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.overall_status as enum ('planned', 'in_progress', 'submitted', 'on_hold', 'overdue');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_history_action_type as enum (
    'project_created',
    'project_updated',
    'stage_updated',
    'due_date_changed',
    'submission_marked',
    'submission_unmarked',
    'note_updated'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  client text,
  project_type public.project_type not null default 'lyrics',
  received_at date not null default current_date,
  due_at date not null,
  due_time time,
  submitted_at timestamptz,
  overall_status public.overall_status not null default 'planned',
  submission_done boolean not null default false,
  syllable_status public.stage_status not null default 'not_started',
  chorus_status public.stage_status not null default 'not_started',
  verse_status public.stage_status not null default 'not_started',
  notes text,
  progress_percent integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint projects_title_length check (char_length(title) <= 120),
  constraint projects_due_after_received check (due_at >= received_at),
  constraint projects_progress_percent_range check (progress_percent >= 0 and progress_percent <= 100)
);

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_due_at on public.projects(due_at);
create index if not exists idx_projects_status on public.projects(overall_status);
create index if not exists idx_projects_submission_done on public.projects(submission_done);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

create table if not exists public.project_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type public.project_history_action_type not null,
  field_name text,
  old_value text,
  new_value text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_history_project_id on public.project_history(project_id);
create index if not exists idx_project_history_user_id on public.project_history(user_id);
create index if not exists idx_project_history_created_at on public.project_history(created_at desc);

alter table public.projects
alter column received_at set default current_date;

alter table public.projects
add column if not exists due_time time;

create or replace function public.calculate_project_progress(
  syllable public.stage_status,
  chorus public.stage_status,
  verse public.stage_status
)
returns integer
language sql
immutable
as $$
  select round((
    (case syllable when 'not_started' then 0 when 'in_progress' then 0.5 else 1 end) +
    (case chorus when 'not_started' then 0 when 'in_progress' then 0.5 else 1 end) +
    (case verse when 'not_started' then 0 when 'in_progress' then 0.5 else 1 end)
  ) / 3 * 100)::numeric)::integer;
$$;

create or replace function public.derive_overall_status(
  manual_status public.overall_status,
  submission_done boolean,
  due_at date,
  due_time time,
  syllable public.stage_status,
  chorus public.stage_status,
  verse public.stage_status
)
returns public.overall_status
language plpgsql
stable
as $$
begin
  if submission_done then
    return 'submitted';
  end if;

  if manual_status = 'on_hold' then
    return 'on_hold';
  end if;

  if due_time is not null then
    if ((due_at::timestamp + due_time) at time zone 'Asia/Seoul') < now() then
      return 'overdue';
    end if;
  elsif due_at < current_date then
    return 'overdue';
  end if;

  if syllable <> 'not_started' or chorus <> 'not_started' or verse <> 'not_started' then
    return 'in_progress';
  end if;

  return 'planned';
end;
$$;

create or replace function public.apply_project_derived_fields()
returns trigger
language plpgsql
as $$
begin
  new.progress_percent := public.calculate_project_progress(new.syllable_status, new.chorus_status, new.verse_status);
  new.overall_status := public.derive_overall_status(
    coalesce(new.overall_status, 'planned'),
    new.submission_done,
    new.due_at,
    new.due_time,
    new.syllable_status,
    new.chorus_status,
    new.verse_status
  );

  if new.submission_done and new.submitted_at is null then
    new.submitted_at := timezone('utc', now());
  elsif not new.submission_done then
    new.submitted_at := null;
  end if;

  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_projects_derived_fields on public.projects;
create trigger trg_projects_derived_fields
before insert or update on public.projects
for each row
execute function public.apply_project_derived_fields();

alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects"
on public.projects
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
on public.projects
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
on public.projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
on public.projects
for delete
using (auth.uid() = user_id);

alter table public.project_history enable row level security;

drop policy if exists "Users can view own project history" on public.project_history;
create policy "Users can view own project history"
on public.project_history
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own project history" on public.project_history;
create policy "Users can insert own project history"
on public.project_history
for insert
with check (auth.uid() = user_id);
