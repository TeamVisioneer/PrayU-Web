# PrayU-web 백로그

이 레포(프론트엔드)에서 해야 할 일의 **원본 목록**.
세션 기록은 휘발되므로 **여기에 없으면 없는 것**이다.

관련 백로그: [PrayU-Api/docs/backlog.md](../../PrayU-Api/docs/backlog.md) · `PrayU-App/docs/backlog.md`
보안 상세: [security-backlog.md](security-backlog.md) · 운영 설정 대장: [supabase-migration-plan.md](guides/supabase-migration-plan.md)

> **기록 규칙**: 작업 중 후속 이슈를 발견하면 그 자리에서 여기에 추가한다(PR 코멘트로만 남기지 않는다).
> 상세 설계는 별도 `docs/*-plan.md`로 만들고 여기서는 한 줄 + 링크. 완료 시 삭제하지 말고 "완료"로 옮긴다.

---

## 진행 중 — 어드민 개편

계획: [admin-revamp-plan.md](archive/admin-revamp-plan.md) (4개 PR, merge는 **Api 먼저 → web**)

**어드민 개편은 모두 merge 완료** (아래 "완료" 절 참조). 남은 것은 staging 확인과 prod release다.

## RLS 감사 결과 (2026-07-27)

앱 쿼리가 RLS에 암묵적으로 기대는 곳이 더 있는지 전수 확인했다. 결론: **사용 로그 2건 외에는 없다**(#470에서 해결).

확인된 사실과 후속거리:

- **모든 테이블의 SELECT 정책이 `using(true)`** — RLS가 제공하는 읽기 격리는 현재 0이다. "내 데이터" 쿼리는 전부 코드에서 필터해야 하며, 실제로 `notification`·`bible_card`·`pray`·`pray_card`·`member`·`profiles` 조회는 모두 명시 필터를 갖고 있다
- ⚠️ **`notification` 정책 이름이 사실과 다르다** — `Enable users to view their own data only`인데 조건은 `true`다. 정책 목록만 보면 본인 것만 보인다고 오해하게 되며, 실제로는 **누구나 전체 알림 제목·본문을 조회할 수 있다**. 이름을 고치거나 정책을 실제로 좁혀야 한다 (security-backlog 1번과 함께)
- **`fetchQtData`는 user_id 없이 본문(장·절)으로만 조회** — 다른 사용자가 만든 QT를 재사용한다. LLM 비용 절감 관점에서 의도된 캐시로 보이지만 코드에 근거가 없다. 의도라면 주석으로 명시할 것
- `fetchTotalPrayCount`(전체 기도 수)와 어드민 프로필 검색은 의도된 전역 조회다

## 진행 중 — 공지 저작·게시 절차

계획: [notice-authoring-plan.md](guides/notice-authoring-plan.md) — 릴리스마다 반복될 절차라 고정한다.

결정: **원고·이미지를 레포에 커밋(PR 리뷰) → 어드민이 그 원고를 읽어 초안으로 등록 → 사람이 노출.**
붙여넣기는 손으로 옮기는 단계라 없앴고, 마이그레이션 게시는 서비스 데이터를 스키마 히스토리에 남기게 되어 접었다.

- [x] ~~첫 공지 원고 + 스크린샷~~ — [#480](https://github.com/TeamVisioneer/PrayU-Web/pull/480). 로컬 시드 계정으로 캡처했다(카카오 로그인 없이 가능해짐)
- [x] ~~**staging 게시(리허설)**~~ — 2026-07-31 확인 완료. 레포 원고 → 초안 등록 → 노출까지 정상
- [ ] ⚠️ **prod 공지는 release 이후에만 가능** — 현재 prod에 `notice` 테이블이 없다(`42P01`). release → 관리자 `is_admin=true` → 게시 순서

## 🎯 v1.0.0 릴리스 — 범위 확정 중

계획: [plans/release-v1/plan.md](plans/release-v1/plan.md) — 신규 피처 목록·보안 포함 범위·App 트랙 결정 대기.
릴리스 전까지 신규 피처를 staging 에 쌓고, 범위가 닫히면 runbook 분리.

## 회원 탈퇴 — 소프트 삭제 (짝 작업)

계획: [../../PrayU-Api/docs/archive/account-deletion-plan.md](../../PrayU-Api/docs/archive/account-deletion-plan.md) · Api 짝 PR [#56](https://github.com/TeamVisioneer/PrayU-Api/pull/56)

하드 삭제는 FK 때문에 **항상 실패**했는데 web 이 반환값을 안 봐서 사용자는 탈퇴됐다고 믿었다.
절차 전체를 서버가 소유하도록 옮기고, 실패를 사용자에게 알린다.

- [x] ~~반환값 확인 · `deleted_at` 프로필을 "(탈퇴유저)"로 표시 · 클라이언트 삭제 절차 제거~~ — [#494](https://github.com/TeamVisioneer/PrayU-Web/pull/494)
- [ ] ⚠️ **동작 변경 확인(staging)**: 예전에는 탈퇴 시 클라이언트가 `pray`·`pray_card` 까지 소프트 삭제해
      **상대방 화면에서도 기도 기록이 사라졌다.** 이제는 남는다 — 의도된 변경이지만 실사용 화면에서 확인 필요
- [ ] 표시 헬퍼 미적용 화면 — `Office/*`·`AdminPage/*` 는 내부 도구라 기존 폴백(`"이름 없음"` 등)을 그대로 뒀다.
      **탈퇴자의 실명·사진이 그대로 보인다**(데이터를 지우지 않으므로). 운영 추적 용도라 의도에 부합하지만,
      혼동되면 `displayProfileName` 으로 통일한다
- [ ] ⚠️ **가리는 것은 화면뿐이다.** RLS 가 `select using(true)` 라 PostgREST 를 직접 부르면 탈퇴자 정보도 읽힌다 —
      전체 RLS 정비([security-backlog.md](security-backlog.md) 1번)에 걸린 사안

## 다음 작업 — 파일 스토리지 R2 이전 (짝 작업)

계획: [../../PrayU-Api/docs/archive/storage-r2-plan.md](../../PrayU-Api/docs/archive/storage-r2-plan.md) · Api 백로그에 자기 단계 있음

**신규 업로드만 R2 로** 돌린다. 기존 Supabase 파일·URL 은 그대로 두므로 이전 비용이 발생하지 않는다.
공개 도메인은 `r2.dev` 로 시작하되, **DB 에는 절대 URL 이 아니라 경로(key)만 저장**해 나중에 도메인을
바꿀 때 환경변수 한 줄로 끝나게 한다.

- [x] ~~**업로드 전 리사이즈**~~ — [#488](https://github.com/TeamVisioneer/PrayU-Web/pull/488). 폰 사진 6.75MB → 484KB(7%).
      **R2 와 무관하게 선행해야 할 작업이었다** — 원본 업로드는 어느 스토리지로 가도 문제다
- [x] ~~`src/lib/assetUrl.ts` · `src/apis/file.ts` · 읽는 곳 전환~~ — [#489](https://github.com/TeamVisioneer/PrayU-Web/pull/489)
- [x] ~~Api 시크릿 `R2_*` 4개 — staging·prod 양쪽 등록 완료~~ (2026-07-31, 해시 대조로 값까지 검증)
- [x] ~~**staging Vercel 에 `VITE_STORAGE_BASE_URL` 등록 + 재배포**~~ — 2026-07-31.
      staging 번들에 `pub-554e60a0….r2.dev` 가 박힌 것으로 확인
- [x] ~~**prod Vercel(`prayu`)에 `VITE_STORAGE_BASE_URL` 등록**~~ — 2026-07-31 등록 완료. release 전이라 아직 빌드에 반영되지 않는다
      - **prod release 순서를 Api 먼저 → web 으로 확정**했으므로, web 이 나가는 시점엔 업로드 엔드포인트가 이미 prod 에 있다.
        성경 동기화 때문에 web 먼저로 뒤집었던 예외는 철회됐다 → [PrayU-Api/docs/backlog.md](../../PrayU-Api/docs/backlog.md)
      - ⚠️ **Production 스코프만 체크한다.** 기존 변수들이 Production/Preview/Development 세 곳에 다 걸려 있어
        습관대로 하면 Preview 까지 켜지고, Preview 빌드는 prod Supabase 를 보면서 **prod 버킷**에 쓴다
      - 이미 배포된 prod 에 값을 반영할 때는 **태그 재발행이 아니라 Vercel 대시보드에서 Redeploy** 하면 된다
        (`VITE_` 값은 빌드 시점에 번들에 박히므로 재빌드가 필요하다)
- [ ] **손대지 않는 것**: `avatar_url`(카카오 외부 URL)·`pray_card.bible_card_url`(레거시) →
      `UserProfile`·`PrayListDrawer`·`PrayCard` 는 그대로
- [x] ~~전환 후 확인~~ — 2026-07-31 staging 확인 완료 (신규 카드는 key 저장, 기존 카드 정상 표시)

**이번 범위는 앞으로 만드는 이미지뿐이다.** 이미 올라간 파일과 그 URL 은 건드리지 않는다 —
옮길지 여부·방법은 나중에 별도로 정한다(계획 문서의 "기존 이미지는 이번에 건드리지 않는다" 절).


## 개선 아이디어 (급하지 않음)

- 공지 열람 기록을 **계정 단위**로 — 현재는 localStorage(`seenNoticeIds`)라 기기·브라우저를 바꾸면 이미 닫은 공지가 한 번 더 뜬다. 정확히 하려면 "누가 어떤 공지를 봤는지" 테이블이 필요하다 (공지 성격상 현재는 과함)

- 공지 이미지 Storage 이전 — 현재는 레포 `/images/notice/*.png` 경로 문자열. 컬럼이 text라 절대 URL도 수용하므로 확장 가능
- 성경 구절 픽커 **초성 키보드 검색** (현재는 초성 인덱스바만)
- 신고 접수 **테이블화** — 현재 Discord 웹훅만. 신고량이 늘면
- 브라우저 열람 비중이 높은 공유 랜딩 페이지에 **문서 스크롤 모드** 검토 — 현재 앱 셸 구조라 iOS Safari 툴바가 접히지 않는다. 상세: [viewport-layout-improvement-plan.md](archive/viewport-layout-improvement-plan.md) 3절

## 배포 대기 — 어드민 개편 후속

- [x] ~~**staging에서 어드민 확인**~~ — 2026-07-31 완료
- [x] ~~**공지 이미지 업로드 확인**~~ — 2026-07-31 완료 (R2 전환 후에는 `notice/` 키로 R2 에 올라간다)

## 배포 대기

### 성경 본문 원본 동기화 — merge 완료, prod 대기
[#475](https://github.com/TeamVisioneer/PrayU-Web/pull/475) (표시 정리) · [PrayU-Api#44](https://github.com/TeamVisioneer/PrayU-Api/pull/44) (본문 동기화) · 상세: [../../PrayU-Api/docs/archive/bible-sync-plan.md](../../PrayU-Api/docs/archive/bible-sync-plan.md)

DB는 원본(goodtv) 표기를 **그대로 보존**한다 — `<구역 제목>`(2,431행)·`○`(3,383행, 30개 절은 중간에 위치).
따라서 표시 시 제거는 프론트 몫이고, `apis/bible.ts` 입구에서 `stripBibleMarkers()`로 한 번만 정리한다
(표시뿐 아니라 **말씀카드 본문 저장·QT LLM 입력**도 같은 문장을 쓰기 때문에 입구가 맞는 위치다).

양쪽 merge 완료(2026-07-28). staging DB 31,102행·누락 절 복구 확인, staging 번들에 정리 코드(`/○/g`) 포함 확인.

- [x] ~~⚠️ prod release 순서가 평소와 반대 — web 먼저 → Api~~ → **철회. 평소대로 Api 먼저 → web** (2026-07-31 결정)
  - 당초 근거: Api 가 먼저 나가면 본문의 `○` 가 **구버전 web 에 그대로 노출**된다
  - 뒤집은 이유: R2 업로드가 정반대 순서를 요구하고 어기면 **500** 이다. `○` 노출은 표시 문제라 급이 다르다
  - 근거 원본: [PrayU-Api/docs/backlog.md](../../PrayU-Api/docs/backlog.md) 성경 동기화 절
- [x] ~~**staging UI 확인**~~ — 2026-07-31 완료. `○`·`<구역제목>` 없음 확인
- [ ] **기존 QT 결과(`qt_data`)에는 표기가 남아 있을 수 있다** — LLM 응답에 원문이 인용된 경우. 새로 생성되는 것부터 정리되며, 과거분 보정은 하지 않는다(판단 필요 시 별도 작업)
- [ ] staging 인수테스트 후 **prod release(태그) 발행** — 순서는 **Api 먼저 → web** (예외 없음)
- [ ] 실기기 확인(뷰포트 개편분): iOS Safari 하단 툴바 뒤 흰 띠 소멸, 회전·키보드, **앱 WebView 회귀**(`viewport-fit=cover` 영향)

## 완료

| 날짜 | 내용 | PR |
|---|---|---|
| 2026-07-28 | 공지 어드민 보조 — 이미지 URL 직접 입력 + 원고 붙여넣기(`lib/noticeDraft.ts`) | #479 |
| 2026-07-28 | 개발용 이메일 로그인 `/dev/login` (개발 빌드 전용) — 로그인 뒤 화면 확인·캡처 가능 | #478 |
| 2026-07-28 | 성경 본문의 원본 표기(`<구역제목>`·`○`) 표시 시 제거 — `lib/bibleText.ts` + API 계층 일괄 적용 | #475 |
| 2026-07-27 | 공지사항 목록 페이지 (카카오 채널 링크 대체), 닫기=본 것으로 처리 | #473 |
| 2026-07-27 | 어드민 대시보드 전면 개편 (탭 4개·차트·퍼널), NewAdminPage·공지 알림 발송 제거, is_admin 접근 제어, 공지 에디터(이미지 업로드·마크다운·미리보기)와 공지 모달 UX | #471 |
| 2026-07-27 | 사용 로그 읽기 개방 + 사용량 집계에 user_id 필터 명시 | #470 |
| 2026-07-27 | 공지 DB 전환 + 앱 전역 노출, 죽은 공지 컴포넌트 3개 제거 | #469 |
| 2026-07-27 | 말씀카드 안내 시트 + 소진 문구 정합화, 카드 변경 UX | #468 |
| 2026-07-27 | 히스토리 드로워: 공유 버튼 그룹, 면별 액션 분기 | #466, #467 |
| 2026-07-27 | 뷰포트 `dvh` 전환 + safe-area, `max-w-app` 토큰화 | #464, #465 |
| 2026-07-27 | 카카오 공유 보상 UX (serverCallbackArgs, 보상 반영) | #463 |
| 2026-07-26 | QT 페이지 개선 (헤더 통일, 구절 픽커, 범위 선택) | #461, #462 |
| 2026-07-26 | Toast UI/UX 개편 (위로 스와이프, 상단 중앙 필) | #460 |
| 2026-07-25 | 말씀카드 재생성/교체 + 일일 한도 표시 | #457~459 |
