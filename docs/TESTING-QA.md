# TESTING-QA

## 1. 테스트 목표

- 핵심 CRUD 흐름이 깨지지 않는지 확인
- 인증 및 데이터 격리가 안전한지 검증
- 마감/진행률 계산 로직 오류를 방지
- 배포 환경과 로컬 환경 차이를 줄임

## 2. 테스트 범위

### 단위 테스트
- 진행률 계산 함수
- 상태 파생 함수
- D-day 계산 함수
- 폼 검증 스키마

### 통합 테스트
- 서버 액션 또는 API CRUD
- 인증 세션이 있는 상태의 DB 접근
- 필터/정렬 결과 정확성

### E2E 테스트
- 로그인
- 신규 작업 등록
- 상태 변경
- 제출 완료 처리
- 아카이브 확인
- 삭제

## 3. 핵심 테스트 케이스

## 3.1 신규 작업 생성
- 필수값만으로 생성 가능해야 함
- `due_at < received_at`이면 실패해야 함
- 기본 상태값이 올바르게 들어가야 함

## 3.2 상태 변경
- 단계 상태 변경 시 진행률이 올바르게 갱신되어야 함
- `submission_done = true`면 전체 상태가 `submitted`가 되어야 함
- 보류 상태는 수동 지정 가능해야 함

## 3.3 아카이브
- 제출 완료 작업만 표시되어야 함
- 연도 필터가 정확해야 함
- 검색 결과가 올바르게 좁혀져야 함

## 3.4 권한
- 다른 사용자의 project를 조회할 수 없어야 함
- 다른 사용자의 project를 수정/삭제할 수 없어야 함

## 3.5 UI
- 모바일에서 필터 열고 닫기 가능
- 빈 상태가 깨지지 않음
- 긴 제목/긴 메모가 레이아웃을 무너뜨리지 않음

## 4. QA 체크리스트

### 기능 QA
- [ ] 로그인 가능
- [ ] 로그아웃 가능
- [ ] 작업 생성 가능
- [ ] 작업 수정 가능
- [ ] 작업 삭제 가능
- [ ] 제출 완료 체크 가능
- [ ] 대시보드 수치 정확
- [ ] 아카이브 필터 정상 동작

### 데이터 QA
- [ ] user_id 자동 연결
- [ ] 진행률 계산 정확
- [ ] 상태 자동 반영 정확
- [ ] submitted_at 처리 정확

### 배포 QA
- [ ] Vercel preview 정상
- [ ] production 환경변수 정상
- [ ] Supabase redirect URL 정상
- [ ] RLS 정책 production 동작 정상

## 5. 테스트 도구 권장

- Vitest
- Testing Library
- Playwright

## 6. 예시 단위 테스트 항목

### calculateProgressPercent
입력:
- done / done / done → 100
- done / in_progress / not_started → 50
- not_started / not_started / not_started → 0

### deriveProjectStatus
입력:
- submission_done true → submitted
- 일부 진행 → in_progress
- 전부 not_started → planned

## 7. 회귀 테스트 우선순위

배포 전 반드시 확인:
1. 로그인
2. 프로젝트 생성
3. 프로젝트 수정
4. 제출 완료
5. 아카이브 노출
6. 다른 계정에서 데이터 분리 확인

## 8. 버그 기록 템플릿

```txt
제목:
환경:
재현 단계:
기대한 결과:
실제 결과:
심각도:
스크린샷/로그:
```
