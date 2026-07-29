# PrayU-web 백로그

이 레포(프론트엔드)에서 해야 할 일의 **원본 목록**.
세션 기록은 휘발되므로 **여기에 없으면 없는 것**이다.

관련 백로그: [PrayU-Api/docs/backlog.md](../../PrayU-Api/docs/backlog.md) · `PrayU-App/docs/backlog.md`
보안 상세: [security-backlog.md](security-backlog.md) · 운영 설정 대장: [supabase-migration-plan.md](supabase-migration-plan.md)

> **기록 규칙**: 작업 중 후속 이슈를 발견하면 그 자리에서 여기에 추가한다(PR 코멘트로만 남기지 않는다).
> 상세 설계는 별도 `docs/*-plan.md`로 만들고 여기서는 한 줄 + 링크. 완료 시 삭제하지 말고 "완료"로 옮긴다.

---

## 진행 중 — 어드민 개편

계획: [admin-revamp-plan.md](admin-revamp-plan.md) (4개 PR, merge는 **Api 먼저 → web**)

**어드민 개편은 모두 merge 완료** (아래 "완료" 절 참조). 남은 것은 staging 확인과 prod release다.

## RLS 감사 결과 (2026-07-27)

앱 쿼리가 RLS에 암묵적으로 기대는 곳이 더 있는지 전수 확인했다. 결론: **사용 로그 2건 외에는 없다**(#470에서 해결).

확인된 사실과 후속거리:

- **모든 테이블의 SELECT 정책이 `using(true)`** — RLS가 제공하는 읽기 격리는 현재 0이다. "내 데이터" 쿼리는 전부 코드에서 필터해야 하며, 실제로 `notification`·`bible_card`·`pray`·`pray_card`·`member`·`profiles` 조회는 모두 명시 필터를 갖고 있다
- ⚠️ **`notification` 정책 이름이 사실과 다르다** — `Enable users to view their own data only`인데 조건은 `true`다. 정책 목록만 보면 본인 것만 보인다고 오해하게 되며, 실제로는 **누구나 전체 알림 제목·본문을 조회할 수 있다**. 이름을 고치거나 정책을 실제로 좁혀야 한다 (security-backlog 1번과 함께)
- **`fetchQtData`는 user_id 없이 본문(장·절)으로만 조회** — 다른 사용자가 만든 QT를 재사용한다. LLM 비용 절감 관점에서 의도된 캐시로 보이지만 코드에 근거가 없다. 의도라면 주석으로 명시할 것
- `fetchTotalPrayCount`(전체 기도 수)와 어드민 프로필 검색은 의도된 전역 조회다

## 진행 중 — 공지 저작·게시 절차

계획: [notice-authoring-plan.md](notice-authoring-plan.md) — 릴리스마다 반복될 절차라 고정한다.

결정: **원고·이미지를 레포에 커밋(PR 리뷰) → 어드민이 그 원고를 읽어 초안으로 등록 → 사람이 노출.**
붙여넣기는 손으로 옮기는 단계라 없앴고, 마이그레이션 게시는 서비스 데이터를 스키마 히스토리에 남기게 되어 접었다.

- [x] ~~첫 공지 원고 + 스크린샷~~ — [#480](https://github.com/TeamVisioneer/PrayU-Web/pull/480). 로컬 시드 계정으로 캡처했다(카카오 로그인 없이 가능해짐)
- [ ] **staging 게시(리허설)** — 어드민 → 레포 원고 → 초안으로 등록 → 미리보기 → 노출, 실제 모달·목록 확인
- [ ] ⚠️ **prod 공지는 release 이후에만 가능** — 현재 prod에 `notice` 테이블이 없다(`42P01`). release → 관리자 `is_admin=true` → 게시 순서

## 다음 작업 — 파일 스토리지 R2 이전 (짝 작업)

계획: [../../PrayU-Api/docs/storage-r2-plan.md](../../PrayU-Api/docs/storage-r2-plan.md) · Api 백로그에 자기 단계 있음

**신규 업로드만 R2 로** 돌린다. 기존 Supabase 파일·URL 은 그대로 두므로 이전 비용이 발생하지 않는다.
공개 도메인은 `r2.dev` 로 시작하되, **DB 에는 절대 URL 이 아니라 경로(key)만 저장**해 나중에 도메인을
바꿀 때 환경변수 한 줄로 끝나게 한다.

- [x] ~~**업로드 전 리사이즈**~~ — [#488](https://github.com/TeamVisioneer/PrayU-Web/pull/488). 폰 사진 6.75MB → 484KB(7%).
      **R2 와 무관하게 선행해야 할 작업이었다** — 원본 업로드는 어느 스토리지로 가도 문제다
- [ ] `src/lib/assetUrl.ts` — **키만 받아** URL 을 만든다. 절대 URL 을 넘기는 경로는 만들지 않는다
- [ ] `src/apis/file.ts` — 서명 URL 방식으로 교체, 반환값을 `{ key }` 로
- [ ] 읽는 곳 — `PrayCardHistoryDrawer`·`PrayCardHistoryList`·`ThanksCardItem` 을
      `assetUrl(image_key) ?? image_url` 로. **값의 생김새로 판별하지 않는다** — 컬럼이 따로 있다
- [ ] `.env` 각 환경에 `VITE_ASSET_BASE_URL`
- [ ] **손대지 않는 것**: `avatar_url`(카카오 외부 URL)·`pray_card.bible_card_url`(레거시) →
      `UserProfile`·`PrayListDrawer`·`PrayCard` 는 그대로

**이번 범위는 앞으로 만드는 이미지뿐이다.** 이미 올라간 파일과 그 URL 은 건드리지 않는다 —
옮길지 여부·방법은 나중에 별도로 정한다(계획 문서의 "기존 이미지는 이번에 건드리지 않는다" 절).

곁가지: 말씀카드 JPEG 품질 q0.95 → q0.85 면 **52KB → 27KB**. 스토리지 수명을 두 배로 늘리는 가장 싼 수단이라
이전과 별개로 검토할 만하다.

## 개선 아이디어 (급하지 않음)

- 공지 열람 기록을 **계정 단위**로 — 현재는 localStorage(`seenNoticeIds`)라 기기·브라우저를 바꾸면 이미 닫은 공지가 한 번 더 뜬다. 정확히 하려면 "누가 어떤 공지를 봤는지" 테이블이 필요하다 (공지 성격상 현재는 과함)

- 공지 이미지 Storage 이전 — 현재는 레포 `/images/notice/*.png` 경로 문자열. 컬럼이 text라 절대 URL도 수용하므로 확장 가능
- 성경 구절 픽커 **초성 키보드 검색** (현재는 초성 인덱스바만)
- 신고 접수 **테이블화** — 현재 Discord 웹훅만. 신고량이 늘면
- 브라우저 열람 비중이 높은 공유 랜딩 페이지에 **문서 스크롤 모드** 검토 — 현재 앱 셸 구조라 iOS Safari 툴바가 접히지 않는다. 상세: [viewport-layout-improvement-plan.md](viewport-layout-improvement-plan.md) 3절

## 배포 대기 — 어드민 개편 후속

- [ ] **staging에서 어드민 확인** — `/admin` 진입(관리자 계정에 `is_admin=true` 설정 필요), 지표가 실데이터와 맞는지, 공지 작성→노출까지
- [ ] **공지 이미지 업로드 확인** — staging `prayu` 버킷의 `notice/` 경로에 실제로 올라가는지

## 배포 대기

### 성경 본문 원본 동기화 — merge 완료, prod 대기
[#475](https://github.com/TeamVisioneer/PrayU-Web/pull/475) (표시 정리) · [PrayU-Api#44](https://github.com/TeamVisioneer/PrayU-Api/pull/44) (본문 동기화) · 상세: [../../PrayU-Api/docs/bible-sync-plan.md](../../PrayU-Api/docs/bible-sync-plan.md)

DB는 원본(goodtv) 표기를 **그대로 보존**한다 — `<구역 제목>`(2,431행)·`○`(3,383행, 30개 절은 중간에 위치).
따라서 표시 시 제거는 프론트 몫이고, `apis/bible.ts` 입구에서 `stripBibleMarkers()`로 한 번만 정리한다
(표시뿐 아니라 **말씀카드 본문 저장·QT LLM 입력**도 같은 문장을 쓰기 때문에 입구가 맞는 위치다).

양쪽 merge 완료(2026-07-28). staging DB 31,102행·누락 절 복구 확인, staging 번들에 정리 코드(`/○/g`) 포함 확인.

- [ ] ⚠️ **prod release 순서가 평소와 반대 — web 먼저 → Api.** 평소 규칙(Api 먼저)은 web이 새 스키마·함수에 의존하기 때문인데
  이번 건은 그 의존이 없다. 반대로 Api가 먼저 나가면 본문에 들어온 `○`가 **구버전 web에서 그대로 노출**된다.
  web을 먼저 내보내면 아직 없는 표기를 지우는 no-op이라 무해하다
- [ ] **staging UI 확인**(로그인 필요) — QT 본문·말씀카드 생성 본문에 `○`·`<구역제목>` 없음, 기존 말씀카드(저장된 본문)도 정상 표시
- [ ] **기존 QT 결과(`qt_data`)에는 표기가 남아 있을 수 있다** — LLM 응답에 원문이 인용된 경우. 새로 생성되는 것부터 정리되며, 과거분 보정은 하지 않는다(판단 필요 시 별도 작업)
- [ ] staging 인수테스트 후 **prod release(태그) 발행** — 순서는 **Api 먼저 → web** (위 성경 동기화 건은 예외)
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
