# 기도카드 재편 — 사용자 소유 + share 관계 (v1.1)

상위: [overview.md](overview.md) · 상태: **설계 초안** (2026-08-03 논의 산물, 착수 전 결정 1건 대기)

## 왜

지금 `pray_card` 는 그룹 종속이다(`group_id` 컬럼). 여러 그룹에 올리면 **그룹 수만큼 행이 복제**된다
(`bulkCreatePrayCard` 가 그룹당 1 insert). 같은 기도제목의 수정이 N번 필요하고, 말씀카드가 따로 붙고,
"내 기도제목의 역사"가 그룹별로 조각난다 — **기록이 원본이라는 정체성과 정면으로 어긋난다.**

## 목표 구조

```
pray_card (내 기록 — 사용자 소유)
  id, user_id, content, life, bible_card_id, ...     ← group_id 제거

pray_card_share (나눔 — 어디에 공유했나)
  id, pray_card_id, group_id, created_at, deleted_at
```

- **v1.1 가시성 모델의 뼈대 그 자체다.** 지금 share 대상은 그룹뿐이지만, 나중에 공개/팔로워가
  share 의 새 종류로 들어온다 ([feed.md](feed.md)·[profile-social.md](profile-social.md)의 기반)
- "이번 주 카드" 같은 주간 개념은 **share.created_at(공유 시점)** 에 건다 — 그룹별 의미 보존

## 🔴 강제되는 결정 — pray(기도 기록)의 격리

`pray` 는 `pray_card_id` 로만 붙는다. 카드가 그룹별 복제라서 기도가 **암묵적으로 그룹 격리**돼 있었다.
카드를 합치면: 청년부 멤버가 기도한 것이 가족방 화면(`PrayListDrawer` — 실명·아바타 노출)에도 보인다.
서로 모르는 두 공동체가 상대에게 노출된다. 하루 1회 기도 카운트 의미도 흔들린다.

**권고: `pray` 에 `group_id` 추가** — 기도 목록은 그룹별 유지, 카드 주인만 전체 합산 뷰.
닫힌 공간 의미를 보존하면서 주인에게 데일리 앱다운 통합 뷰를 준다.

- [ ] **결정 대기: 기도한 사람 목록의 그룹별 격리 유지 여부** (권고: 유지)

## 마이그레이션 전략 — 과거는 합치지 않는다

기존 N벌 복제의 병합은 내용·시각 유사도 추측이 필요해 위험하다. R2 때와 같은 원칙:

1. 기존 `pray_card` 행마다 (기록 1 + share 1) 로 **기계적 변환만** — 과거 화면 불변
2. `pray.group_id` 백필은 결정적 — 옛 카드의 `group_id` 를 물려받는다
3. **신규 작성부터** 1 기록 + N share
4. 과거 병합은 원하면 나중에 별도 배치

## 영향 범위 (착수 시 전수 확인)

쓰기: `NewPrayCardGroupSelectStep`(bulk) · `group/:id/praycard/new` · edit —
읽기: `fetchGroupPrayCardList` 등 group_id 조회 전부 · 히스토리 · 오늘의기도 · 반응 · `member.pray_summary` —
그리고 **RLS 정책 재작성과 한 덩어리로** 진행한다 ([security-backlog](../../security-backlog.md) 1번).
따로 하면 같은 정책을 두 번 쓴다.

이번 세션까지의 어떤 작업보다 크다 — **반드시 별도 계획서를 완성하고 파일 매니페스트 승인 후 착수.**
이 문서는 방향 합의 기록이다.
