do $$ begin
  create type public.submission_status as enum ('pending', 'accepted', 'rejected');
exception
  when duplicate_object then null;
end $$;

alter table public.projects
add column if not exists submission_status public.submission_status not null default 'pending';

update public.projects
set submission_status = 'pending'
where submission_status is null;

