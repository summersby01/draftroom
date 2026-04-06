alter table public.projects
add column if not exists is_portfolio boolean not null default false;

alter table public.projects
add column if not exists accepted_at timestamptz;

alter table public.projects
add column if not exists is_accepted boolean not null default false;

alter table public.projects
add column if not exists portfolio_note text;

update public.projects
set
  is_accepted = coalesce(is_accepted, false),
  is_portfolio = case
    when coalesce(is_accepted, false) then coalesce(is_portfolio, false)
    else false
  end,
  accepted_at = case
    when coalesce(is_accepted, false) then coalesce(accepted_at, submitted_at, updated_at)
    else null
  end,
  portfolio_note = case
    when coalesce(is_accepted, false) and coalesce(is_portfolio, false) then portfolio_note
    else null
  end
where true;
