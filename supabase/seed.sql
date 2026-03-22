-- Replace the UUID below with a real auth.users id from your Supabase project before running.
insert into public.projects (
  user_id,
  title,
  artist,
  client,
  project_type,
  received_at,
  due_at,
  submission_done,
  syllable_status,
  chorus_status,
  verse_status,
  notes
) values
  (
    '00000000-0000-0000-0000-000000000000',
    'Paper Moon',
    'Lena Vale',
    'Northbound Publishing',
    'lyrics',
    current_date - interval '6 day',
    current_date - interval '1 day',
    false,
    'completed',
    'in_progress',
    'not_started',
    'Needs a cleaner pre-chorus transition and a stronger city-night image.'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Glass Diary',
    'Mira June',
    'Studio Meridian',
    'ost',
    current_date - interval '4 day',
    current_date + interval '3 day',
    false,
    'completed',
    'completed',
    'in_progress',
    'Client wants a gentler bridge and less literal rain imagery.'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Static Bloom',
    'Neon Chapter',
    'Harbor Sounds',
    'idol',
    current_date - interval '18 day',
    current_date - interval '10 day',
    true,
    'completed',
    'completed',
    'completed',
    'Delivered final lyric sheet and clean Romanization notes.'
  );
