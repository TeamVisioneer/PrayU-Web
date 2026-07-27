# 공지사항 목록 페이지 계획

## 배경

메뉴의 **공지사항**이 카카오톡 채널 게시글(`https://pf.kakao.com/_XaHDG/posts`)을 외부 링크 다이얼로그로 열고 있다
([GroupMenuBtn.tsx:130](../src/components/group/GroupMenuBtn.tsx#L130)). 이제 앱 안에 공지(`notice` 테이블)가 있으므로,
카카오 채널을 걷어내고 **앱 내 공지 목록**으로 대체한다.

이미 있는 것을 재사용하면 새로 만들 것이 적다:
- 공지 데이터·조회 계층 (`apis/notice.ts`)
- 공지 표시부 (`NoticeContent` — 이미지 캐러셀 + 본문 + CTA)
- **특정 공지를 여는 경로** (`baseStore.openNoticeId` → `NoticeDialog`가 소비) — 알림함에서 쓰는 것과 동일

즉 **상세 화면을 새로 만들 필요가 없다.** 목록에서 항목을 누르면 기존 공지 모달이 그대로 열린다.

## 노출 범위

| 상태 | 목록 노출 | 이유 |
|---|---|---|
| 활성 + 시작됨 | ✅ | 현재 공지 |
| 활성 + 종료일 지남 | ✅ | 게시판이므로 지난 공지도 볼 수 있어야 한다 |
| 활성 + 시작 전(예약) | ❌ | 아직 공개 전 |
| 비활성(중지) | ❌ | 어드민이 내린 공지 |

정렬은 `starts_at` 최신순.

## 파일 매니페스트

| 파일 | 변경 |
|---|---|
| `src/apis/notice.ts` | `fetchPublicNoticeList()` 추가 — `is_active=true` and `starts_at <= now`, `starts_at desc` 정렬 |
| `src/pages/NoticePage.tsx` **(신규)** | 공지 목록 화면. 공통 sticky 헤더(뒤로가기 + "공지사항") + 목록 카드(제목·날짜). 항목 탭 → `setOpenNoticeId(id)` |
| `src/App.tsx` | `/notice` 라우트 추가 (`SlideInPage`로 감싸 다른 하위 페이지와 전환 방식 통일) |
| `src/components/group/GroupMenuBtn.tsx` | `onClickOpenNotice`가 외부 링크 대신 `navigate("/notice")`. analytics `클릭_카카오_소식` → `클릭_공지사항` |
| `src/components/notice/NoticeDialog.tsx` | 목록·알림함에서 **직접 골라 연 공지**에는 "다음에 보지 않기"를 숨긴다 (자동 노출에만 의미 있는 액션) |

## 검증

- 메뉴 → 공지사항 → 목록 → 항목 탭 → 모달, 뒤로가기 복귀
- 예약·중지 공지가 목록에 없는지, 종료된 공지는 보이는지 (로컬 시드 4종)
- 목록에서 연 모달에는 "다음에 보지 않기"가 없고 "닫기"만 있는지
- 공지가 하나도 없을 때 빈 상태 문구
- `npm run lint` + `npm run build`

## 확정 사항 (2026-07-27)

1. 지난(종료된) 공지도 목록에 **보인다** — 위 표대로
2. 목록 카드는 **제목·날짜만** — 본문 요약은 넣지 않는다
