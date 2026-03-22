# DATA-SCHEMA

## 1. 데이터 모델 개요

MVP 기준 핵심 테이블은 `projects` 하나로 충분하다.  
다만 확장을 고려해 `profiles`, `project_tags`, `project_activity_logs`를 옵션으로 둔다.

---

## 2. ENUM 정의

### project_status
- `planned`
- `in_progress`
- `submitted`
- `on_hold`

### stage_status
- `not_started`
- `in_progress`
- `done`

### project_type
- `lyrics`
- `adaptation`
- `ost`
- `idol`
- `other`

### priority_level
- `low`
- `medium`
- `high`
- `urgent`

---

## 3. 테이블: profiles (선택)

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 4. 테이블: projects

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  artist text,
  client_name text,
  project_type text not null default 'lyrics',
  priority text not null default 'medium',

  received_at date not null,
  due_at date not null,
  submitted_at date,

  status text not null default 'planned',
  submission_done boolean not null default false,

  syllable_status text not null default 'not_started',
  chorus_status text not null default 'not_started',
  verse_status text not null default 'not_started',

  progress_percent integer not null default 0,

  memo text,
  reference_links jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 5. 제약조건

```sql
alter table public.projects
  add constraint projects_due_after_received
  check (due_at >= received_at);

alter table public.projects
  add constraint projects_progress_percent_range
  check (progress_percent >= 0 and progress_percent <= 100);

alter table public.projects
  add constraint projects_status_check
  check (status in ('planned', 'in_progress', 'submitted', 'on_hold'));

alter table public.projects
  add constraint projects_type_check
  check (project_type in ('lyrics', 'adaptation', 'ost', 'idol', 'other'));

alter table public.projects
  add constraint projects_priority_check
  check (priority in ('low', 'medium', 'high', 'urgent'));

alter table public.projects
  add constraint projects_syllable_status_check
  check (syllable_status in ('not_started', 'in_progress', 'done'));

alter table public.projects
  add constraint projects_chorus_status_check
  check (chorus_status in ('not_started', 'in_progress', 'done'));

alter table public.projects
  add constraint projects_verse_status_check
  check (verse_status in ('not_started', 'in_progress', 'done'));
```

---

## 6. 인덱스

```sql
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_due_at on public.projects(due_at);
create index idx_projects_status on public.projects(status);
create index idx_projects_submission_done on public.projects(submission_done);
create index idx_projects_artist on public.projects(artist);
create index idx_projects_created_at on public.projects(created_at desc);
```

제목 검색 빈도가 높으면:
```sql
create extension if not exists pg_trgm;
create index idx_projects_title_trgm on public.projects using gin (title gin_trgm_ops);
```

---

## 7. 진행률 계산 규칙

### 점수 매핑
- `not_started` = 0
- `in_progress` = 0.5
- `done` = 1

### 계산식
```txt
((syllable + chorus + verse) / 3) * 100
```

### 예시
- done / done / done → 100
- done / in_progress / not_started → 50
- not_started / not_started / not_started → 0

---

## 8. 상태 자동 반영 규칙

### 전체 status 계산 예시
1. `submission_done = true` 이면 `submitted`
2. 아니고 어느 하나라도 `in_progress` 또는 `done`이면 `in_progress`
3. 전부 `not_started`면 `planned`
4. 사용자가 명시적으로 `on_hold` 지정 가능

---

## 9. 트리거 예시

```sql
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.update_updated_at_column();
```

진행률 자동화는 앱 레이어에서 처리해도 되고, DB 함수로 처리해도 된다.  
MVP는 앱 레이어 계산이 단순하다.

---

## 10. RLS 정책

```sql
alter table public.projects enable row level security;

create policy "Users can view own projects"
on public.projects
for select
using (auth.uid() = user_id);

create policy "Users can insert own projects"
on public.projects
for insert
with check (auth.uid() = user_id);

create policy "Users can update own projects"
on public.projects
for update
using (auth.uid() = user_id);

create policy "Users can delete own projects"
on public.projects
for delete
using (auth.uid() = user_id);
```

---

## 11. 확장 테이블 제안

### project_tags
작업 유형 외에 자유 태그를 붙이고 싶을 때

### project_activity_logs
상태 변경 이력 추적이 필요할 때

### project_attachments
파일 첨부 기능 추가 시
