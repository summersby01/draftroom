# SUPABASE-VERCEL-SETUP

## 1. Supabase 준비

1. Supabase 프로젝트 생성
2. Authentication 활성화
3. Database 생성
4. SQL Editor에서 `DATA-SCHEMA.md`의 SQL 실행
5. RLS 정책 적용 확인

## 2. Auth 설정

개인 앱 MVP 기준 추천:
- Email Magic Link
- 또는 이메일/비밀번호

설정 항목:
- Site URL: Vercel production URL
- Redirect URL:
  - local: `http://localhost:3000`
  - production: `https://your-app.vercel.app`

## 3. 환경변수 준비

### Next.js 로컬 `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Vercel 환경변수
동일한 키를 Project Settings > Environment Variables에 등록

주의:
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- 클라이언트 컴포넌트에서 사용 금지

## 4. 패키지 설치 예시

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form zod @hookform/resolvers
npm install date-fns clsx tailwind-merge lucide-react
```

shadcn/ui 사용 시:
```bash
npx shadcn@latest init
```

## 5. Supabase 클라이언트 파일 구조 예시

```txt
src/lib/supabase/
  client.ts
  server.ts
  middleware.ts
```

## 6. middleware 고려

인증 보호가 필요한 라우트:
- `/dashboard`
- `/projects`
- `/archive`
- `/settings`

비로그인 사용자는 `/login`으로 리다이렉트

## 7. Vercel 배포 흐름

1. GitHub 저장소 연결
2. Framework preset: Next.js
3. 환경변수 입력
4. main 브랜치 production 배포
5. PR/브랜치 preview 자동 생성

## 8. 도메인/배포 체크리스트

- production URL 확인
- Supabase redirect URL 반영
- 로그인 후 콜백 동작 확인
- 서버 액션/쿠키 동작 확인
- RLS 정책 production에서도 정상인지 확인

## 9. 운영 체크

### 반드시 점검할 것
- 로그인 성공 여부
- 다른 계정 간 데이터 분리 여부
- 작업 생성/수정/삭제 여부
- 배포 후 환경변수 누락 여부
- due date 정렬 정확성

## 10. 백업/마이그레이션

권장:
- SQL migration 파일 버전관리
- 중요한 스키마 변경 전 백업
- Supabase Studio에서 수동 수정만 하지 말고 코드로 남기기

## 11. 자주 생기는 문제

### 문제 1. 로그인 되는데 데이터가 안 보임
원인 후보:
- RLS 정책 누락
- `user_id` 저장 누락
- 세션 전달 문제

### 문제 2. 로컬은 되는데 Vercel에서 실패
원인 후보:
- 환경변수 누락
- Redirect URL 불일치
- 서비스 키 사용 위치 오류

### 문제 3. insert/update는 되는데 목록 반영이 늦음
원인 후보:
- revalidatePath 누락
- client cache 갱신 누락
