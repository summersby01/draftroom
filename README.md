# Draft Room

Draft Room is a production-leaning MVP for songwriters managing commissioned lyric-writing projects and a searchable archive of completed work.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- shadcn-style UI components
- React Hook Form + Zod
- date-fns
- Lucide icons

## Project Structure

```txt
app/
  (app)/
    archive/
    dashboard/
    projects/
      [id]/
      new/
  actions/
  login/
components/
  dashboard/
  forms/
  layout/
  projects/
  ui/
lib/
  data/
  supabase/
  validators/
types/
supabase/
  schema.sql
  seed.sql
docs/
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is not required by the current MVP flow, but it is included for admin scripts and future background jobs.

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Run the SQL in [supabase/schema.sql](/Users/user/Documents/draftroom/supabase/schema.sql) in the Supabase SQL editor.

3. Create at least one email/password user in Supabase Auth.

4. Optional: edit the placeholder UUID in [supabase/seed.sql](/Users/user/Documents/draftroom/supabase/seed.sql) and run it to load realistic sample data.

5. Start the app.

```bash
npm run dev
```

## Notes on the MVP

- All project rows are scoped by `user_id` and protected by RLS.
- Progress and overall status are derived again in Postgres triggers so the database stays authoritative.
- `on_hold` is preserved as a manual override until a project is submitted.
- Submitted projects populate the archive; active work remains on the dashboard and projects list.

## Main Flows

- `/login`: Supabase Auth sign-in
- `/dashboard`: overdue, due soon, in-progress, monthly submitted, recent updates
- `/projects`: searchable/filterable project list
- `/projects/new`: create flow
- `/projects/[id]`: editable detail page with delete confirmation
- `/archive`: submitted work grouped by year

## Verification

After installing dependencies, run:

```bash
npm run lint
npm run typecheck
```
