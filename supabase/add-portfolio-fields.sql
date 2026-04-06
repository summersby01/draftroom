alter table public.projects
add column if not exists is_portfolio boolean not null default false;

alter table public.projects
add column if not exists accepted_at timestamptz;

alter table public.projects
add column if not exists portfolio_note text;

update public.projects
set
  is_portfolio = false,
  accepted_at = case
    when submission_status = 'accepted' then coalesce(accepted_at, submitted_at, updated_at)
    else null
  end,
  portfolio_note = case
    when coalesce(is_portfolio, false) then portfolio_note
    else null
  end
where true;

