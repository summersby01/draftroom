with latest_submission_events as (
  select
    ph.project_id,
    max(ph.created_at) as submitted_at
  from public.project_history ph
  where ph.action_type = 'submission_marked'
  group by ph.project_id
)
update public.projects p
set
  submitted_at = coalesce(latest_submission_events.submitted_at, p.updated_at, p.created_at),
  overall_status = 'submitted'
from latest_submission_events
where
  p.id = latest_submission_events.project_id
  and p.submission_done = true
  and p.submitted_at is null;

update public.projects p
set
  submitted_at = coalesce(p.updated_at, p.created_at),
  overall_status = 'submitted'
where
  p.submission_done = true
  and p.submitted_at is null;
