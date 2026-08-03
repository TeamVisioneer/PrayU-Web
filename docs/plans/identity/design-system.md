# 디자인 시스템 — 글래스모피즘 톤앤매너 (v1.0.0 기반 공사)

상위: [overview.md](overview.md) · 상태: **계획 승인 대기** (적용 범위 컷라인 결정 필요)

## 현재 실태 (2026-08-03 실측)

| 항목 | 상태 |
|---|---|
| 기반 | shadcn/ui primitives 28개 + Tailwind. CSS 변수 테마(`--primary` 등) 부분 배선 |
| 색 | **두 겹이 공존** — shadcn semantic 변수 위에 커스텀 hex 팔레트(`mainBg`·`mainBtn`…) + **페이지 곳곳의 리터럴**(`text-[#222222]` 12곳 등) |
| 버튼 | 커스텀 variant 6종(primary 34·secondary 15·outline 15·ghost 9·separated 3·combined 1) — shadcn 표준에서 이탈 |
| 그림자·배경 | 이미 파스텔 블루·퍼플(`#F2F3FD`, 보라빛 그림자) — **글래스모피즘과 인접한 톤. 전면 교체가 아니라 진화다** |
| 문제 요약 | 색이 토큰 밖으로 샜고, 컴포넌트 역할 경계가 없고, `ui/` 가 순수하지 않을 수 있다(전수 확인 필요) |

## 1. 글래스 표면 언어 — 3단계

| 표면 | 정의 | 쓰는 곳 |
|---|---|---|
| `glass-chrome` | 반투명 + **backdrop-blur** + 미세 보더 | **고정 크롬만**: 하단 네비·헤더·모달/시트 |
| `glass-card` | 반투명 그라디언트 + 보더 + 소프트 그림자, **blur 없음** | 카드·리스트 아이템·통계 타일 |
| `base` | 은은한 라벤더-블루 그라디언트 배경 | 페이지 배경 |

⚠️ **성능 규칙: 스크롤 리스트 아이템에 `backdrop-blur` 금지.** Android WebView 에서 blur 는 비싸다 —
저가형 기기에서 프레임드랍이 난다. 카드류는 blur 없는 유사 글래스(`glass-card`)로 같은 인상을 낸다.
실기기(저가 Android) 성능 확인이 인수 조건이다.

⚠️ **접근성: 반투명 표면 위 텍스트는 대비 AA 를 지킨다.** 글래스는 대비를 깎아 먹는 스타일이다 —
본문 텍스트는 불투명도 높은 표면에만.

## 2. 토큰 계층

- **semantic CSS 변수가 유일한 진실**: `--surface-*`(3단계) · `--text-{strong,base,soft,disabled}` ·
  `--accent-{primary,…}` · radius · blur · 그림자. Tailwind `extend` 는 변수 매핑만
- 기존 커스텀 팔레트(`mainBg`·`liteBlack`·hex 리터럴)는 semantic 토큰으로 **흡수 후 제거**
- **금지: 컴포넌트·페이지의 hex 리터럴** (`bg-[#...]`) — CI 에 grep 한 줄로 강제한다
- 다크모드는 이번 범위 밖 (토큰 구조는 다크 확장이 가능하게만)

## 3. 컴포넌트 계층 — 역할과 책임 (Next.js 이행 대비의 핵심)

```
src/components/ui/        primitives — 프레임워크 무지 (순수성 규칙 ↓)
src/components/<domain>/  도메인 조립 — store·api 사용 허용
src/pages/                라우팅 + 조립
```

**`ui/` 순수성 규칙** — 여기서 지키는 것이 곧 Next.js 마이그레이션 준비다:

- `ui/` 는 **router(`useNavigate`·`Link`)·baseStore·apis·`import.meta.env` 접근 금지.** props 만 받는다
- 스타일은 Tailwind(빌드타임 CSS)만 — **런타임 CSS-in-JS 도입 금지** (RSC 비호환)
- variant 는 CVA 로 표현, 커스텀 variant(separated·combined)는 정리 대상인지 검토
- 위반 전수 확인을 1단계 작업에 포함 (현재 `ui/` 가 순수한지 미확인)

## 4. 적용 전략 — 한 번에 전면 재스킨하지 않는다

| 단계 | 내용 | 효과 |
|---|---|---|
| **1** | 토큰 체계 + 배경 그라디언트 + **Button·Card·Input·Dialog/Sheet 글래스화** | primitives 만 바꿔도 전역 톤이 잡힌다 |
| **2** | **하단 네비 = 첫 `glass-chrome`** ([navigation.md](navigation.md)와 한 작업) | 신규 컴포넌트라 회귀 위험 0 |
| **3** | 코어 여정 재스킨: 홈 → 그룹 → 기도카드 (화면별 PR, hex 리터럴 제거 동반) | 사용자 체감 |
| **4** | 나머지 화면 (release 후 v1.0.x 순차) | 어드민·Office 는 내부 도구라 제외 |

**v1.0.0 컷라인 제안: 1 + 2 필수, 3 은 그룹 화면까지, 4 는 릴리스 후.**
1년치 릴리스에 전면 재스킨까지 얹으면 QA 면적이 폭발한다 — main=staging 이라 릴리스 후에도
화면별로 이어서 내보낼 수 있다.

## 5. 검증

- 실기기 성능 (저가 Android WebView — blur 프레임드랍) · 대비 AA 스팟체크 · 기존 QA 시나리오 회귀
- `ui/` 순수성: import 검사 (router/store/api/env 의존 0건)
- hex 리터럴 grep = 0 (3단계 완료 화면부터)

## 결정 대기

- [ ] **v1.0.0 컷라인** — 제안(1+2+그룹까지) 승인 여부
- [ ] 커스텀 Button variant(separated·combined) 통폐합 여부
- [ ] 폰트 유지 여부 (현재 체계 그대로 갈지)
