# 어드민 페이지 전면 개편 + 공지(notice) 관리 계획

## 1. 현황 진단

### 1-1. `/admin` (AdminPage.tsx, 422줄)

| 섹션 | 내용 | 판정 |
|---|---|---|
| 대시보드 | 누적 유저수 / 오늘 신규 유저 / 오늘 신규 그룹 — 카드 3개 | **정보 과소**. 추세·활성도·기능 사용량 전무 |
| 프로필 검색 / 프리미엄 만료 설정 | 이름·ID 검색 → `premium_expired_at` 설정 | 유지 (실제 운영에 쓰임) |
| 공지사항 알림 작성 | `NotificationDialog` — title/body로 `type=notice` 알림 발송 | 유지하되 공지(notice)와 연결 필요 |
| 신고 게시물 관리 | pray_card id를 **직접 붙여넣어** 삭제 | 개선 필요 (아래 1-4) |
| 목업 페이지 | `/group/mock` 등 이동 버튼 | 개발용 — 축소 |

접근 제어: 컴포넌트 안에 **이메일 하드코딩 allowlist**(`team.visioneer15@gmail.com`, `s2615s@naver.com`)로 화면만 가림. 데이터 자체는 RLS가 유일한 방어선 — `security-backlog.md` 1·4번(RLS 정비, 어드민 권한)과 직결.

### 1-2. `/admin/new` (NewAdminPage.tsx, 533줄) — **전부 mock 데이터**

recharts로 차트를 그려놨지만 `mockDailyUsers`, `mockGroupActivity` 등 하드코딩 배열만 렌더한다. 실데이터에 연결된 적이 없는 프로토타입 잔재. **개편 후 삭제 대상.**

### 1-3. 공지 모달 (별건이나 이번에 함께 정리)

- `WeekUpdateDialog`: 메인에서만 렌더, 자동 노출 `useEffect`가 #403 hotfix로 **주석 처리된 채 방치** → 현재 어떤 경로로도 안 뜸
- `EventDialog`: **어디에도 마운트 안 됨**. 그런데 `NotificationItem`이 공지 알림 클릭 시 `setIsOpenEventDialog(true)`를 호출 → **공지 알림을 눌러도 아무것도 안 뜨는 상태**
- `OpenEventDialogBtn`: 렌더되는 곳 없음
- 모든 내용이 코드 하드코딩 → 문구 수정·중단에 배포 필요 (#403이 그 증거: 모달 끄려고 핫픽스 배포)

**사용자 결정**: 노출 위치 **앱 전역**, "다음에 보지 않기"로 사용자가 제어.

### 1-4. 신고 처리 경로

`ReportAlert`는 신고를 **Discord 웹훅으로만** 보내고 DB에는 남기지 않는다. 게다가 payload에 `pray_card_id`가 없어(제보/신고 유저 ID와 내용만) 어드민이 삭제할 카드를 특정하기 어렵다.

## 2. 아키텍처 결정 — 통계 집계를 어디서 하나

지금처럼 클라이언트에서 supabase를 직접 count 하려면 **전체 테이블 select 권한**이 필요해져 RLS를 넓혀야 한다. 어드민 편의를 위해 전 사용자 데이터를 열어주는 셈이라 방향이 어긋난다. 그렇다고 집계를 DB 함수(RPC)에 넣으면 **비즈니스 로직이 앱 밖으로 나가** 디버깅·테스트·버전 관리가 어려워진다.

**결정: `admin` edge function (Deno+Hono, service role) — 집계 로직은 전부 TypeScript**

기존 `bible`/`openai` 함수와 동일한 Controller→Service→Repository 계층을 따른다.

```
supabase/functions/admin/
  index.ts                  Hono 라우팅 + authMiddleware + requireAdmin
  adminController.ts        요청 파싱(기간 파라미터), 응답/에러 코드
  statsService.ts           집계 로직 — 일별 버킷팅, 퍼널 전환율, 비용 환산
  noticeService.ts          공지 CRUD 규칙 (활성 1건 보장 등)
  statsRepository.ts        supabase 질의 (count / 최소 컬럼 select)
```

**레이어별 책임 구분** — DB에는 "로직"이 아니라 "권한과 데이터"만 남긴다:

| 관심사 | 위치 | 근거 |
|---|---|---|
| 집계·계산·전환율·비용 환산 | **edge function TS** | 비즈니스 로직. 앱과 함께 버전 관리·디버깅·테스트 |
| 관리자 검사 | **edge function** (`authMiddleware` → `profiles.is_admin` 조회) | 기존 인증 계층 확장 |
| 행 가시성 (누가 어떤 행을 보나) | **RLS** | 기존 패턴 유지. 로직이 아니라 접근 권한 |

**질의 전략** (원본 행을 대량으로 끌어오지 않기 위해):
- KPI 카운트: `count: "exact", head: true` — 행 전송 0
- 일별 추이: 기간 내 **`created_at` 한 컬럼만** select → TS에서 KST 기준 일별 버킷팅 (`_shared/kst.ts` 재사용)
- 그룹 현황: `group?select=id,name,member(count),pray_card(count)` — PostgREST 임베디드 count로 N+1 회피
- LLM/공유 보상: 일일 한도(말씀카드 3 / QT 10) 덕에 로그 양 자체가 작아 기간 조회 후 TS 합산

**트레이드오프(명시)**: 단일 SQL 집계보다 왕복과 전송량이 많다. 현재 규모에선 문제없지만, 특정 질의가 느려지면 **인덱스 추가 → 기간 축소 → 야간 롤업**  순으로 대응한다. 롤업은 pg_cron이 `admin` 함수의 집계 엔드포인트를 호출해 `daily_stats` 테이블에 **행을 쌓는** 방식이라(이미 알림에서 쓰는 패턴) 로직은 계속 앱에 남는다.

**관리자 판별**: `profiles.is_admin boolean not null default false` 컬럼 신설. 이메일 하드코딩을 제거하고 edge function과 공지 쓰기 정책이 이 한 값을 본다.

## 3. 제안 기능 (스키마 기반)

탭 4개로 재구성한다.

### 탭 1. 개요

**KPI 카드** (기간 선택 7/30/90일, 전 기간 대비 증감률 표시)
- 누적 유저 / 신규 유저 (`profiles.created_at`)
- 활성 유저 DAU·WAU·MAU — **활성 정의: 기도(`pray`) 1회 이상**
- 누적 그룹 / 신규 그룹 (`group`), 그룹당 평균 멤버 (`member`)
- 주간 기도카드 수 (`pray_card`), 기도 수 (`pray`)

**일자별 추이 차트** (recharts 재사용)
- 신규 가입 / 신규 그룹
- 기도 수 / 기도카드 작성 수
- 활성 유저 추이

**활성화 퍼널** — 가입 → 그룹 가입(`member`) → 기도카드 작성(`pray_card`) → 기도(`pray`)
각 단계 전환율. **어디서 이탈하는지**가 제품 개선의 핵심 신호인데 지금은 전혀 안 보인다.

### 탭 2. 그룹

- 그룹 목록: 이름, 멤버 수, 기도카드 수, 최근 활동일, 주간 기도 수, 개설일
- 정렬(활동순/멤버순/최신순), 검색, 연합(`group_union`) 필터
- **휴면 그룹 식별**: 최근 N일 활동 0 — 리텐션 액션 대상

### 탭 3. 기능 사용 · 비용

이미 쌓고 있는 로그를 처음으로 활용하는 영역이다.
- **LLM**: `llm_usage_log` 일별 호출 수(feature별 bible_card/qt), 토큰 합계, **추정 비용** — 원래 도입 목적이 비용 통제였으니 여기 있어야 한다
- **공유 보상**: `share_reward_log` 일별 지급 수, 보상받은 유저 수, 채팅방 타입 분포 → 공유 유도 효과 측정
- **말씀카드/QT**: `bible_card`, `qt_data` 생성 추이
- **알림**: `notification` 발송 수 대비 `checked_at` 기준 **확인율** — 공지 도달률을 여기서 본다

### 탭 4. 운영

- **공지(notice) 관리**: 목록 / 작성 / 수정 / 활성 토글 / 미리보기 (아래 4절)
- 공지 알림 발송 (기존 `NotificationDialog` 유지, 발송 시 `data.notice_id` 연결)
- 유저 검색 + 프리미엄 만료 설정 (기존 유지)
- 신고 처리 (아래 5절)

## 4. 공지(notice) — DB 기반으로 전환

### 테이블

```sql
create table notice (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slides jsonb not null default '[]',   -- [{image_url, tip, description[]}]
  cta_label text,
  cta_url text,                          -- 예: /bible-card/new
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  target text not null default 'all',    -- 'all' | 'existing' (가입일 < starts_at)
  created_at timestamptz not null default now()
);
```

- **이미지는 DB로 옮기지 않는다.** 지금처럼 `/images/notice/*.png`를 레포에 두고 경로 문자열만 저장 (절대 URL도 허용해 추후 Storage 확장 가능). Storage로 가면 업로드 UI·버킷 정책·용량 관리가 딸려와 작업량이 몇 배가 된다.
- RLS: `select` = 로그인 사용자, `is_active` and 기간 내 / `insert·update·delete` = `is_admin`

### 노출 규칙 (사용자 확정)

- **앱 전역** — `App.tsx`에 `<NoticeDialog />` 상시 마운트, 라우트 무관
- 활성 공지 1건 조회 → localStorage `seenNoticeIds`에 없으면 노출
- 액션: **주 CTA 1개**(`cta_label`/`cta_url`) + "다음에 보지 않기"(id 기록) + 닫기
- `target='existing'`이면 `profiles.created_at < starts_at`인 사용자에게만
- 알림함에서 공지 알림 클릭 → `notification.data.notice_id`로 같은 모달 열기 (끊긴 경로 복구)

## 5. 신고 처리 (작은 개선)

신고 테이블 신설은 이번 범위 밖. 대신 **Discord payload에 `pray_card_id`(및 딥링크) 추가** — 어드민이 ID를 찾아 헤매지 않고 바로 붙여넣을 수 있다. 신고량이 늘면 그때 테이블화.

## 6. 파일 매니페스트

### PR A — PrayU-Api: 관리자 권한 + 공지 테이블

| 파일 | 내용 |
|---|---|
| `supabase/migrations/<ts>_add_is_admin_and_notice.sql` (신규) | `profiles.is_admin` 컬럼 추가 / `notice` 테이블 + 인덱스 + RLS(select: 활성·기간, write: is_admin) |

### PR B — PrayU-web: 공지 모달 전역화 + 어드민 공지 관리

| 파일 | 내용 |
|---|---|
| `src/apis/notice.ts` (신규) | `fetchActiveNotice()`, `fetchNoticeById(id)`, 어드민용 `createNotice/updateNotice/fetchNoticeList` |
| `src/components/notice/NoticeDialog.tsx` (신규) | 통합 공지 모달 — 캐러셀, CTA, "다음에 보지 않기", `seenNoticeIds`(localStorage), target 필터 |
| `src/App.tsx` | `<NoticeDialog />` 전역 마운트, `/admin/new` 라우트 제거 |
| `src/components/notification/NotificationItem.tsx` | 공지 클릭 → `data.notice_id`로 NoticeDialog 오픈 (기존 `setIsOpenEventDialog` 대체) |
| `src/stores/baseStore.ts` | `isOpenEventDialog`/`isOpenWeekUpdateDialog` → `openNoticeId` 상태로 정리 |
| `src/pages/AdminPage/NoticeManager.tsx` (신규) | 공지 목록·작성·수정·활성 토글·미리보기 |
| **삭제** | `src/components/notice/EventDialog.tsx`, `src/components/notice/OpenEventDialogBtn.tsx`, `src/components/notice/WeekUpdateDialog.tsx` |

### PR C — PrayU-Api: `admin` edge function

| 파일 | 내용 |
|---|---|
| `supabase/functions/admin/index.ts` (신규) | Hono 라우팅 — `GET /kpi`, `/series`, `/funnel`, `/groups`, `/usage`, 공지 `GET·POST·PATCH /notice`. `authMiddleware` + `requireAdmin` 적용 |
| `supabase/functions/admin/adminController.ts` (신규) | 기간 파라미터 검증(기본 30일, 최대 90일), 403/400 응답 코드 |
| `supabase/functions/admin/statsService.ts` (신규) | 집계 로직 — KST 일별 버킷팅, 퍼널 전환율, 토큰→비용 환산 |
| `supabase/functions/admin/noticeService.ts` (신규) | 공지 CRUD 규칙 |
| `supabase/functions/admin/statsRepository.ts` (신규) | supabase 질의 (count head / 최소 컬럼 select / 임베디드 count) |
| `supabase/functions/_shared/authMiddleware.ts` | `requireAdmin` 추가 — 검증된 user id로 `profiles.is_admin` 조회, false면 403 |
| `supabase/config.toml` | `[functions.admin] verify_jwt = true` |

### PR D — PrayU-web: 어드민 대시보드 개편

| 파일 | 내용 |
|---|---|
| `src/apis/admin.ts` (신규) | `admin` edge function 호출 래퍼 (세션 토큰 전송, 기간 파라미터, 실패 시 null + Sentry) |
| `src/pages/AdminPage/AdminPage.tsx` | 탭 셸로 재구성, 이메일 allowlist → `is_admin` 기반 |
| `src/pages/AdminPage/tabs/OverviewTab.tsx` (신규) | KPI 카드 + 추이 차트 + 퍼널 |
| `src/pages/AdminPage/tabs/GroupsTab.tsx` (신규) | 그룹 현황 테이블 |
| `src/pages/AdminPage/tabs/UsageTab.tsx` (신규) | LLM 비용·공유 보상·기능 사용·알림 확인율 |
| `src/pages/AdminPage/tabs/OperationsTab.tsx` (신규) | 공지 관리 + 알림 발송 + 유저 검색 + 신고 |
| `src/components/alert/ReportAlert.tsx` | Discord payload에 `pray_card_id` 추가 |
| **삭제** | `src/pages/AdminPage/NewAdminPage.tsx` (533줄 mock) |

## 7. 결정 필요 사항

1. ~~집계 방식~~ — **확정: `admin` edge function + TS 집계** (RPC는 로직이 앱 밖으로 나가 반대, 사용자 결정)
2. **관리자 판별**: `profiles.is_admin` 신설(권장) vs 이메일 하드코딩 유지
3. **활성 유저 정의**: 기도(`pray`) 1회 이상(권장) vs 앱 진입/기타 활동 포함
4. **진행 순서**: 공지(A·B) 먼저 vs 대시보드(C·D) 먼저 — **공지 먼저 권장** (이번 릴리스 안내가 급함)
5. LLM 추정 비용 계산에 쓸 **모델별 단가**를 어디에 둘지 (코드 상수면 단가 변경 시 배포 필요)
6. 공지 **읽기**를 클라이언트 직접 조회(RLS로 활성·기간 제한, 단순·빠름) vs `admin` 함수 경유(일관성) — **전자 권장**, 쓰기만 함수 경유

## 8. 검증

- `npm run lint` + `npm run build` (기존 경고 3개 외 신규 0)
- 로컬 스택에서 `is_admin=false` 계정으로 RPC 호출 → `forbidden` 확인 (권한 e2e)
- 공지: 활성/기간 만료/`target=existing` 각 조건별 노출 여부, "다음에 보지 않기" 후 재진입 미노출
- 알림함 공지 클릭 → 해당 공지 모달 오픈
- 어드민 지표: 로컬 시드 데이터로 수치 정합성 확인 (수동 count와 대조)
