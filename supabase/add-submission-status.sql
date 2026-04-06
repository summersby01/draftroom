alter table public.projects
add column if not exists is_accepted boolean not null default false;

update public.projects
set is_accepted = case
  when coalesce(submission_status::text, '') = 'accepted' then true
  else false
end
where true;

alter table public.projects
drop column if exists submission_status;

drop type if exists public.submission_status;
