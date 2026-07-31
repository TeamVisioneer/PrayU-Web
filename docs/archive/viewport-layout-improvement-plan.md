# 뷰포트·레이아웃 정비 계획 (Safari 하단 바 이슈 / --vh / 480px 컬럼)

## 1. 배경 — 보고된 증상

- **iOS Safari에서 아래로 스크롤해도 하단 주소창(툴바)이 최소화되지 않음**
- **하단 툴바 뒤 영역이 렌더링되지 않은 것처럼 보임** (흰 띠 / 배경 공백)
- 브라우저(클라이언트)별로 화면 높이 처리가 일관되지 않음
- 과거에 지식 없이 넣은 `--vh` JS 보정과 `max-w-[480px]` 고정이 지금 기준으로 적절한지 불확실

## 2. 현재 구조 진단

### 2-1. 화면 높이가 결정되는 경로

| 위치 | 코드 | 의미 |
|---|---|---|
| `src/App.css:133-141` | `html, body { overflow: hidden; height: 100% }` | **문서(루트) 스크롤을 완전히 차단** |
| `src/App.tsx:88` | 최외곽 `<div className="w-screen h-screen bg-white">` | 높이 = **100vh** (Safari에선 툴바가 **펼쳐지지 않은** 상태 기준의 "큰 뷰포트" 높이) |
| `src/App.tsx:72` | AppLayout `h-100vh overflow-x-hidden no-scrollbar` | 높이 = `calc(var(--vh) * 100)` = **JS가 측정한 innerHeight**. overflow-x-hidden 지정으로 이 div가 **실질 스크롤 컨테이너**가 됨 |
| `src/AppInit/AppInit.tsx:30-37` | `--vh = window.innerHeight * 0.01`, `resize` 시 재계산 | 2019년경 유행한 "100vh 버그" 우회용 JS 핵 |
| `tailwind.config.js:132-…` | `h-5vh`~`h-100vh`, `max-h-*`, `min-h-*` 전부 `calc(var(--vh) * N)` | `--vh` 의존 유틸이 테마 전반에 깔려 있음 (실사용 파일 8개) |
| `index.html:6-8` | `maximum-scale=1.0, user-scalable=no`, `viewport-fit` 없음 | 확대 차단 + safe-area 미노출 |

### 2-2. 증상별 원인

**증상 A — "스크롤해도 Safari 하단 바가 안 줄어든다" → 구조적 필연.**
iOS Safari는 **문서(루트 스크롤러)가 스크롤될 때만** 툴바를 최소화한다. 지금은 `html, body`가 `overflow: hidden`이고 스크롤이 전부 내부 div에서 일어나므로, 어떤 페이지에서도 툴바는 절대 줄어들지 않는다. 버그가 아니라 "앱 셸(고정 높이 + 내부 스크롤)" 구조를 선택한 데 따른 정해진 결과다.

**증상 B — "툴바 뒤 렌더링 공백" → 두 높이 체계의 불일치.**
- 바깥 div는 `h-screen`(=100vh, Safari에선 툴바 최소화 상태 기준의 **큰** 높이)
- 안쪽 셸은 `h-100vh`(=`--vh`, 페이지 로드 시점 `innerHeight` = 툴바 펼쳐진 **작은** 높이)

즉 안쪽 콘텐츠는 innerHeight까지만 그려지고, 그 아래(툴바 뒤~큰 뷰포트 사이 구간)는 바깥 div의 `bg-white`만 노출된다. 게다가 iOS Safari의 `resize` 이벤트는 툴바 상태 변화·회전 시 발화 타이밍이 브라우저마다 제각각이라(iOS Safari / iOS Chrome / Android Chrome 모두 다름), `--vh`가 실제 가시 영역과 어긋난 채로 남는 순간이 생긴다. "클라이언트마다 일관성이 깨진다"는 체감의 정체가 이것이다.

**부가 문제**
- `viewport-fit=cover`가 없어 `env(safe-area-inset-*)`가 항상 0 → 홈 인디케이터 영역 대응 불가. 하단 고정 요소들(MainPage CTA `fixed bottom-0`, bottom-toast, GroupPage/StoryPage 플로팅 버튼 등)이 홈 인디케이터·툴바와 겹칠 여지.
- 키보드가 올라올 때 `innerHeight` 변화가 `--vh`에 반영되는 브라우저(Android)와 아닌 브라우저(iOS)가 갈려 입력 화면 레이아웃이 플랫폼별로 다르게 밀림.
- `user-scalable=no`는 iOS Safari가 10부터 무시(핀치 줌 여전히 됨)하고 Android만 충실히 막는다 → 실효는 없고 저시력 사용자 접근성만 해침.

### 2-3. 결론: `--vh` JS 핵은 수명이 끝났다

`--vh` JS 보정은 **동적 뷰포트 단위(`dvh`/`svh`/`lvh`)가 없던 시절의 표준 우회법**이었다. 지금은 CSS가 이 문제를 네이티브로 해결한다:

| 단위 | 의미 | 지원 |
|---|---|---|
| `svh` | small viewport height — 툴바가 **펼쳐진** 상태 기준 (최소 가시 높이) | iOS 15.4+, Chrome 108+ (2022) |
| `lvh` | large viewport height — 툴바가 **접힌** 상태 기준 (기존 `vh`와 동일) | 〃 |
| `dvh` | dynamic — 툴바 상태를 따라 **실시간 변동** | 〃 |

2026년 기준 국내 트래픽에서 미지원 브라우저는 사실상 없다(iOS 15.4 미만 잔존율 ~0%대). Tailwind 3.4(현재 3.4.6 사용 중)도 `h-dvh`/`h-svh`/`h-lvh`를 기본 제공한다. **JS로 innerHeight를 측정해 CSS 변수에 넣는 방식 자체를 제거하는 것이 현대 표준이다.**

## 3. 방향 결정 — 두 가지 선택지

### 안 1 (권장): 앱 셸 유지 + `dvh` 기반으로 정리

"고정 높이 셸 + 내부 스크롤" 구조는 그대로 두되, 높이의 근거를 JS 측정값에서 CSS `dvh`로 교체한다.

- 증상 B(렌더링 공백)와 클라이언트별 비일관성은 **완전히 해소**된다 — 브라우저가 매 프레임 정확한 가시 높이를 직접 제공하므로 stale 값이 존재할 수 없다.
- 증상 A(툴바 최소화 안 됨)는 **해소되지 않는다** — 대신 툴바가 항상 펼쳐진 채 그 위까지만 정확하게 그려진다. 이는 X(트위터) 웹, 인스타그램 웹 등 앱형 웹서비스가 동일하게 취하는 형태다.
- 변경 범위가 작고(전역 4~5개 파일), 40+ 라우트의 내부 스크롤 가정을 건드리지 않는다.
- 본 서비스의 주 소비 경로가 **Flutter WebView(툴바 자체가 없음)** 라는 점에서, Safari 툴바 최소화는 브라우저 유입(공유 링크 등)에만 해당하는 부차 문제다.

### 안 2: 문서 스크롤 복원 (툴바가 자연스럽게 최소화됨)

`html, body`의 `overflow: hidden`을 풀고 루트 스크롤러가 스크롤하게 만들면 Safari 툴바가 일반 웹처럼 접힌다. 그러나:

- 페이지마다 "내부 스크롤 컨테이너" 가정으로 짜인 레이아웃(고정 헤더, 하단 고정 CTA, drawer, 무한스크롤 리스트)을 **라우트별로 전수 재검증**해야 한다 (40+ 라우트).
- 루트 스크롤 시 iOS 고무줄 오버스크롤, `fixed` 요소의 툴바 전환 시 점프 등 새 문제군이 유입된다.
- CLAUDE.md 가드레일("기존 사용자 흐름을 깨지 않는가") 대비 리스크가 크다.

**권고: 안 1로 진행.** 툴바 최소화가 꼭 필요해지면(예: 브라우저 열람 비중이 높은 공유 랜딩 페이지) 해당 라우트만 별도 스크롤 모드로 다루는 후속 작업으로 분리한다.

## 4. 구현 계획 (안 1 기준) — 파일 매니페스트

### 수정 1. `src/App.css`

- `:root`에 `--vh` CSS 정의 추가:
  ```css
  :root { --vh: 1vh; }               /* dvh 미지원 구형 브라우저 폴백 */
  @supports (height: 1dvh) {
    :root { --vh: 1dvh; }            /* 지원 브라우저: 브라우저 네이티브 동적 단위 */
  }
  ```
  → `tailwind.config.js`의 `calc(var(--vh) * N)` 유틸 전체(8개 파일에서 사용)가 **한 줄 교체로 일제히 dvh 기반**이 된다. 기존 클래스명 변경 불필요.
- `body`에 `touch-action: manipulation` 추가 — `user-scalable=no` 제거(수정 3)에 따른 더블탭 줌 방지 대체.
- `html, body { overflow: hidden }`은 유지 (안 1 = 앱 셸 유지).

### 수정 2. `src/AppInit/AppInit.tsx`

- `setVh()` 함수·`resize` 리스너 **삭제**. 단, dvh 미지원 환경만을 위한 조건부 폴백으로 축소:
  ```ts
  if (!CSS.supports("height", "1dvh")) { /* 기존 setVh + resize 리스너 */ }
  ```
  지원 브라우저(사실상 전부)에서는 JS 측정이 완전히 사라진다. 푸시 리스너 등 나머지 로직은 그대로.

### 수정 3. `index.html`

- viewport meta 교체:
  ```html
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
  ```
  - `viewport-fit=cover` 추가 → `env(safe-area-inset-*)` 활성화 (수정 5의 전제)
  - `maximum-scale=1.0, user-scalable=no` 제거 → 접근성 회복 (더블탭 줌은 수정 1의 `touch-action`으로 방지)
  - ※ CLAUDE.md상 `index.html`은 목적 외 수정 금지 항목 — 이 문서가 그 목적 명시에 해당. viewport-fit은 Flutter WebView 렌더링에도 영향 가능성이 있어 **검증 항목에 WebView 확인 포함** (아래 6절).

### 수정 4. `src/App.tsx`

- 최외곽 div `h-screen` → `h-dvh` (Tailwind 3.4 내장 유틸): 바깥/안쪽 높이 체계 불일치(증상 B의 직접 원인) 제거. `w-screen`은 유지.
- AppLayout의 `h-100vh`는 수정 1 덕에 그대로 dvh 기반이 되므로 변경 없음.

### 수정 5. `tailwind.config.js`

- safe-area spacing 유틸 추가:
  ```js
  spacing: { "safe-bottom": "env(safe-area-inset-bottom)", "safe-top": "env(safe-area-inset-top)" }
  ```
  → `pb-safe-bottom`, `pb-[calc(...)]` 형태로 하단 고정 요소에서 사용.

### 수정 6. 하단 고정 요소에 safe-area 반영 (개별 확인 후 최소 적용)

`viewport-fit=cover` 적용 시 홈 인디케이터 영역까지 화면이 확장되므로, 다음 하단 고정 요소에 `pb-safe-bottom`(또는 calc 합성)을 검토·적용:

| 파일 | 요소 |
|---|---|
| `src/pages/MainPage.tsx:156` | 하단 고정 CTA (`fixed bottom-0`) — **필수** |
| `src/components/ui/bottom-toast.tsx:17` | 하단 토스트 (`fixed bottom-4`) |
| `src/pages/GroupPage.tsx:101`, `src/pages/TutorialPage.tsx:329`, `src/pages/StoryPage/StoryPage.tsx:333` | 하단 플로팅 버튼 (`bottom-10`이라 여유 있음 — 확인만) |
| `src/components/group/GroupListDrawer.tsx:112`, `src/components/thanksCard/ThanksCardQRCode.tsx` | 우하단 플로팅 (동일) |

이미 `bottom-4` 이상 띄워진 요소는 시각 확인 후 변경하지 않는 것을 기본값으로 한다 (변경 최소화).

### 변경하지 않는 것

- `tailwind.config.js`의 `h-*vh` 유틸 명세와 사용처 8개 파일 — 클래스명 그대로, 의미만 dvh로 상향
- 각 페이지의 내부 스크롤 구조, drawer/sheet 구성
- `html, body`의 `overflow: hidden` (앱 셸 유지 결정)

## 5. `max-w-[480px]` 컬럼에 대한 평가

**결론: 방법 자체는 표준적이고 적절하다. 유지 권장.**

- 모바일 중심 서비스가 데스크톱에서 "중앙 고정 폭 컬럼 + 좌우 여백"으로 대응하는 것은 국내외 통용 패턴이다(토스·당근 계열 웹뷰 서비스 대부분 480~640px 컬럼). 반응형 데스크톱 레이아웃을 따로 만들 계획이 없는 한 이 방식이 유지비 대비 최선.
- 다만 현재 **`max-w-[480px]`가 12개 파일에 하드코딩**되어 있고(App.tsx 셸 + drawer/dialog/sheet 등 오버레이 컴포넌트 + 페이지별 fixed 요소), 셸 폭을 바꾸려면 12곳을 동시 수정해야 하는 결합이 있다. 이는 별도 정리 후보:
  - `tailwind.config.js`에 `maxWidth: { app: "480px" }` 토큰 추가 → `max-w-app`으로 일괄 치환 (기계적 치환, 시각 변화 0)
  - 이번 PR에 포함할지, 별도 chore PR로 뺄지는 아래 결정 사항 ②.
- 폭 값 480px 자체는 조정 근거 없음 — 유지.

## 6. 검증 계획

`npm run lint` + `npm run build` 통과(기존 경고 3개 외 신규 0) 후, 실기기·시뮬레이터 확인:

| 환경 | 확인 항목 |
|---|---|
| **iOS Safari (실기기)** | ① 하단 툴바 뒤 흰 띠 소멸 — 콘텐츠가 툴바 상단까지 정확히 채워짐 ② 회전(가로↔세로) 시 공백/점프 없음 ③ 키보드 열림/닫힘 시 입력 화면 안정 ④ 툴바는 계속 표시됨(안 1의 의도된 결과임을 확인) |
| **iOS Chrome** | 상동 (iOS Chrome도 WebKit이라 동일 계열이지만 툴바 UI가 달라 별도 확인) |
| **Android Chrome** | 주소창 접힘 상태 변화 시 하단 공백 없음, 키보드 시나리오 |
| **Flutter WebView (앱)** | `viewport-fit=cover` 영향 확인 — 로그인·그룹·기도카드·공유 핵심 플로우 회귀 없음, 상하단 잘림 없음 |
| **데스크톱** | 480px 컬럼 중앙 정렬, 좌우 배경 유지 |
| **하단 고정 요소** | MainPage CTA·토스트·플로팅 버튼이 홈 인디케이터/툴바와 겹치지 않음 |

폴백 경로(`CSS.supports` false 분기)는 데스크톱 브라우저 devtools에서 강제로 태워 동작만 확인.

## 7. 결정 필요 사항

1. **안 1(앱 셸 유지 + dvh, 권장) vs 안 2(문서 스크롤 복원)** — 안 2를 원하면 별도 설계 문서부터 다시 작성
2. `max-w-[480px]` → `max-w-app` 토큰화 12곳 치환을 **이번 PR에 포함할지 / 별도 chore PR로 분리할지** (권장: 별도 PR — 이번 PR은 높이 문제에 집중)
3. `user-scalable=no` 제거(접근성 회복) 동의 여부 — 유지 원하면 수정 3에서 해당 부분만 제외

## 8. 작업 단위

- PR 1 (이 문서 범위): 수정 1~6 — "뷰포트 높이 dvh 전환 + safe-area 대응"
- PR 2 (선택, chore): `max-w-app` 토큰화 치환
- 후속 백로그(필요 시): 공유 랜딩 등 브라우저 열람 페이지의 문서 스크롤 모드 검토

---

## 철회 (2026-07-29) — 확대 잠금은 되돌린다

`maximum-scale=1.0, user-scalable=no` 제거는 **철회했다.** `viewport-fit=cover` 는 그대로 둔다.

**이유**: 입력창에 포커스가 잡힐 때마다 화면이 의도치 않게 확대된다. iOS 는 **글자 크기가 16px 미만인 입력창**에
포커스가 가면 자동으로 확대하는데, 확대 잠금이 있을 때는 그 동작이 억제되고 있었다.

계획 당시 "`user-scalable=no` 는 iOS 가 무시하므로 실효가 없다"고 적었는데, **핀치 줌에 대해서만 맞는 말이었다.**
입력창 자동 확대는 여전히 이 속성의 영향을 받는다. 실제 사용에서 드러난 부분이다.

**접근성을 되찾으려면** 확대 잠금을 다시 빼는 대신 **입력창 글자 크기를 16px 이상으로** 올리면 된다
(`src/components/ui/input.tsx` 의 `text-sm`(14px) → `text-base`, textarea 도 함께).
그때는 자동 확대가 일어나지 않으므로 핀치 줌을 열어둘 수 있다. 지금은 되돌리는 쪽을 택했다.
