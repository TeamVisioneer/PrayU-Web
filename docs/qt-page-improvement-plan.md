# QT 페이지 개선 계획

작성: 2026-07 / 상태: **확정 — 구현 진행** (기본안 승인 + 오늘의 기도 진입 버튼 제거 추가)
선행: QT 일일 한도(Api #35 · web #457) 반영됨 — 생성은 로그인 필수, 일 10회

## 배경 — 현재 문제 (QuietTimePage.tsx 실측)

1. **헤더가 미완성** — 뒤로가기 아이콘 하나만 덜렁 있는 커스텀 div (`L295-300`). 타이틀 없음, sticky 아님, 다른 페이지(BibleCardNewPage 등)의 `sticky top-0 border-b bg-mainBg + 중앙 타이틀` 패턴과 불일치
2. **구절 선택이 일반적이지 않음** — 자유 텍스트 입력("창세기 1:1, 시편 23:1-6")을 `parseBibleVerse`로 파싱 (`L179`). 오타·형식 차이로 실패하기 쉽고, 성경앱들의 일반적인 UX(책→장→절 선택)와 동떨어짐
3. **비로그인 처리 버그성 동작** — `!qtData && user ? 입력폼 : 결과화면` (`L307`)이라 비로그인 시 빈 결과 화면이 렌더됨. 한도 도입으로 생성이 로그인 필수가 됐으니 명시적 안내 필요
4. 부수: 결과 화면의 "나만의 QT 만들기"가 `window.location.reload()`로 전체 리로드 (`L277-280`), 로딩이 `absolute inset-0` 오버레이로 어색함

## 목표

- 헤더를 앱 공통 패턴으로 통일
- 구절 선택을 **드롭다운 기반 픽커**(성경책 → 장 → 절 범위)로 교체 — 파싱 실패라는 개념 자체를 제거
- 비로그인 안내·상태 리셋 등 부수 문제 정리
- 기존 `?verse=` 쿼리 진입(데일리 QT 링크) 호환 유지

## 1. 성경 구조 데이터 — frontend const (사용자 제안 채택)

성경 66권·장수·장별 절수는 불변 데이터이므로 API 대신 **상수로 관리**한다. 단, 절수는 우리 `bible` 테이블(개역)과 정확히 일치해야 하므로 **손으로 쓰지 않고 DB에서 추출해 생성**한다:

- 신규 `src/data/bibleStructure.ts` (생성 산출물, 커밋):
  ```ts
  export interface BibleBook {
    book: number;            // bible.book 번호
    longLabel: string;       // "창세기"
    shortLabel: string;      // "창"
    testament: "구" | "신";
    verseCounts: number[];   // index = 장-1, 값 = 그 장의 절 수
  }
  export const BIBLE_BOOKS: BibleBook[] = [ /* 66권 */ ];
  ```
- 신규 `scripts/generate-bible-structure.mjs`: 로컬 스택 DB에서 `select book, long_label, short_label, testament, chapter, max(paragraph) group by ...` 집계 → 파일 생성. 일회성 실행 후 커밋 (bible 데이터가 바뀌는 일은 사실상 없음 — 바뀌면 재실행)
- 크기: 1,189개 장 절수 = 수 KB 수준, 번들 부담 없음
- 효과: 픽커가 **네트워크 없이 즉시** 책/장/절 범위를 제한해줌 → 존재하지 않는 구절 선택 자체가 불가능

## 2. UI 설계

### 2-1. 헤더 (공통 패턴)

```
[<]        QT 만들기        [  ]
```
- BibleCardNewPage의 `renderHeader` 패턴 그대로: `sticky top-0 z-50 border-b bg-mainBg p-4`, 중앙 타이틀, 좌측 뒤로가기(`navigate(-1)`)

### 2-2. 구절 픽커 (핵심)

```
┌─────────────────────────────────┐
│  성경책        [ 시편        ▾ ] │   ← Select, 구약/신약 그룹 구분
│  장           [ 23편        ▾ ] │   ← 선택된 책의 장수만큼
│  절           [ 1절 ▾ ~ 6절 ▾ ] │   ← 시작~끝, 끝은 시작 이후만
├─────────────────────────────────┤
│         시편 23:1-6             │   ← 선택 요약 (실시간)
│      [ QT 생성하기 ]            │
│     오늘 남은 생성 N회           │   ← 말씀카드와 동일 패턴 (선택 항목)
└─────────────────────────────────┘
```

- 컴포넌트: shadcn `Select` (`components/ui/select` — 존재 여부 확인 후 없으면 추가). 모바일에서 네이티브 시트처럼 동작
- 상호작용 규칙:
  - 책 변경 → 장/절 리셋 (1장 1절로), 장 변경 → 절 리셋
  - 끝 절 옵션은 시작 절 이후~장 끝까지만 노출 (범위 오류 원천 차단)
  - 절 범위 상한: **한 번에 최대 N절** (기본안 20절 — LLM 프롬프트 길이·품질 보호, **수치 확정 필요**)
- 기존 자유 텍스트 입력은 **제거** (픽커로 완전 대체 — 파싱 로직 `parseBibleVerse`는 `?verse=` 쿼리 처리용으로만 유지)

### 2-3. 상태·플로우 정리

- 비로그인: BibleCardNewPage 패턴의 "로그인이 필요해요" 안내 화면
- 로딩: 오버레이 대신 생성 버튼 내 스피너 + 픽커 비활성 (기존 isSubmitting 패턴)
- 결과 화면 "나만의 QT 만들기": `window.location.reload()` → **상태 리셋**(qtData null + 픽커 초기화)으로 교체
- `?verse=창세기 1:1` 진입: 기존 파싱·자동 생성 흐름 유지, 픽커에도 해당 값 반영
- 한도: `fetchTodayQtUsage()` (bible-card의 `fetchTodayBibleCardUsage`와 동일 패턴, `feature='qt'`) → 남은 횟수 표시 + 소진 시 버튼 비활성 (**포함 여부 확정 필요** — 서버 429는 이미 동작하므로 표시만의 문제)

## 2-4. 오늘의 기도 drawer QT 진입 버튼 제거 (2026-07 사용자 결정)

- `TodayPrayCompletedItem.tsx`의 "오늘의 QT 보기" 버튼 제거 (`onClickQtBtn` + `bibleVerses`/`newIcon` import 정리)
- ⚠️ 이 버튼이 **`?verse=` 데일리 QT의 유일한 앱 내 진입점**이었음 — 제거 후 `?verse=` 처리 로직은 외부 링크/북마크 호환용으로만 유지. QT 진입은 그룹 메뉴(`GroupMenuBtn`)만 남음. `Enums/qtData.ts`의 `bibleVerses`는 사용처 0이 되므로 함께 삭제
- 데일리 QT 개념 자체의 존폐는 별도 결정 사항으로 남김 (이번엔 진입 버튼만 제거)

## 3. 파일 목록 (구현 시)

| 파일 | 상태 | 역할 |
|---|---|---|
| `src/data/bibleStructure.ts` | 신규 (생성물) | 66권 책·장·절수 상수 |
| `scripts/generate-bible-structure.mjs` | 신규 | 로컬 DB → 상수 파일 추출 |
| `src/components/qt/BibleVersePicker.tsx` | 신규 | 책/장/절범위 Select 픽커 (재사용 가능 — 추후 말씀카드 등) |
| `src/pages/QuietTimePage.tsx` | 대폭 수정 | 헤더 통일, 픽커 적용, 비로그인·로딩·리셋 정리 |
| `src/apis/llmUsage.ts` | 신규 | `fetchTodayLlmUsage(feature)` — KST 당일 사용량 조회 공용화 (bible.ts의 기존 함수는 이를 위임) |
| `src/components/todayPray/TodayPrayCompletedItem.tsx` | 수정 | "오늘의 QT 보기" 버튼 제거 |
| `src/Enums/qtData.ts` | 삭제 | `bibleVerses` 사용처 소멸 |
| `src/components/ui/select.tsx` | 기존 사용 | shadcn Select (이미 존재 확인) |

- 전역 store 추가 없음 (픽커 상태는 페이지 지역 상태)
- Api 변경 없음 (한도·인증은 이미 반영됨)

## 4. 검증

- `npm run lint`(기존 경고 4개 외 0) + `npm run build`
- 수동: 픽커 책/장/절 연동 리셋 · 요약 표시 · 생성 성공 → 결과 화면 · "나만의 QT 만들기" 리셋(리로드 없음) · `?verse=` 진입 자동 생성 · 비로그인 안내 · 한도 소진 시 toast/비활성 · QT 신고 링크 회귀
- 기존 qt_data 캐시 조회(동일 구절 재요청 시 LLM 미호출) 회귀 확인

## 6. 픽커 v2 — 3열 동시 스크롤 (2026-07 추가, 성경앱 스타일)

v1(Select 3단, #461로 merge) 이후 참고 UI(갓피플류 목차검색) 기반 고도화. `BibleVersePicker`의
props 계약(value/onChange/maxRange/disabled)을 유지한 채 **내부만 교체** — QuietTimePage 무변경.

### 확정된 결정 (2026-07)
- 세부 분류 그룹(역사서/시가서 등): **미포함** (구약/신약 sticky 헤더만 유지)
- 영문 책명: **미포함**
- 초성 키보드 검색: **2차로 보류** (초성 인덱스 바로 대체)
- 절 범위: **두 탭 방식** — 첫 탭 = 시작(단일 절), 이후 더 큰 절 탭 = 끝 절 확장, 아무 절이나 다시 탭 = 새 시작. 범위 미확장 상태에서 `시작+maxRange` 초과 절은 비활성(흐림)으로 상한을 시각화

### 구성
```
┌──────────┬─┬──────┬──────┐
│ 책 (66)   │창│  장   │  절   │   ← 독립 스크롤 3열 (고정 높이)
│ 왕상 열왕기상│수│  4장  │  4절  │
│ ▣느헤미야  │욥│ ▣5장  │ ▣5절  │   ← 선택 하이라이트, 변경 시 하위 열 리셋
│ 에 에스더  │…│  6장  │  6절  │   ← 인덱스 바: 창수욥사호마행롬히 (스크롤 점프)
└──────────┴─┴──────┴──────┘
        느헤미야 5:5              ← 기존 요약·생성 버튼 그대로
```
- 책 행: 약칭(shortLabel, 색상 작은 글씨) + 전체 이름. 시편은 "편" 단위 유지
- 책/장 변경 시 하위 리셋 + 각 열 선택 항목 자동 스크롤
- 순수 CSS/React — 외부 라이브러리·데이터 추가 없음 (`bibleStructure.ts`로 충족)

## 5. 확정 사항 (2026-07 승인)

- [x] 절 범위 상한: **20절**
- [x] 남은 횟수 표시: **포함** (말씀카드와 UX 일관)
- [x] 픽커 형태: **Select 3개**
- [x] 오늘의 기도 drawer QT 진입 버튼: **제거** (2-4장)
- [ ] 데일리 QT(`?verse=`) 개념의 존폐 — 추후 별도 결정 (이번엔 외부 링크 호환만 유지)
