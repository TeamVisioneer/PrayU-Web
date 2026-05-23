# 기도카드 뒷면 말씀카드 생성 플로우 구현 계획

## 배경

PrayU의 핵심 피처는 `pray_card` 기반의 기도카드이다. 앞으로 말씀카드는 독립된 이미지 생성 기능이 아니라, 사용자가 가진 기도카드의 뒷면에 연결되는 보조 피처로 설계한다.

사용자는 자신의 기도카드 목록에서 하나를 선택하고, 그 기도카드의 일상 나눔과 기도제목을 바탕으로 말씀카드를 생성한다. 생성된 말씀카드는 해당 기도카드 뒷면에 붙어 있다는 것을 플립 UI와 완료 화면을 통해 인지할 수 있어야 한다.

## 목표

- 기존 `/bible-card`의 독립 입력형 말씀카드 생성 플로우는 유지한다.
- `/bible-card/new`에 “내 기도카드 선택 → 말씀카드 생성 → 기도카드 뒷면에 저장” 흐름을 추가한다.
- `bible_card` 테이블은 이미지 URL만 저장하는 용도가 아니라 말씀카드 원본 데이터를 저장하는 테이블로 사용한다.
- 기도카드 생성 완료 후 `말씀카드 만들기`를 누르면 `/bible-card/new`로 이동하고, 방금 생성한 기도카드를 우선 선택할 수 있게 한다.

## 데이터 모델 방향

### 관계

- `pray_card` 1개당 `bible_card`는 최대 1개만 생성한다.
- `pray_card`에 `bible_card_id` nullable FK를 추가한다.
- `pray_card.bible_card_id`는 `bible_card.id`를 참조한다.
- 기도카드가 제품의 중심 엔티티이므로 “기도카드가 뒷면 말씀카드를 가진다”는 방향으로 모델링한다.
- `pray_card` 목록 조회 시 해당 카드가 말씀카드를 가지고 있는지 알 수 있도록 `bible_card_id` 관계를 함께 조회한다.
- `bible_card_id`에는 unique 제약을 걸지 않는다.
  - 현재 v1 UI/서비스 로직에서는 기도카드 1개당 대표 말씀카드 1개만 연결한다.
  - DB 차원에서 1:1을 강제하지 않고, 중복 생성/교체 정책은 API와 화면 로직에서 제어한다.
  - 향후 하나의 기도카드에 여러 말씀카드 후보나 히스토리를 붙이는 기획이 생겨도 DB 제약 변경 부담을 줄인다.
- 기존 `pray_card.bible_card_url`은 신규 플로우에서 쓰지 않고, 과거 데이터 표시 호환용으로만 남긴다.

### bible_card 저장 데이터

현재 `bible_card` 타입에 있는 필드는 계속 사용한다.

- `user_id`
- `name`
- `keywords`
- `bible_reference`
- `bible_sentence`
- `colors`
- `radius`
- `image_url`

### DB 반영 상태

- Supabase GUI에서 `pray_card` 테이블에 컬럼을 추가했다.
  - 컬럼: `bible_card_id`
  - 타입: `uuid`
  - nullable: true
  - FK: `pray_card.bible_card_id` → `bible_card.id`
  - unique: false
- 다음 구현 시작 전 타입 재생성이 필요하다.
  - `npm run supabase-sync`
- 추후 배포 전에는 동일 변경을 migration으로 남기는 것을 권장한다.

## 사용자 플로우

### 1. 기도카드 생성 완료 후 진입

1. 사용자가 기도카드 생성 플로우를 완료한다.
2. 완료 화면에서 `말씀카드 만들기`를 누른다.
3. `/bible-card/new?praycard_id=<createdPrayCardId>`로 이동한다.
4. `/bible-card/new`에서는 전달된 기도카드를 기본 선택 상태로 보여준다.

여러 그룹에 동시에 기도카드가 생성된 경우에는 첫 번째 생성 카드를 기본 선택한다. 사용자는 `/bible-card/new` 안에서 다른 내 기도카드로 바꿀 수 있다.

### 2. 프로필/히스토리에서 진입

1. 사용자가 `/profile/me` 또는 내 기도카드 목록에서 말씀카드를 만들고 싶은 기도카드를 선택한다.
2. 해당 기도카드 상세 또는 액션 영역에서 `말씀카드 만들기`를 누른다.
3. `/bible-card/new?praycard_id=<selectedPrayCardId>`로 이동한다.

### 3. 말씀카드 생성

1. 선택된 기도카드의 `life`와 `content`를 기반으로 말씀을 추천한다.
2. 추천된 말씀, 키워드, 색상, radius를 미리보기로 보여준다.
3. 사용자가 `기도카드 뒷면에 저장`을 누른다.
4. `bible_card` row를 생성한다.
5. 생성된 `bible_card.id`를 `pray_card.bible_card_id`에 저장한다.
6. 저장 성공 후 기도카드 앞면/말씀카드 뒷면 플립 프리뷰를 보여준다.

## 화면 구성 방향

### /bible-card/new

기존 `/bible-card` 독립 입력형 UI는 유지하고, 새 페이지를 아래 구조로 만든다.

- 상단: 선택된 기도카드 요약
- 중간: 말씀카드 생성 상태
  - 생성 전: 선택된 기도카드 기준으로 만들기 CTA
  - 생성 중: 로딩 상태
  - 생성 후: 말씀카드 미리보기
- 버튼: `기도카드 선택하기`
- Drawer: 내 기도카드 3열 grid
  - 이미 말씀카드가 있는 카드는 `말씀` 상태를 표시한다.

### 완료/조회 상태

- 말씀카드 저장 완료 후에는 카드 플립 UI를 보여준다.
- 앞면은 기존 기도카드, 뒷면은 생성된 말씀카드이다.
- 사용자가 “이 말씀이 이 기도카드 뒷면에 붙었다”는 점을 명확히 알 수 있어야 한다.
- profile 페이지의 기도카드 목록에서는 `bible_card` 관계가 있으면 말씀카드 썸네일 또는 뒷면 상태를 우선 보여준다.
- `bible_card` 관계가 없고 legacy `bible_card_url`만 있으면 기존 이미지 URL 표시 방식을 fallback으로 유지한다.

## API/상태 관리 방향

### API 계층

기존 가드레일에 따라 Supabase 접근은 `src/apis/*`에 둔다.

- `src/apis/bibleCard.ts`
  - `createBibleCard`는 말씀카드 row를 생성하고 생성된 `id`를 반환한다.
  - `getBibleCard(id)`는 기존 API를 유지한다.
- `src/apis/prayCard.ts`
  - 말씀카드 생성 성공 후 `updatePrayCard(prayCardId, { bible_card_id: bibleCard.id })`로 연결한다.
  - `pray_card.bible_card_id`가 이미 있으면 기본 동작은 새로 생성하지 않고 기존 말씀카드를 보여준다.
  - 재생성/교체가 필요해지는 경우에는 별도 CTA와 확인 UX를 추가한 뒤 `bible_card` 생성 후 `pray_card.bible_card_id`를 새 id로 업데이트한다.
  - 프로필/히스토리/그룹에서 쓰는 기도카드 조회 select에 `bible_card_id` 관계를 포함한다.
  - 실제 select 방향: `*, profiles(...), pray(...), group(name), bible_card:bible_card!pray_card_bible_card_id_fkey(*)`
  - 프론트에서는 `prayCard.bible_card` 객체 존재 여부로 말씀카드 유무를 판단한다.
  - 기존 `bible_card_url` 기반 UI와 충돌하지 않도록 타입을 정리한다.

### 타입

- `PrayCardWithProfiles`에 `bible_card_id: string | null`과 `bible_card?: BibleCard | null` 관계 필드를 추가한다.
- profile 페이지와 히스토리 drawer는 `prayCard.bible_card` 존재 여부로 말씀카드 유무를 판단한다.
- 기존 `prayCard.bible_card_url`은 legacy fallback으로만 사용한다.

### Store

- 전역 상태가 꼭 필요한 경우에만 `baseStore`에 추가한다.
- `/bible-card` 페이지 내부에서만 쓰는 선택 카드, 생성 중 상태, 미리보기 상태는 지역 상태를 우선한다.
- 생성 성공 후에는 필요한 목록만 다시 fetch해서 프로필/히스토리와 동기화한다.

## 기존 코드 영향 범위

### 제거 또는 대체 대상

- `/bible-card`의 독립 입력형 생성 UI
- 사용자가 기도제목을 직접 입력해서 임시 pray_card를 만드는 흐름
- 신규 플로우에서 `pray_card.bible_card_url`을 저장하는 방식

### 유지 대상

- `/bible-card` 라우트 자체
- `bible_card` 테이블 기반 API
- 기존 `pray_card.bible_card_url` 데이터의 표시 호환
- 모바일 우선 레이아웃
- 앱 WebView 공유/다운로드 관련 동작은 신규 플로우에서 필요 여부를 별도로 판단

## 예외/실패 처리

- 선택된 기도카드가 없으면 내 기도카드 선택 리스트를 먼저 보여준다.
- `praycard_id` query param이 있지만 해당 카드가 없거나 내 카드가 아니면 query param을 제거하고 기본 선택 화면으로 fallback한다.
- 이미 말씀카드가 있는 기도카드는 새로 생성하지 않고 기존 말씀카드를 보여준다.
- 말씀 추천 API 실패 시 저장하지 않고 재시도 CTA를 제공한다.
- 이미지 저장 실패 시 `bible_card` row 생성 여부를 신중히 처리한다.
  - 기본 방침: 이미지 저장 실패 시 row 생성도 하지 않는다.

## 검증 계획

- `npm run build`
- 가능한 경우 `npm run lint`
  - 기존 warning이 있으면 신규 변경 파일에 warning이 추가되지 않았는지 별도로 확인한다.
- 수동 확인
  - 기도카드 생성 완료 → 말씀카드 만들기 → 방금 만든 카드가 기본 선택되는지 확인
  - `/profile/me`에서 기존 내 기도카드 선택 → 말씀카드 생성 → 뒷면 플립 표시 확인
  - 이미 말씀카드가 있는 기도카드 선택 시 중복 생성 없이 기존 말씀카드 표시
  - 말씀 추천/API 실패 시 저장되지 않고 재시도 가능한지 확인
  - 기존 `bible_card_url` 기반 히스토리 카드가 깨지지 않는지 확인

## 아직 기획 확정이 필요한 지점

- 말씀카드 생성 CTA를 프로필 카드 목록 어디에 둘지
  - 카드 상세 drawer 내부
  - 카드 grid item 위 배지/버튼
  - 별도 `/bible-card` 화면에서만 선택
- 말씀카드 생성 후 공유/다운로드 기능을 즉시 제공할지
- 말씀카드가 이미 있는 경우 재생성을 허용할지
- 여러 그룹에 동시에 생성된 기도카드 중 어떤 카드를 기본 선택할지
  - 현재 기본안: 첫 번째 생성 카드
- 기존 `pray_card.bible_card_url` 데이터를 `bible_card` row로 이관할지
  - 현재 기본안: 이관 없이 표시 호환만 유지
