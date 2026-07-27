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

- [x] **PR B** 공지 모달 전역화 + 어드민 공지 관리 — [#469](https://github.com/TeamVisioneer/PrayU-Web/pull/469) 리뷰 대기 (짝: [Api#39](https://github.com/TeamVisioneer/PrayU-Api/pull/39))
- [ ] **PR D** 어드민 대시보드 탭 개편 — 개요(KPI·추이·활성화 퍼널) / 그룹 / 기능 사용·비용 / 운영

## 다음 작업 (PR D에 포함)

- [ ] **`NewAdminPage.tsx` 삭제** — 533줄 전부 mock 데이터이며 실데이터에 연결된 적 없음. `/admin/new` 라우트도 함께 제거
- [ ] **어드민 접근 제어를 `is_admin` 기반으로 교체** — 현재 컴포넌트 내 이메일 하드코딩 allowlist
- [ ] **공지 알림에 `notice_id` 연결** — `NotificationDialog`(어드민 발송 폼)가 `notification.data`에 `notice_id`를 넣지 않아, 알림함에서 공지를 눌러도 모달이 열리지 않고 읽음 처리만 된다. 발송 시 공지를 선택해 연결하도록 보완
- [ ] **신고 payload에 `pray_card_id` 추가** — `ReportAlert`가 Discord로 보내는 내용에 대상 카드 ID가 없어 어드민이 삭제할 카드를 특정할 수 없다

## 개선 아이디어 (급하지 않음)

- 공지 이미지 Storage 이전 — 현재는 레포 `/images/notice/*.png` 경로 문자열. 컬럼이 text라 절대 URL도 수용하므로 확장 가능
- 성경 구절 픽커 **초성 키보드 검색** (현재는 초성 인덱스바만)
- 신고 접수 **테이블화** — 현재 Discord 웹훅만. 신고량이 늘면
- 브라우저 열람 비중이 높은 공유 랜딩 페이지에 **문서 스크롤 모드** 검토 — 현재 앱 셸 구조라 iOS Safari 툴바가 접히지 않는다. 상세: [viewport-layout-improvement-plan.md](viewport-layout-improvement-plan.md) 3절

## 배포 대기

- [ ] staging 인수테스트 후 **prod release(태그) 발행** — 순서는 **Api 먼저 → web**
- [ ] 실기기 확인(뷰포트 개편분): iOS Safari 하단 툴바 뒤 흰 띠 소멸, 회전·키보드, **앱 WebView 회귀**(`viewport-fit=cover` 영향)

## 완료

| 날짜 | 내용 | PR |
|---|---|---|
| 2026-07-27 | 공지 DB 전환 + 앱 전역 노출, 죽은 공지 컴포넌트 3개 제거 | #469 |
| 2026-07-27 | 말씀카드 안내 시트 + 소진 문구 정합화, 카드 변경 UX | #468 |
| 2026-07-27 | 히스토리 드로워: 공유 버튼 그룹, 면별 액션 분기 | #466, #467 |
| 2026-07-27 | 뷰포트 `dvh` 전환 + safe-area, `max-w-app` 토큰화 | #464, #465 |
| 2026-07-27 | 카카오 공유 보상 UX (serverCallbackArgs, 보상 반영) | #463 |
| 2026-07-26 | QT 페이지 개선 (헤더 통일, 구절 픽커, 범위 선택) | #461, #462 |
| 2026-07-26 | Toast UI/UX 개편 (위로 스와이프, 상단 중앙 필) | #460 |
| 2026-07-25 | 말씀카드 재생성/교체 + 일일 한도 표시 | #457~459 |
