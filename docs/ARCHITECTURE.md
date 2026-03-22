# ARCHITECTURE

## 1. 아키텍처 개요

이 프로젝트는 **Next.js + Supabase** 기반의 단일 웹앱 구조를 사용한다.

```txt
Browser
  ↓
Next.js App (Vercel)
  ├─ Server Components
  ├─ Client Components
  ├─ Server Actions / Route Handlers
  ↓
Supabase
  ├─ Auth
  ├─ Postgres
  └─ RLS
```

## 2. 시스템 구성 요소

### 2.1 Client
- 폼 입력
- 필터/정렬 UI
- 상태 토글
- 대시보드 카드 인터랙션

### 2.2 Next.js Server
- 인증 세션 처리
- 초기 데이터 로딩
- 서버 액션을 통한 CRUD
- 캐시 무효화

### 2.3 Supabase
- 사용자 인증
- 작업 데이터 저장
- 사용자별 접근 통제

## 3. 데이터 흐름

### 작업 생성
1. 사용자가 작업 생성 폼 입력
2. 클라이언트 검증
3. 서버 액션 호출
4. Zod 서버 검증
5. Supabase insert
6. 성공 시 목록/대시보드 revalidate
7. 상세 또는 목록으로 이동

### 작업 상태 변경
1. 사용자가 단계 상태 클릭
2. 업데이트 액션 호출
3. 전체 진행률 재계산
4. DB update
5. 관련 페이지 revalidate

### 제출 완료
1. 제출 완료 토글
2. 제출일 자동 입력 또는 수동 입력
3. 전체 상태 `submitted`로 반영
4. 아카이브 쿼리 조건 충족

## 4. 권장 테이블 관계

```txt
auth.users
   └─ profiles (1:1) [선택]
   └─ projects (1:N)
         └─ project_tags (N:M) [선택]
         └─ project_activity_logs (1:N) [선택]
```

## 5. 렌더링 전략

### Server Components
- 대시보드 초기 데이터
- 프로젝트 목록
- 아카이브 기본 리스트

### Client Components
- 필터 패널
- 검색 입력
- 상태 드롭다운
- 인터랙티브 카드
- 모달/드로어

## 6. 인증 전략

- Supabase Auth 이메일 로그인 또는 매직링크
- 앱 진입 전 세션 확인
- 비로그인 상태는 `/login` 리다이렉트

## 7. 권한 전략

### 기본 원칙
- 모든 `projects` 데이터는 `user_id = auth.uid()` 조건으로만 접근

### RLS 예시 원칙
- SELECT: 본인 데이터만
- INSERT: 본인 `user_id`만 허용
- UPDATE: 본인 데이터만
- DELETE: 본인 데이터만

## 8. API 선택 전략

이 프로젝트는 두 가지 구현 방식 중 하나를 선택할 수 있다.

### 권장: Server Actions 중심
- Next.js App Router와 자연스럽게 맞음
- 폼 처리 단순
- 파일 수가 과도하게 늘지 않음

### 대안: Route Handlers 기반 REST API
- 외부 앱 확장에 유리
- 문서화가 명확
- 모바일 앱 확장 가능성 있으면 장점

MVP는 **Server Actions + 최소 Route Handler** 조합이 적절하다.

## 9. 성능 고려

- 대시보드는 필요한 데이터만 aggregate
- 목록 페이지는 pagination 또는 infinite scroll 고려
- 검색은 제목/아티스트/의뢰처에 인덱스 고려
- 과도한 client state 누적 피하기

## 10. 로깅/관찰성

초기:
- Vercel 로그
- Supabase 로그

확장:
- Sentry
- PostHog 또는 Amplitude

## 11. 향후 확장 아키텍처

- Storage 추가: 파일 첨부
- Cron/Edge Functions: 마감 알림
- 외부 캘린더 연동
- 통계 이벤트 수집
