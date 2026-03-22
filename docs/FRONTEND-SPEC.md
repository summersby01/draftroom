# FRONTEND-SPEC

## 1. UI 목표

- 업무 관리 앱처럼 기능적이되, 너무 차갑지 않게
- 창작 작업실 기록장 느낌
- 빠른 스캔이 가능한 카드 중심 구조
- 모바일과 데스크톱 모두 사용 가능

## 2. 디자인 키워드

- 정돈됨
- 부드러운 카드 레이아웃
- 가벼운 포인트 컬러
- 상태가 한눈에 보이는 배지 중심 UI
- 텍스트 밀도는 낮고 정보 우선순위는 명확하게

## 3. 디자인 시스템 규칙

### 여백
- 카드 내부 padding 넉넉하게
- 리스트 간격 12~16px 이상
- 모바일에서 탭 가능한 높이 44px 이상

### 라운드
- 카드/버튼 radius 통일
- 너무 각지지 않게 설계

### 타이포
- 제목 / 부제 / 메타 / 상태 텍스트 구분 명확
- 목록에서는 2줄 이상 과도한 말줄임 지양
- D-day, 상태, 진행률은 수치 가독성 우선

## 4. 주요 컴포넌트

### Layout
- `AppShell`
- `TopBar`
- `Sidebar` 또는 mobile nav
- `PageHeader`

### Dashboard
- `SummaryCard`
- `DueSoonList`
- `RecentProjectList`
- `CompletedProjectList`

### Projects
- `ProjectCard`
- `ProjectTable` (선택)
- `ProjectFilters`
- `ProjectStatusBadge`
- `ProgressBar`
- `StageStatusPill`

### Forms
- `ProjectForm`
- `DateField`
- `SelectField`
- `TextareaField`
- `SubmitToggle`

### Archive
- `ArchiveFilters`
- `ArchiveGroupByYear`
- `ArchiveCard`

## 5. 페이지별 요구사항

## 5.1 Dashboard
보여야 할 것:
- 요약 카드 4개
- 마감 임박 작업
- 최근 수정 작업
- 최근 완료 작업

행동:
- 카드 클릭 시 필터된 목록 이동
- `새 작업` CTA 노출

## 5.2 Projects List
보여야 할 것:
- 검색
- 상태 필터
- 유형 필터
- 정렬
- 카드 또는 테이블 리스트

카드 최소 정보:
- 제목
- 아티스트
- 의뢰처
- 받은 날 / 마감일
- D-day
- 전체 상태
- 진행률

## 5.3 Project Detail
보여야 할 것:
- 기본 정보 섹션
- 단계 상태 섹션
- 메모 섹션
- 제출 섹션
- 수정 / 삭제 액션

필수 행동:
- 단계 상태 즉시 변경
- 제출 완료 토글
- 수정 저장

## 5.4 Archive
보여야 할 것:
- 연도별 그룹
- 검색/필터
- 제출일
- 작업 유형
- 아티스트

## 6. 인터랙션 가이드

### 상태 변경
- 드롭다운 또는 segmented control
- 변경 즉시 토스트
- 실패 시 롤백 또는 에러 표시

### 삭제
- 확인 모달 필수
- soft delete는 MVP 외
- 실제 삭제 전 경고

### 날짜
- date picker 사용
- 로케일 형식은 사용자 친화적으로 표시
- 저장은 ISO 또는 DB date 형식

## 7. 반응형 기준

### 모바일
- 카드 1열
- 필터는 drawer
- FAB 허용
- 메타 정보 2줄까지 허용

### 태블릿 이상
- 2열 카드 또는 테이블
- 대시보드 카드 2~4열

### 데스크톱
- 대시보드 카드 4열
- 사이드바 내비게이션 가능

## 8. 접근성

- 버튼/링크에 명확한 라벨
- 색상만으로 상태를 구분하지 않기
- 키보드 포커스 표시
- 대비 기준 확보
- form error 메시지 명확하게 제공

## 9. 상태 배지 문구 예시

### 전체 상태
- 예정
- 진행 중
- 제출 완료
- 보류

### 단계 상태
- 시작 전
- 진행 중
- 완료

## 10. 프론트엔드 유틸 함수 예시

- `calculateProgressPercent(project)`
- `deriveProjectStatus(project)`
- `getDdayLabel(dueAt)`
- `isOverdue(dueAt, submissionDone)`
- `formatProjectType(projectType)`

## 11. 빈 상태/에러 상태

### 목록 빈 상태
- “조건에 맞는 작업이 없습니다”

### 검색 빈 상태
- “검색 결과가 없습니다”

### 에러 상태
- 재시도 버튼
- 최소한의 문제 설명
