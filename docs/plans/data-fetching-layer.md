# 데이터 fetch 계층 — TanStack Query 도입 (Phase 0~1 파일럿)

> 상태: **Phase 0~1 승인·구현** (2026-08-18) — Phase 2(화면별 전환)는 릴리스 후 backlog 트랙
> 배경: 2026-08-17 프로필 페이지 fetch 계측(진입 1회에 14건, backlog 참조)에서 드러난 구조 문제.
> 방향 합의: 서버 상태는 쿼리 계층으로, Zustand 는 UI 상태로 — **파일럿(프로필 화면)까지만** 이번 범위.

## 진단 요약 (왜 하나)

현재 패턴은 "Zustand 단일 스토어 + 페이지 마운트 effect 의 명령형 fetch"다. 서버 상태와
클라이언트 상태를 같은 도구로 다루기 때문에:

- 데이터 신선도 개념이 없어 **마운트마다 무조건 재요청** (같은 데이터를 화면 오갈 때마다 다시 받음)
- 같은 데이터를 원하는 곳이 둘이면 **중복 요청을 막을 장치가 없음** (AuthProvider + 프로필의 `getProfile`)
- effect 의존성에 객체 정체성이 섞여 연쇄 재발화 (`profiles?id=in.()` 빈 쿼리 4회)
- 한 전역 상태를 여러 화면이 공유하며 로딩 판정이 얽힘 (`historyPrayCardList*` 5개 화면)

## 방향

```
apis/       IO 함수 — 지금 그대로 유지, queryFn 으로 재사용
queries/    useQuery/useMutation 훅 — 키·신선도·무효화 규칙이 모이는 곳 (신규)
components/ 필요한 데이터를 쓰는 자리에서 훅으로 선언 — 페이지가 오케스트레이션하지 않음
baseStore   UI 상태만 (드로워 열림·선택 상태). 서버 상태는 화면 전환이 끝나는 대로 제거
```

- 라이브러리: **@tanstack/react-query v5** (번들 +~13KB gzip). Next.js 이행 시에도 그대로 감
- **점진 전환** — 빅뱅 금지. 전환된 도메인은 store 접근 금지가 공존 기간의 유일한 규칙

## Phase 0 — fetch 규약 (guides 문서로 확정)

`docs/guides/data-fetching.md` 로 작성할 내용의 골자:

| 항목 | 규약 |
|---|---|
| 쿼리 키 | `[도메인, id, 파라미터]` 배열 — 예: `["profile", userId]` · `["prays", userId, "2026-08"]` |
| staleTime 기본 | **60초** (전역 기본). 달력 월 데이터처럼 잘 안 변하는 것은 5분 |
| 무효화 | 쓰기(mutation) 성공 시 관련 키 `invalidateQueries` — 컬럼이 아니라 도메인 단위 |
| 조건부 조회 | `enabled` 옵션으로 선언 (빈 배열·비로그인 등) — effect 분기 금지 |
| 신규 코드 규칙 | **원격 읽기를 useEffect 에서 시작하지 않는다** — queries/ 훅으로. effect 는 외부 시스템 동기화(히스토리·브리지·analytics)에만 |

## Phase 1 — 파일럿: 프로필 화면 전환

### 전환 경계 (중요 — 어디까지 바꾸나)

| 데이터 | 처리 | 근거 |
|---|---|---|
| `myProfile` | **전환 안 함** — store 소비 유지, 페이지의 중복 `getProfile` 호출만 제거 | AuthProvider 가 소유하고 전앱이 소비. auth 도메인 전환은 Phase 2 |
| 기도카드 수·받은 기도 수·그룹 목록 | `useQuery` 전환 | 프로필 스탯 전용 (member 는 GroupListPage 도 쓰지만 store 를 건드리지 않으므로 무해) |
| 보관함 목록(18개+더보기) | `useInfiniteQuery` 전환 — 프로필의 `historyPrayCardListView` 의존 제거 | 페이지네이션 상태가 쿼리에 내장. **store 의 `historyPrayCardList*` 는 그대로 둠** — 작성 플로우 3곳·말씀카드 페이지의 소유로 남긴다 (소유권 일원화 backlog 항목이 자연 해소) |
| 달력 월 데이터(남긴/받은) | `useQuery` 월 키 전환 | 월 키가 곧 캐시 — 탭 전환·월 재방문 재요청 소멸 |
| 차단 목록 프로필 | SettingDialog 안에서 **lazy** `useQuery` (`enabled: 열림 && ids.length > 0`) | 다이얼로그 전용 데이터의 선제 fetch·빈 쿼리 제거 |
| 히스토리 드로워 선택 카드(`historyCard`) 등 | store 유지 | UI 상태 |

### 파일 매니페스트

| 파일 | 변경 |
|---|---|
| `docs/plans/data-fetching-layer.md` (신규) | 이 문서 |
| `docs/guides/data-fetching.md` (신규) | Phase 0 규약 (위 표를 확정판으로) |
| `package.json` | `@tanstack/react-query` 추가 (devtools 는 넣지 않음 — 필요 시 별도 결정) |
| `src/main.tsx` | `QueryClientProvider` 마운트 — 전역 기본값 `staleTime: 60_000, retry: 1, refetchOnWindowFocus: false`(WebView 특성) |
| `src/queries/profile.ts` (신규) | `useMyPrayCardCount(userId)` · `useReceivedPrayCount(userId)` · `useMyMemberList(userId)` · `useBlockedProfiles(ids, enabled)` — queryFn 은 기존 `apis/*` 함수 재사용 |
| `src/queries/prayCalendar.ts` (신규) | `useMonthlyPrays(userId, ym)` · `useMonthlyReceivedPrays(userId, ym)` — staleTime 5분 |
| `src/queries/myPrayCards.ts` (신규) | `useMyPrayCardsInfinite(userId, pageSize=18)` — `fetchUserPrayCardList` 재사용, `getNextPageParam` 은 카운트 기반 |
| `src/pages/MyProfilePage.tsx` (수정) | fetch 오케스트레이션 effect **전부 제거**, 스탯 3종을 쿼리 훅으로, `getProfile`/`fetchProfileList`/`setHistoryPrayCardListView` 호출 제거. myProfile 은 store 그대로 소비 |
| `src/components/profile/PrayCardHistoryList.tsx` (수정) | `useInfiniteQuery` 로 전환 — 로컬 `offset`·store `historyPrayCardList*` 의존 제거, 더보기 = `fetchNextPage` |
| `src/components/profile/PrayCalendar.tsx` (수정) | 로컬 fetch effect + Promise.all → 쿼리 훅 2개. 월 상태·선택 상태는 로컬 유지 |
| `src/components/profile/SettingDialog.tsx` (수정) | 차단 목록을 lazy 쿼리로 (`profileList` store 의존 제거), 차단 해제 시 해당 키 invalidate |
| `CLAUDE.md` (수정) | "원격 읽기는 queries/ 훅으로 — effect-fetch 금지(신규 코드)" 한 줄 + 가이드 링크 |
| `docs/backlog.md` (수정) | fetch 중복 항목 완료 처리 + Phase 2(화면별 전환, auth 도메인) 후속 등재 |

### 명시적으로 하지 않는 것

- AuthProvider·`myProfile` 의 쿼리 전환 (Phase 2 — auth 도메인 통째로)
- 다른 화면(그룹·QT·알림 등) 전환, baseStore 서버 상태 제거
- mutation 전환 — 프로필 화면의 쓰기(이름 변경·탈퇴)는 기존 경로 유지, 차단 해제만 invalidate 연결
- react-query devtools 도입

## 검증

- **계측 재실행** (동일 방법: Performance API): 진입 1회 요청 수 — 현재 14건(dev) →
  기대: 고유 쿼리 5건 이하 + StrictMode 이중 발화도 쿼리 dedup 으로 1건씩만
- 회귀: 스탯 3종 값 불변(3·14·2) · 보관함 목록/더보기 · 히스토리 드로워 · 달력(월 이동·일자 상세·탭 전환 시 재요청 없음 확인) · 설정 다이얼로그 차단 목록
- 빈 상태 계정(dev4)에서 `enabled` 가드 동작 (빈 in() 쿼리 0건)
- `npm run lint` + `npm run build`

## 결정 대기

- [ ] 파일 매니페스트 승인 (구현 착수 게이트)
- [ ] **v1.0.0 릴리스와의 순서** — merge 하면 main=staging 에 실려 v1.0.0 에 포함된다.
  프로필 화면 한정이라 면적은 작지만, 릴리스에서 빼려면 릴리스 태그 이후로 merge 를 미뤄야 한다
- [ ] staleTime 기본 60초 / 달력 5분 승인
