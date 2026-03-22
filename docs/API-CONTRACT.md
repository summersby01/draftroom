# API-CONTRACT

## 1. 원칙

MVP는 **Next.js Server Actions 중심**으로 구현 가능하지만, 문서화와 확장성을 위해 REST 스타일 계약도 정의한다.

Base path 예시:
```txt
/api/projects
```

인증:
- Supabase 세션 기반
- 서버에서 사용자 확인
- 모든 데이터는 인증 사용자 기준으로 제한

---

## 2. 공통 타입

```ts
type ProjectStatus = 'planned' | 'in_progress' | 'submitted' | 'on_hold'
type StageStatus = 'not_started' | 'in_progress' | 'done'
type ProjectType = 'lyrics' | 'adaptation' | 'ost' | 'idol' | 'other'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
```

```ts
interface Project {
  id: string
  title: string
  artist: string | null
  client_name: string | null
  project_type: ProjectType
  priority: Priority
  received_at: string
  due_at: string
  submitted_at: string | null
  status: ProjectStatus
  submission_done: boolean
  syllable_status: StageStatus
  chorus_status: StageStatus
  verse_status: StageStatus
  progress_percent: number
  memo: string | null
  reference_links: string[]
  created_at: string
  updated_at: string
}
```

---

## 3. GET /api/projects

목적:
- 목록 조회
- 검색/필터/정렬 지원

### Query params
- `search`
- `status`
- `project_type`
- `submission_done`
- `sort`
- `order`
- `page`
- `limit`

### Response
```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

---

## 4. GET /api/projects/:id

목적:
- 단일 작업 상세 조회

### Response
```json
{
  "item": {}
}
```

### 에러
- 404: 존재하지 않음 또는 접근 불가

---

## 5. POST /api/projects

목적:
- 신규 작업 생성

### Request body
```json
{
  "title": "가제 곡명",
  "artist": "Artist",
  "client_name": "Client",
  "project_type": "lyrics",
  "priority": "medium",
  "received_at": "2026-03-22",
  "due_at": "2026-03-30",
  "syllable_status": "not_started",
  "chorus_status": "not_started",
  "verse_status": "not_started",
  "memo": "메모"
}
```

### Response
```json
{
  "item": {}
}
```

### 검증 규칙
- `title` 필수
- `received_at` 필수
- `due_at` 필수
- `due_at >= received_at`

---

## 6. PATCH /api/projects/:id

목적:
- 부분 수정

### Request body 예시
```json
{
  "chorus_status": "in_progress",
  "memo": "코러스 초안 진행 중"
}
```

### 서버 동작
- 단계 상태 변경 시 `progress_percent` 재계산
- `submission_done = true`면 `status = submitted`
- 제출일 로직 반영

### Response
```json
{
  "item": {}
}
```

---

## 7. DELETE /api/projects/:id

목적:
- 작업 삭제

### Response
```json
{
  "ok": true
}
```

---

## 8. GET /api/dashboard

목적:
- 대시보드 요약 데이터 조회

### Response 예시
```json
{
  "summary": {
    "due_soon_count": 3,
    "in_progress_count": 5,
    "submission_pending_count": 2,
    "completed_this_month_count": 4
  },
  "due_soon_items": [],
  "recent_items": [],
  "recent_completed_items": []
}
```

---

## 9. GET /api/archive

목적:
- 완료 작업 전용 조회

### Query params
- `search`
- `year`
- `artist`
- `project_type`
- `sort`
- `page`
- `limit`

### 기본 조건
- `submission_done = true`

---

## 10. Zod 스키마 예시

```ts
import { z } from 'zod'

export const stageStatusSchema = z.enum(['not_started', 'in_progress', 'done'])
export const projectStatusSchema = z.enum(['planned', 'in_progress', 'submitted', 'on_hold'])
export const projectTypeSchema = z.enum(['lyrics', 'adaptation', 'ost', 'idol', 'other'])
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().max(200).optional().or(z.literal('')),
  client_name: z.string().max(200).optional().or(z.literal('')),
  project_type: projectTypeSchema.default('lyrics'),
  priority: prioritySchema.default('medium'),
  received_at: z.string(),
  due_at: z.string(),
  syllable_status: stageStatusSchema.default('not_started'),
  chorus_status: stageStatusSchema.default('not_started'),
  verse_status: stageStatusSchema.default('not_started'),
  memo: z.string().max(5000).optional().or(z.literal(''))
})
```

---

## 11. 에러 포맷

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "due_at must be greater than or equal to received_at"
  }
}
```

권장 코드:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`
