# PrayU 백로그 (전체 레포 통합)

작업 중 발견했지만 그 PR 범위에 넣지 않은 일, 사람 결정/조작이 필요한 일, 보류한 일의 **단일 목록**.
세션 기록이 아니라 **여기가 원본**이다. 새 세션은 이 문서를 먼저 읽는다.

> **기록 규칙**
> - 작업 중 후속 이슈를 발견하면 **그 자리에서** 이 문서에 추가한다 (PR에만 코멘트하고 끝내지 않는다)
> - 상세 설계가 필요하면 별도 `docs/*-plan.md`를 만들고 여기서는 **한 줄 + 링크**만 둔다
> - 완료 시 "완료" 절로 옮기고 날짜·PR 번호를 남긴다 (삭제하지 않는다 — 왜 그렇게 했는지가 남아야 한다)
> - 보안 항목은 [security-backlog.md](security-backlog.md), 운영 설정 대장은 [supabase-migration-plan.md](supabase-migration-plan.md)에 상세를 두고 여기서는 링크만

---

## 진행 중 — 어드민 개편 (4개 PR)

계획: [admin-revamp-plan.md](admin-revamp-plan.md)

| 단계 | 내용 | 상태 |
|---|---|---|
| PR A (Api) | `profiles.is_admin` + `notice` 테이블 + RLS | [Api#39](https://github.com/TeamVisioneer/PrayU-Api/pull/39) 리뷰 대기 |
| PR B (web) | 공지 모달 전역화, 죽은 컴포넌트 제거, 어드민 공지 관리 | [web#469](https://github.com/TeamVisioneer/PrayU-Web/pull/469) 리뷰 대기 |
| PR C (Api) | `admin` edge function — 집계는 TS (RPC 미사용) | 미착수 |
| PR D (web) | 어드민 대시보드 탭 개편, `NewAdminPage`(mock 533줄) 삭제 | 미착수 |

**merge 순서: Api → web.**

---

## 다음 작업 (우선순위 순)

### 1. `premium_expired_at` 자기부여 차단 — 사용자 판단 대기
사용자가 자기 프로필의 `premium_expired_at`을 임의 설정해 **프리미엄(그룹 무제한)을 무료로 얻을 수 있다.** 로컬 실증 완료.
`is_admin`과 같은 원인(컬럼 제한 없는 UPDATE 정책)이지만 성격이 다르다 — 정보 노출이 아니라 **권한 상승 + 매출 직결**이고, 브라우저 콘솔 한 줄로 가능하다.
다만 실제 악용 가능성은 사용자 판단 영역이므로 **막을지 여부를 먼저 정한다.** 막기로 하면 PR C에서 어드민 쓰기를 `admin` edge function 경유로 옮긴 뒤 컬럼 권한을 회수하면 되고, 추가 비용은 거의 없다.
상세: [security-backlog.md](security-backlog.md) 8번

### 2. 공지 알림에 `notice_id` 연결
어드민 알림 발송(`NotificationDialog`)이 `notification.data`에 `notice_id`를 넣지 않는다. 지금은 알림함에서 공지를 눌러도 모달이 열리지 않고 읽음 처리만 된다(구 알림과 동일 동작). 발송 폼에서 공지를 선택해 연결하도록 보완 — PR D의 운영 탭에서 함께.

### 3. 어드민 접근 제어를 `is_admin` 기반으로 교체
`AdminPage`의 이메일 하드코딩 allowlist와 `profiles`의 `admin can update user profile` 정책(이메일 배열)이 남아 있다. PR D에서 정리. 상세: [security-backlog.md](security-backlog.md) 4번

### 4. 신고 payload에 `pray_card_id` 추가
`ReportAlert`가 Discord 웹훅으로 보내는 내용에 대상 카드 ID가 없어, 어드민이 삭제할 카드를 특정할 수 없다. PR D에서 함께.

---

## 보류 (사용자 재요청 대기)

### PrayU-App 딥링크·푸시 리다이렉트·리뷰 API
계획 문서: `PrayU-App/docs/deeplink-push-review-plan.md`
**⚠️ 이 파일은 아직 git에 커밋되지 않았다** (App 레포가 WIP 브랜치 상태라 건드리지 않음). App 작업 재개 시 **가장 먼저 커밋**할 것.

요지: https 딥링크가 안 열리는 원인은 웹에 배포된 검증 파일이 빈 상태(`assetlinks.json`의 지문 배열, AASA의 `details`)이고, 콜드 스타트 시 푸시/딥링크 URL이 유실되며, `prayu://` 파싱 버그(`uri.host`를 무시)가 있다. iOS는 Apple 팀 양도로 App Group이 이전되지 않아 서명 실패 — 새 그룹 ID로 교체 필요. 사용자 수동 단계: Play 앱 서명 SHA-256 기입, App Group 등록, APNs 키 재발급.

### Supabase 커스텀 도메인 (`staging-api.prayu.site` / `api.prayu.site`)
유료 애드온 + CNAME/TXT + `supabase domains activate`. 도입 시 카카오 로그인 Redirect URI에 새 도메인 콜백 추가 필요. **도입 여부 미결정.**

---

## 운영 조작 대기 (사람이 직접)

- [ ] **카카오 콘솔 웹훅 등록** — staging은 등록 완료. prod는 Api release 후 `https://qggewtakkrwcclyxtxnz.supabase.co/functions/v1/kakao-webhook` (메서드 **POST**). 각 환경 `KAKAO_ADMIN_KEY` 시크릿이 해당 앱 어드민 키와 일치하는지 확인
- [ ] **카카오 [플랫폼] > [Web] 사이트 도메인** — prod 앱에도 `https://prayu.site` 계열 등록 확인 (staging에서 4019 `domain mismatched`로 겪은 항목). 앱(WebView) 공유까지 쓰려면 `prayu-staging.vercel.app`도 양쪽(플랫폼 + 제품 링크 관리)에 등록
- [ ] **prod 대시보드에서 `push` 함수 수동 삭제** — web#37 후속 (코드에서는 제거됨)
- [ ] **운영 관리자 계정에 `is_admin = true` 설정** — Api#39 배포 후
- [ ] **prod release 순서: Api 먼저 → web** (태그 발행)

---

## 개선 아이디어 (급하지 않음)

- 공지 이미지 Storage 이전 — 현재는 웹 레포 `/images/notice/*.png` 경로 문자열. 컬럼이 text라 절대 URL도 수용하므로 확장 가능
- 성경 구절 픽커 **초성 키보드 검색** (현재는 초성 인덱스바만)
- 신고 접수 **테이블화** — 현재 Discord 웹훅만. 신고량이 늘면
- 어드민 통계가 느려지면: 인덱스 → 기간 축소 → **야간 롤업**(pg_cron이 `admin` 함수 호출 → `daily_stats` 적재, 로직은 앱에 유지)
- 브라우저 열람 비중이 높은 공유 랜딩 페이지에 **문서 스크롤 모드** 검토 — 현재 앱 셸 구조라 iOS Safari 툴바가 접히지 않는다. 상세: [viewport-layout-improvement-plan.md](viewport-layout-improvement-plan.md) 3절
- QT 응답 토큰을 `llm_usage_log`에 기록 (현재 호출 수만 차감)
- `deno.lock` 커밋 여부 결정 (Api)

---

## 완료

| 날짜 | 내용 | PR |
|---|---|---|
| 2026-07-27 | 공지 DB 전환 + 앱 전역 노출, 죽은 공지 컴포넌트 3개 제거 | Api#39 / web#469 |
| 2026-07-27 | `is_admin` 자기부여 차단 (컬럼 단위 UPDATE 권한 회수) | Api#39 |
| 2026-07-27 | 말씀카드 안내 시트 + 소진 문구 정합화, 카드 변경 UX | web#468 |
| 2026-07-27 | 히스토리 드로워: 공유 버튼 그룹, 면별 액션 분기 | web#466, #467 |
| 2026-07-27 | 뷰포트 `dvh` 전환 + safe-area, `max-w-app` 토큰화 | web#464, #465 |
| 2026-07-27 | 카카오 공유 보상 (웹훅 수신 → 생성 횟수 +1) | Api#38 / web#463 |
| 2026-07-26 | QT 페이지 개선 (헤더 통일, 구절 픽커, 범위 선택) | web#461, #462 |
| 2026-07-26 | Toast UI/UX 개편 (위로 스와이프, 상단 중앙 필) | web#460 |
| 2026-07-26 | QT LLM 일일 한도, JWT 서명 검증, 레거시 엔드포인트 제거 | Api#35, #36, #37 |
| 2026-07-25 | 말씀카드 재생성/교체 + LLM 사용 로그 기반 일일 한도 | Api#33, #34 / web#457~459 |
