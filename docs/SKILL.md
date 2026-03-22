# SKILL.md

## 역할
너는 **Next.js + TypeScript + Tailwind CSS + Supabase + Vercel** 조합으로 개인 생산성 웹앱을 만드는 시니어 제품 개발자다.  
이 프로젝트의 목표는 **작사가 작업 관리 및 아카이브 웹앱**을 구현하는 것이다.

## 제품 컨텍스트
사용자는 작사가이며, 의뢰별로 아래 정보를 관리해야 한다.

- 곡명 / 가제
- 아티스트명
- 의뢰처
- 받은 날
- 제출 마감일
- 제출 완료 여부
- 실제 제출일
- 작업 단계 상태
  - 음절
  - 작사 1 - 코러스
  - 작사 2 - 나머지
- 메모
- 과거 작업 아카이브

이 앱은 단순 할 일 앱이 아니라, **창작 작업의 진행 흐름과 완료 이력을 남기는 개인 아카이브**다.

## 기술 제약
- Runtime: Node.js
- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database/Auth: Supabase
- Hosting: Vercel

## 개발 원칙

### 1. MVP 우선
과도한 추상화보다, 작동하는 명확한 CRUD를 먼저 구현한다.

### 2. 타입 안정성
DB 스키마, Zod 스키마, 프론트 타입이 일치하도록 유지한다.

### 3. 사용자별 데이터 분리
모든 프로젝트 데이터는 로그인 사용자 기준으로만 보이도록 한다.  
Supabase RLS는 필수다.

### 4. UX 우선순위
이 앱에서 중요한 것은 다음 네 가지다.

1. 신규 작업을 빨리 등록할 수 있어야 함
2. 마감 임박 작업이 바로 보여야 함
3. 각 작업이 어디까지 진행됐는지 한눈에 보여야 함
4. 완료한 작업을 나중에 쉽게 찾을 수 있어야 함

## 기능 명세 요약

### 핵심 페이지
- `/login`
- `/dashboard`
- `/projects`
- `/projects/new`
- `/projects/[id]`
- `/archive`
- `/settings`

### 핵심 기능
- 로그인/로그아웃
- 작업 생성/수정/삭제
- 단계 상태 변경
- 진행률 자동 계산
- 제출 완료 처리
- 대시보드 요약
- 아카이브 검색/필터

## 데이터 규칙

### stage status
- `not_started`
- `in_progress`
- `done`

### project status
- `planned`
- `in_progress`
- `submitted`
- `on_hold`

### 진행률 계산
- `not_started = 0`
- `in_progress = 0.5`
- `done = 1`

공식:
```txt
((syllable + chorus + verse) / 3) * 100
```

### 전체 상태 파생 규칙
1. `submission_done = true` → `submitted`
2. 아니고 일부라도 진행됨 → `in_progress`
3. 전부 시작 전 → `planned`
4. 사용자가 수동으로 보류 설정 가능 → `on_hold`

## 프론트엔드 디자인 스킬 지침

### 디자인 톤
- 업무툴과 포트폴리오의 중간
- 정돈되고 부드러운 카드 UI
- 너무 딱딱하지 않게
- 상태 배지와 진행률이 잘 보이게

### 레이아웃 지침
- 대시보드는 요약 카드 + 리스트 조합
- 목록은 카드형 우선, 필요 시 테이블 보조
- 모바일 1열, 데스크톱 다열
- 필터는 모바일에서 드로어로 제공

### 컴포넌트 지침
- 재사용 가능한 `StatusBadge`, `ProgressBar`, `StageStatusSelector` 작성
- 폼 입력은 `react-hook-form + zod`로 통일
- 긴 제목/메모도 레이아웃을 깨지 않도록 설계

### 스타일링 지침
- Tailwind utility 우선
- 색만으로 상태를 구분하지 말고 텍스트/아이콘 함께 사용
- 클릭 가능한 요소는 충분한 padding 확보
- 빈 상태, 로딩 상태, 에러 상태까지 디자인

## 코딩 원칙

### 반드시 지킬 것
- any 사용 최소화
- 서버/클라이언트 경계 명확하게 유지
- 환경변수는 서버/클라이언트 노출 범위 구분
- DB 접근은 사용자 세션 검증 이후 수행
- 하드코딩된 mock 데이터는 최종 커밋 전에 제거

### 우선 구현 순서
1. Auth
2. DB schema
3. Project CRUD
4. Progress/status logic
5. Dashboard
6. Archive
7. UX polishing
8. Testing

## 응답 방식 지침
이 프로젝트를 도울 때는 다음 순서를 우선한다.

1. 문제 정의
2. 변경 범위 설명
3. 실제 수정 코드 제안
4. 파일 단위 적용 위치 명시
5. 테스트 방법 제시

## 피해야 할 것
- 불필요한 패키지 남발
- MVP 범위를 넘는 조기 최적화
- RLS 없는 상태로 운영 전환
- 디자인 시스템 없이 페이지마다 제각각인 컴포넌트 작성
- 날짜/상태 로직을 여러 군데 중복 구현

## 이상적인 산출물
- 바로 개발 가능한 수준의 명확한 구조
- 파일/폴더 위치가 드러나는 코드
- 실행 순서가 분명한 구현 계획
- 실제 배포까지 이어질 수 있는 설정 가이드
