# TECH-STACK

## 1. 필수 스택

| 영역 | 선택 |
|---|---|
| Runtime | Node.js 20+ |
| Frontend / Fullstack | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Hosting | Vercel |

## 2. 강력 권장 라이브러리

| 목적 | 추천 |
|---|---|
| 폼 관리 | React Hook Form |
| 스키마 검증 | Zod |
| 날짜 처리 | date-fns |
| UI 컴포넌트 | shadcn/ui |
| 아이콘 | lucide-react |
| 상태 표시/토스트 | sonner 또는 shadcn toast |
| 테이블/목록 | TanStack Table (선택) |
| 데이터 패칭 | Server Actions + revalidatePath, 또는 TanStack Query |
| 클래스 병합 | clsx + tailwind-merge |

## 3. 왜 이 구성이 적합한가

### Next.js
- 라우팅, 서버 렌더링, API, 배포 흐름이 한 프레임워크에 묶임
- Vercel과 궁합이 좋음

### TypeScript
- 폼/DB/API 타입 불일치 방지
- 작업 상태 enum 관리가 안정적

### Tailwind CSS
- 카드형 UI, 배지, 대시보드 레이아웃에 적합
- 빠른 프로토타이핑 가능

### Supabase
- Postgres 기반이라 데이터 구조가 명확함
- Auth, RLS, 테이블 관리가 쉬움
- 개인 프로젝트에서 운영 부담이 낮음

## 4. 폴더 구조 권장안

```txt
src/
  app/
    (auth)/
      login/
    (app)/
      dashboard/
      projects/
        new/
        [id]/
      archive/
      settings/
    api/
  components/
    common/
    dashboard/
    projects/
    archive/
    forms/
    ui/
  lib/
    supabase/
    utils/
    validations/
    constants/
  types/
  hooks/
  actions/
```

## 5. 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

주의:
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- 브라우저 번들에 포함되면 안 됨

## 6. 추가로 고려할 것

### 필수에 가까운 항목
1. **Supabase Auth**
2. **RLS 정책**
3. **에러 추적**
   - 초반엔 console + Vercel logs로 충분
   - 이후 Sentry 추가 고려
4. **디자인 시스템 규칙**
5. **테스트 러너**
   - Vitest / Playwright

## 7. 배포 정책

- Preview: feature branch마다 Vercel preview
- Production: `main` merge 시 자동 배포
- DB migration: SQL 파일 또는 Supabase migration 관리
