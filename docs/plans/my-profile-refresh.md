# 내 프로필 리프레시 — 기록의 공간으로

> 상태: **PR 1 merge(#504) · PR 2 승인·구현** (2026-08-17)
> 배경: 2026-08-17 세션 점검(디자인·코드 관점)에서 나온 개선 포인트를 범위로 묶은 계획.
> [profile-social.md](identity/profile-social.md)(username·팔로우·검색, v1.3+)는 **이 계획 범위 밖** —
> RLS 정비 선행 조건에 묶여 있어 건드리지 않는다.

## 왜 지금 하나

제품 정체성이 "데일리 신앙 기록"으로 확정됐는데([identity/overview.md](identity/overview.md)),
내 프로필은 기록의 축적이 보여야 할 유일한 공간임에도 이름 + 받은 기도 수 한 줄이 전부다.
동시에 v1.0.x 재스킨 잔재(gray 리터럴·hex·CTA급 탭)와 자잘한 코드 결함이 같은 파일들에 몰려 있어
한 번에 정리하는 것이 경제적이다.

## 범위

**포함 (PR 1)**
1. 히어로 카드에 **기록 스탯 행** — 기도카드 수 · 받은 기도 수 · 함께하는 그룹 수
2. 보관함 **빈 상태** — 카드 0개일 때 첫 카드 만들기 초대
3. 탭 활성 스타일을 CTA급 그라디언트 → **흰 pill** (하단 네비 활성 탭과 같은 문법)
4. 토큰 정리 — `text-gray-*`→시맨틱 토큰, `border-[#f7f7f7]` hex 제거, 프리미엄 뱃지 `animate-pulse` 제거
5. 달력 톤 정리 — 안 기도한 날 **✗ 아이콘 제거**(빈 원으로), 주간 구조는 유지
6. 코드 결함 — 로딩 게이트 축소, 페이지네이션 죽은 분기 제거, `key={index}` 교정,
   `!historyPrayCardCount`의 0 흡수 해소, 데드 코드 `MyProfile.tsx` 삭제

**제외 (별도 결정/후속)**
- 달력 **월 단위** 개편 — `fetchPrayListByDate(id, startDt, endDt)` 가 임의 범위를 이미 받아
  API 변경은 불필요하지만, UI(월 그리드·이동)가 별개 관심사 크기다 → **PR 2 로 분리, 진행 여부 결정 대기**
- `historyPrayCardList*` 전역 상태 소유권 일원화 — 기도카드 작성 스텝 3개·말씀카드 페이지와
  공유되는 상태라 이동 시 파급 확인이 먼저다 → 후속 검토 (backlog)
- SettingDialog(418줄) 분리 — 이번 범위에 프로필 편집이 없으므로 보류
- username·팔로우·검색 — [profile-social.md](identity/profile-social.md) (v1.3+)

## 설계

### 1) 히어로 스탯

```
┌──────────────────────────────────┐
│  (아바타)   김기도  [Premium]      │
│                                  │
│   12         34         2        │
│  기도카드   받은 기도   그룹        │
└──────────────────────────────────┘
```

- 숫자 크게 + 라벨 작게, **아이콘 타일 없이 텍스트 위계로** (design-system.md 품질 기준)
- 데이터 소스: `historyPrayCardCount`(있음) · `userTotalPrayCount`(있음) ·
  그룹 수는 `fetchMemberListByUserId(user.id)` 결과의 `group_id` 비-null 개수 (GroupListPage 와 같은 계산)
- 기존 문구 "지금까지 총 N번의 기도를 받았어요!"는 스탯 행이 대체 — 같은 정보의 중복 표기를 남기지 않는다

### 2) 보관함 빈 상태

- `historyPrayCardCount === 0` 일 때: 초대 카드 (glass-card) —
  "아직 기도카드가 없어요 / 이번 주 기도제목을 그룹에 나눠보세요" + `기도카드 만들기` 버튼 → `/praycard/new`
- 빈 상태는 행동 초대다 — 상태 설명으로 끝내지 않는다

### 3) 탭 활성 스타일

- 컨테이너: 지금의 glass-card 유지
- 활성 탭: `bg-surfaceCard`(불투명 흰 pill) + `shadow-sm` + `font-semibold text-black` —
  그라디언트·white 텍스트 제거. 탭은 상태이지 액션이 아니다 (CTA 와 무게 분리)

### 4) 로딩 게이트 축소

- 현재: `myProfile · profileList(차단 목록) · prayListByDate(달력) · historyPrayCardCount` 4개 전부를 기다림
- 변경: 게이트는 **`myProfile` + `historyPrayCardCount`** 만. 나머지는 소비처에서 각자 대기 —
  차단 목록은 SettingDialog 안에서(열기 전에 로드 완료가 일반적), 달력은 `PrayCalendar` 가 null 이면 스켈레톤
- fetch 호출 자체는 지금처럼 페이지 effect 에서 병렬로 시작한다 (지연 로드가 아니라 **게이트만** 푼다)

## 파일 매니페스트 (PR 1)

| 파일 | 변경 |
|---|---|
| `docs/plans/my-profile-refresh.md` (신규) | 이 문서 |
| `src/pages/MyProfilePage.tsx` (수정) | ① 히어로에 스탯 행 3개 추가, 안내 문구 제거 ② effect 에 `fetchMemberListByUserId` 추가 후 그룹 수 계산 ③ 로딩 게이트를 `myProfile`+`historyPrayCardCount` 로 축소 ④ 탭 활성 클래스 교체(그라디언트→흰 pill) ⑤ `text-gray-800/500`→`text-black`/`text-dark`, 뱃지 `animate-pulse` 제거 |
| `src/components/profile/PrayCardHistoryList.tsx` (수정) | ① `if (!historyPrayCardCount) return null` → `null` 게이트와 `0` 분기(빈 상태 카드 렌더). 빈 상태: 문구+`기도카드 만들기`(navigate `/praycard/new`) ② `key={index}` → `key={prayCard.id}` ③ limit 계산의 죽은 삼항 제거(`pageSize` 고정) ④ gray 토큰 정리 |
| `src/components/profile/PrayCalendar.tsx` (수정) | ① `historyNo`(✗) 이미지 제거 — 안 한 날은 빈 원 ② `border-[#f7f7f7]`→`border-gray-100`… 대신 시맨틱(`glassBorder` 계열) ③ `prayListByDate` null 이면 스켈레톤 반환(게이트 축소 대응, 현재 `prayListByDate!` 단언 제거) |
| `src/components/profile/MyProfile.tsx` (삭제) | import 0건 데드 코드 |
| `docs/backlog.md` (수정) | 완료 기록 + 후속 두 줄(달력 월 단위 PR 2 결정 대기 · `historyPrayCardList*` 소유권 일원화) |

## PR 2 (승인 2026-08-17): 달력 월 단위

- `PrayCalendar` 를 월 그리드로 전면 개정 — 월 이동(←/→, 미래 달 비활성), 이번 달 기본,
  기도한 날 = accent 원, 오늘 = 링. **데이터 소유권도 이 컴포넌트로** —
  월이 바뀔 때마다 `fetchPrayListByDate(id, 월 시작, 다음 달 1일)` 로 직접 조회
  (`prayListByDate` 소비자는 이 달력뿐이라 이동 안전)
- `MyProfilePage` 의 주간 범위 계산·조회 제거
- 알려진 한계(기존 주간 버전과 동일): 날짜 판정이 `created_at` 의 **UTC 날짜부** 기준이라
  KST 자정 전후 9시간 구간의 기도가 이웃 날짜로 보일 수 있다 — 후속(backlog)

**피드백 반영 (2026-08-17, 같은 PR):**
- **날짜 선택 → 일자 상세**: 날짜를 클릭하면 그날 내가 남긴 기도 목록(반응 아이콘 · 대상 이름 · KST 시각)을
  달력 아래에 보여준다. 이번 달 진입 시 **오늘 자동 선택**(어포던스 학습 겸), 재클릭으로 해제.
  기록 없는 날은 "이 날의 기도 기록이 없어요" — 죄책감 톤 배제 유지
- 데이터: `fetchPrayByDateRange` select 를 `*, pray_card(*, profiles(*))` 로 확장
  (`PrayWithPrayCardProfiles` 타입 신설) + `deleted_at` null 필터 추가(소프트 삭제 가드레일 준수)
- **탭 활성 어포던스 강화**: 흰 pill + **accent 텍스트**(`text-accentTo`) — 하단 네비 활성 탭과 같은 문법
- 히어로 스탯(기도카드·받은 기도·그룹)은 **항상 전체 카운트** — 달력 선택/월 이동과 무관 (피드백으로 원칙 확정)
- 🐛 부수 발견·수정: `MyProfilePage` 에 내부 스크롤 컨테이너가 없어 뷰포트 초과 콘텐츠가 잘린 채
  스크롤 불가였다(카드 3개뿐이라 잠복). `h-full` + `main` `flex-1 overflow-y-auto` 로 교정

**2차 피드백 반영 (2026-08-17, 같은 PR):**
- 🐛 **"받은 기도" 스탯이 실제로는 "내가 한 기도"를 세고 있었다** — `fetchUserTotalPrayCount` 가
  `pray.user_id = 나` 를 집계 (리프레시 전 "N번의 기도를 받았어요" 문구 시절부터의 라벨-데이터 불일치).
  **A안 채택**: 내 기도카드에 달린 반응 수(`pray_card.user_id = 나` 조인)로 교정 + `deleted_at` 필터
- **일자 상세를 두 섹션으로**: "내가 남긴 기도" + **"받은 기도"**(누가 · 어떤 반응 · 시각,
  `fetchReceivedPrayByDateRange` 신설). 날짜 마킹은 **내가 기도한 날 유지** — 습관 축은 기록 정체성의 핵심이고,
  받은 기도는 상세에서 보여준다 (마킹까지 받은 기준으로 바꾸면 습관 추적이 사라짐)
- 하루 여러 건 UI 검토(질문 발원): 행 단위 시간순 나열로 동작 확인. 같은 대상 반복 묶기는 **미적용** (결정 대기)

## 검증

- 스크린샷 자기검수(신규 UI 품질 기준): 히어로 스탯 · 빈 상태 · 탭 · 달력 4컷
- 빈 상태는 시드 계정 중 카드 없는 계정(dev3)으로 확인
- `npm run lint`(기존 경고 4개 외 0) + `npm run build`
- 회귀: 보관함 더보기 페이지네이션, 히스토리 드로워 열기, 설정 다이얼로그(차단 목록 표시), 달력 탭 전환

## 결정 대기

- [ ] PR 1 범위 승인 (위 매니페스트)
- [ ] PR 2(달력 월 단위) 진행 여부 — 미진행이면 탭 이름 축소안("이번 주 기도") 중 택일
- [ ] 히어로 스탯 3종 구성 확정 (기도카드 · 받은 기도 · 그룹 — 대안: 기도 일수는 집계 쿼리가 없어 이번엔 제외)
