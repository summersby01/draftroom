# IMPLEMENTATION-PLAN

## 개발 원칙

- 먼저 MVP를 끝내고 확장
- 구조를 과하게 일반화하지 않기
- CRUD와 데이터 일관성을 먼저 안정화
- 디자인은 MVP 이후 고도화 가능

---

## Phase 0. 프로젝트 초기 세팅

### 목표
개발 가능한 기본 환경 확보

### 작업
- Next.js + TypeScript 프로젝트 생성
- Tailwind CSS 설정
- ESLint / Prettier 설정
- shadcn/ui 초기화
- Supabase 프로젝트 생성
- 환경변수 세팅
- 기본 레이아웃 생성

### 완료 기준
- 로컬 실행 가능
- Vercel preview 배포 가능

---

## Phase 1. 인증 + 데이터베이스

### 목표
사용자별 데이터 분리 기반 확보

### 작업
- Supabase Auth 연동
- 로그인/로그아웃 UI
- `projects` 테이블 생성
- RLS 정책 적용
- 서버/클라이언트 Supabase 유틸 작성

### 완료 기준
- 로그인 가능
- 사용자별로 자기 데이터만 조회 가능

---

## Phase 2. 프로젝트 CRUD

### 목표
핵심 도메인 기능 완성

### 작업
- 신규 작업 생성 폼
- 목록 조회
- 상세 조회
- 수정
- 삭제
- Zod 검증
- 진행률 계산 유틸
- 상태 자동 반영 유틸

### 완료 기준
- 작업 CRUD 전체 가능
- 입력 오류 처리 가능

---

## Phase 3. 대시보드 + 필터 + 아카이브

### 목표
실사용 가능한 탐색성과 운영감 확보

### 작업
- 대시보드 요약 카드
- 마감 임박 목록
- 검색/필터/정렬
- 아카이브 페이지
- 연도별 그룹핑
- 빈 상태/에러 상태 UI

### 완료 기준
- 현재 작업과 완료 작업을 명확히 구분 가능
- 마감 임박 작업 파악 가능

---

## Phase 4. UX 개선

### 목표
반응성과 사용감 개선

### 작업
- 토스트
- optimistic UI 일부 적용
- 모바일 필터 드로어
- 키보드 접근성 점검
- 로딩 skeleton 추가
- 삭제 확인 모달

### 완료 기준
- 기본적인 상용 수준 UX 확보

---

## Phase 5. 테스트와 안정화

### 목표
실사용 중 오류를 줄임

### 작업
- 단위 테스트
- 통합 테스트
- 핵심 사용자 시나리오 E2E
- 배포 환경 점검
- 로그 확인

### 완료 기준
- 주요 흐름 회귀 테스트 가능

---

## 구현 우선순위

### 반드시 먼저
1. Auth
2. Projects schema
3. Create / Read / Update / Delete
4. Progress 계산
5. Dashboard
6. Archive

### 나중에
- 태그
- 첨부파일
- 통계
- 외부 캘린더
- 알림

---

## 예상 컴포넌트 목록

- `AppSidebar`
- `TopHeader`
- `SummaryCard`
- `ProjectCard`
- `ProjectForm`
- `StageStatusSelector`
- `ProgressBar`
- `ArchiveList`
- `EmptyState`
- `DeleteProjectDialog`

---

## 개발 체크리스트

### 초기
- [ ] 프로젝트 생성
- [ ] Tailwind 설정
- [ ] Supabase 연결
- [ ] 환경변수 설정

### 인증
- [ ] 로그인 페이지
- [ ] 보호 라우트
- [ ] 로그아웃

### 데이터
- [ ] 테이블 생성
- [ ] RLS 적용
- [ ] CRUD 액션 구현

### UI
- [ ] 대시보드
- [ ] 목록
- [ ] 상세
- [ ] 아카이브

### 품질
- [ ] 검증
- [ ] 테스트
- [ ] 에러 처리
- [ ] 배포 점검
