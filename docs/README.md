# Songwriter Archive App

개인 작사가를 위한 작업 관리 및 아카이브 웹앱 문서 세트다.  
이 프로젝트는 의뢰 등록, 마감 관리, 단계별 진행 추적, 제출 완료 기록, 과거 작업 아카이브를 하나의 워크플로우로 묶는 것을 목표로 한다.

## 문서 목록

- `PRD.md`
- `TECH-STACK.md`
- `ARCHITECTURE.md`
- `USER-FLOWS-WIREFRAMES.md`
- `DATA-SCHEMA.md`
- `API-CONTRACT.md`
- `FRONTEND-SPEC.md`
- `SUPABASE-VERCEL-SETUP.md`
- `IMPLEMENTATION-PLAN.md`
- `TESTING-QA.md`
- `SKILL.md`

## 제품 한 줄 정의

작사가가 의뢰 작업의 **받은 날 / 마감일 / 단계별 진행 상태 / 제출 완료 여부 / 과거 아카이브**를 한눈에 관리할 수 있는 웹앱.

## 핵심 기능

1. 작업 등록 및 수정
2. 마감일 기반 정렬과 필터링
3. 3단계 진행 상태 관리
   - 음절
   - 작사 1 - 코러스
   - 작사 2 - 나머지
4. 제출 완료 처리 및 실제 제출일 기록
5. 완료 작업 아카이브
6. 검색, 태그, 메모, 대시보드

## 권장 스택

- Node.js
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## 추가로 꼭 필요한 것

사용자가 제시한 스택 외에 아래 항목은 사실상 필수에 가깝다.

- **Supabase Auth**: 개인 앱이라도 로그인/데이터 분리를 위해 필요
- **React Hook Form + Zod**: 폼 검증 및 입력 안정성
- **TanStack Query 또는 Server Actions 전략**: 데이터 동기화/캐싱 설계
- **shadcn/ui 또는 자체 컴포넌트 규약**: UI 일관성 확보
- **date-fns**: 마감일, D-day, 정렬 계산
- **ESLint / Prettier**: 코드 품질 유지
- **환경변수 관리**: Supabase/Vercel 배포 안정성 확보
- **Row Level Security (RLS)**: 사용자별 데이터 보호

## 빠른 시작 순서

1. `PRD.md`로 범위 확정
2. `DATA-SCHEMA.md` 기준으로 Supabase 테이블 생성
3. `API-CONTRACT.md` 기준으로 CRUD 구현
4. `FRONTEND-SPEC.md` 기준으로 UI 작성
5. `TESTING-QA.md` 기준으로 검증
6. `IMPLEMENTATION-PLAN.md` 순서대로 개발 진행
