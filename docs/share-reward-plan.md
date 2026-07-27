# 카카오톡 공유 보상 — 말씀카드 생성 카운트 지급 기획

작성: 2026-07 / 상태: **확정 — 구현 대기** (2026-07-27 지급 규칙·운영 환경 확정)
선행: 말씀카드 일일 한도(기본 3회, `llm_usage_log` 기반) 운영 중

## 목표

공유(카카오톡)를 통해 말씀카드가 밖으로 퍼지도록 유도하고, 그 보상으로 **당일 말씀카드 생성 카운트를 추가 지급**한다.
공유 "성공"의 판정은 클라이언트 클릭이 아니라 **카카오 서버가 보내주는 웹훅**으로 한다 (클릭만 하고 취소하는 경우 배제).

## 1. 리서치 결과

### 1-1. 카카오톡 공유 웹훅 (공식 지원 — 제안하신 callback 방식 그대로 실현 가능)

- **등록**: 카카오 디벨로퍼스 앱 관리 페이지 → [앱] > [웹훅] > **카카오톡 공유 웹훅**에 URL 등록
- **발송 조건**: SDK 공유 호출 시 **`serverCallbackArgs`(사용자 정의 파라미터)를 반드시 전달해야** 웹훅이 발송됨. 없으면 웹훅 미발송 (기존 우리 공유 코드는 미사용 → 현재는 웹훅이 올 수 없는 상태)
- **요청 형식**: GET(쿼리) 또는 POST(JSON). 시스템 파라미터 `CHAT_TYPE`(MemoChat/DirectChat/MultiChat/OpenChat), `HASH_CHAT_ID`(채팅방 식별 해시, 서비스별 유일), `TEMPLATE_ID`(템플릿 사용 시) + 우리가 넣은 커스텀 파라미터
- **검증 헤더** (위조 방지):
  - `Authorization: KakaoAK ${대표 어드민 키}` ← **우리가 아는 어드민 키와 대조해 진위 확인** (이미 함수 시크릿에 `KAKAO_ADMIN_KEY` 보유)
  - `X-Kakao-Resource-ID: ${웹훅 고유 ID}`, `User-Agent: KakaoOpenAPI/1.0`
- **응답 요건**: **3초 내 2XX** — 웹훅 처리 로직은 가볍게 유지해야 함
- SDK 전달 방법: `Kakao.Share.sendDefault({ ..., serverCallbackArgs: { key: "value" } })` (예약어 CHAT_TYPE/HASH_CHAT_ID/TEMPLATE_ID는 키로 사용 불가)

### 1-2. PC 환경 공유 — "안 되는 게 아니라 동작 방식이 바뀜"

- 공식 문서에 PC/모바일 지원 표는 명시돼 있지 않으나, 데브톡 사례 다수에서 **PC 웹은 "친구 목록 웹 피커 팝업" 방식으로 정상 동작** (카카오계정 로그인 전제)
- 역사: **SDK v1(Kakao.Link) 시절 PC는 QR 코드 팝업**을 띄웠고("이전엔 됐던" 기억은 이것일 가능성), **v2(Kakao.Share, 현재 우리 2.7.2)** 부터 카카오계정 로그인 기반 웹 피커로 변경됨
- 우리 코드(`KakaoShareBtn`)에는 PC 분기가 없어 PC에서도 `sendDefault`가 호출됨
- **실측 에러 확인 (2026-07-27)**: PC 공유 시 **에러 코드 4017 = "카카오 계정 인증 실패" (HTTP 401)**
  - 원인: v2 피커는 카카오계정 로그인 세션 기반 — 세션 만료·서드파티 쿠키 차단·트래킹 방지 설정 등에서 인증 실패
  - 공식 가이드 대응: 재시도/재로그인, 시크릿 모드 확인, 브라우저 확장(쿠키 차단류) 비활성
  - 결론: **SDK 버전 업으로 "막힌" 것이 아니라, v1의 QR 방식 → v2의 계정 로그인 피커로 바뀌면서 인증 의존성이 생긴 것**. 서비스 코드 결함 아님
  - 개선 여지(선택): `sendDefault`를 try-catch로 감싸 4017 등 실패 시 "카카오 로그인 후 다시 시도해 주세요" toast 안내

## 2. 아키텍처 설계 (제안)

```
[웹] 공유 버튼 클릭
  └ Kakao.Share.sendDefault({ ..., serverCallbackArgs: { user_id, feature: "bible_card" } })
      └ (사용자가 실제로 공유 완료)
          └ [카카오 서버] → POST https://…/functions/v1/kakao-webhook
                └ ① KakaoAK 헤더 검증 ② 지급 규칙 검사 ③ share_reward_log 기록 → 2XX (3초 내)
[웹] 공유 후 사용량 재조회 → "생성 횟수 +1" 반영/토스트
[생성 시] functions/bible: limit = 기본 3 + min(오늘 보상 수, 보상 상한) → used와 비교
```

### 2-1. 신규 edge function `kakao-webhook`

- **독립 함수로 신설** (기존 `authMiddleware`와 인증 체계가 다름 — KakaoAK 헤더 검증 전용)
- Controller: `Authorization === "KakaoAK " + env(KAKAO_ADMIN_KEY)` 불일치 시 401, GET/POST 양쪽 파싱
- Service: 지급 규칙(아래) 통과 시 `share_reward_log` insert — 로직 최소화(3초 응답 요건)
- 게이트웨이 verify_jwt: 카카오는 JWT를 보내지 않으므로 **이 함수만 `verify_jwt = false`** 필요 (config.toml 명시 + 함수 내 KakaoAK 검증이 유일한 방어선임을 주석으로)

### 2-2. 보상 저장 — 신규 테이블 `share_reward_log`

```sql
create table share_reward_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id),
  feature       text not null,          -- 'bible_card' (확장 대비)
  chat_type     text,                   -- MemoChat/DirectChat/…
  hash_chat_id  text,                   -- 같은 방 중복 공유 판별
  created_at    timestamptz not null default now()
);
-- RLS: 본인 select만 (남은 횟수 표시용), 쓰기는 webhook 함수(service role) 전용
```

### 2-3. 지급 규칙 (2026-07-27 확정)

- 공유 성공 1회 = **+1 생성권** (당일 한정, 이월 없음)
- **일일 보상 상한 없음** — 방어는 아래 두 규칙으로 충분: 인정되는 공유마다 서로 다른 실제 채팅방 노출이므로 보상 자체가 목적(바이럴)에 부합
- **같은 채팅방(`HASH_CHAT_ID`) 반복 공유는 1일 1회만 인정**
- **`CHAT_TYPE=MemoChat`(나와의 채팅) 미인정** — 자기 자신에게 보내기 반복 방지
- user_id 위조 리스크: serverCallbackArgs는 클라이언트가 구성하지만, 웹훅 발송 주체는 카카오뿐(KakaoAK 검증)이고 타인 id 기입은 타인에게 이득 — 실익 없음

### 2-4. 한도 계산 변경 (`functions/bible` bibleService)

```
rewards = countToday(share_reward_log, user, 'bible_card')   -- KST
limit   = BASE_LIMIT(3) + rewards                            -- 보상 상한 없음
used >= limit → 429 (기존과 동일 응답에 limit만 동적)
```

### 2-5. 웹 변경

- `UserBibleCardLink` 공유(말씀카드 공유 버튼)에만 `serverCallbackArgs: { user_id, feature: "bible_card" }` 추가 — `KakaoShareButton`에 선택적 prop
- 남은 횟수 표시: `fetchTodayLlmUsage` + 보상 수 조회 → `remaining = 3 + min(rewards,2) - used`
- 공유 직후 UX: 웹훅 도착이 비동기(수 초)이므로 공유 후 몇 초 뒤/포커스 복귀 시 재조회 → 증가하면 toast "말씀카드 생성 횟수가 +1 되었어요"
- 소진 상태 CTA: "공유하고 1회 더 만들기" 안내 (한도 소진 화면에서 공유 유도 — 기획 핵심 연결 고리)

## 3. 파일 매니페스트

### PrayU-Api — PR 1 (선행)

| # | 파일 | 상태 | 변경 내용 |
|---|---|---|---|
| A1 | `supabase/migrations/xxx_add_share_reward_log.sql` | 신규 | 2-2장 DDL 그대로 + 인덱스 `(user_id, feature, created_at desc)`(한도 계산용), `(user_id, hash_chat_id, created_at desc)`(동일방 중복 검사용). RLS: authenticated 본인 select만, 쓰기 정책 없음(service role 전용) |
| A2 | `supabase/functions/_shared/kst.ts` | 신규 | `kstDayStartISO(): string` — KST 오늘 0시 UTC ISO. `LlmUsageRepository`의 private 헬퍼를 공용으로 승격 (두 저장소가 공유) |
| A3 | `supabase/functions/_shared/llmUsageRepository.ts` | 수정 | private `kstDayStartISO` 제거 → A2 import로 교체 (동작 불변) |
| A4 | `supabase/functions/_shared/shareRewardRepository.ts` | 신규 | `countToday(userId, feature)` — 한도 계산용 / `existsTodayInRoom(userId, hashChatId)` — 동일방 당일 중복 검사 / `insert(userId, feature, chatType, hashChatId)` — 지급 기록. `_shared`인 이유: kakao-webhook(쓰기)과 bible(읽기) 두 함수가 사용 |
| A5 | `supabase/functions/kakao-webhook/index.ts` | 신규 | Hono 앱 + `POST·GET /kakao-webhook` 라우트. **authMiddleware 미사용** (KakaoAK 전용 검증) |
| A6 | `supabase/functions/kakao-webhook/kakaoWebhookController.ts` | 신규 | ① `Authorization === "KakaoAK " + env(KAKAO_ADMIN_KEY)` 불일치 시 401 ② GET 쿼리/POST JSON 양쪽 파싱 (`CHAT_TYPE`, `HASH_CHAT_ID`, `user_id`, `feature`) ③ 서비스 호출 후 무조건 200 `{granted}` (3초 요건 — 지급 실패도 200, 로그만) ④ `X-Kakao-Resource-ID` 로깅 |
| A7 | `supabase/functions/kakao-webhook/shareRewardService.ts` | 신규 | 지급 규칙의 집: feature 화이트리스트(`bible_card`) → `CHAT_TYPE === "MemoChat"` 거부 → `HASH_CHAT_ID`/`user_id` 필수 검증 → 동일방 당일 중복이면 거부 → insert. 반환 `{granted: boolean, reason?: string}` |
| A8 | `supabase/functions/bible/bibleService.ts` | 수정 | `searchBible` 한도 판정부만: `rewards = shareRewardRepository.countToday(userId, "bible_card")` 추가, `DAILY_LIMIT` → `DAILY_LIMIT + rewards`로 비교·에러 생성 (2-4장). 나머지 불변 |
| A9 | `supabase/config.toml` | 수정 | `[functions.kakao-webhook] verify_jwt = false` + "카카오 서버는 JWT 미소지, KakaoAK 헤더 검증이 유일한 방어선" 주석 |
| A10 | `supabase/functions/_types/database.ts` | 재생성 | `npm run supabase-sync` 산출물 (`share_reward_log` 타입) |

### PrayU-web — PR 2 (짝 PR, Api staging 반영 후)

| # | 파일 | 상태 | 변경 내용 |
|---|---|---|---|
| W1 | `src/hooks/useShareActions.ts` | 수정 | (구현 시 정정: 말씀카드 카카오 공유의 실경로는 이 훅) `kakaoServerCallbackArgs` prop 추가 → `sendDefault({ ...linkObject, serverCallbackArgs })`. 기존 catch의 실패 toast를 "공유에 실패했어요. 카카오 로그인 상태를 확인해 주세요"로 강화 (PC 4017 안내). `KakaoShareBtn.tsx`는 비보상 공유 경로라 이번 범위에서 무변경 |
| W2 | `src/components/share/ShareButtonGroup.tsx` | 수정 | `kakaoServerCallbackArgs` prop pass-through (useShareActions로 전달) |
| W3 | `src/apis/llmUsage.ts` | 수정 | `fetchTodayShareReward(feature): Promise<number \| null>` 추가 — `share_reward_log` KST 당일 count (RLS 본인). 실패 시 null(표시 생략) |
| W4 | `src/pages/BibleCardPage/BibleCardNewPage.tsx` | 수정 | ① `todayRewardCount` 상태 추가, `remainingCount = 3 + rewards - used` ② 공유 버튼에 `kakaoServerCallbackArgs={{ user_id, feature: "bible_card" }}` ③ 창 포커스 복귀(visibilitychange) 시 사용량·보상 재조회, 증가 감지 시 toast "공유 보상으로 생성 횟수가 +1 되었어요" ④ 소진 상태 캡션을 "카카오톡 공유하면 1회 더 만들 수 있어요"로 교체 (공유 유도 CTA) |
| W5 | `supabase/types/database.ts` | 재생성 | 로컬 sync 산출물 |
| W6 | `docs/share-reward-plan.md` | 동봉 | 본 문서 (PR 1에 사본 아닌 web PR에 포함) |

- 전역 store 추가 없음, 신규 라이브러리 없음
- 삭제 파일 없음

## 4. 운영 설정 (사람 작업)

- **카카오 앱은 staging/prod 분리 (2026-07-27 확인)** → 웹훅 URL을 환경별로 각각 등록:
  - staging 앱 → `https://cguxpeghdqcqfdhvkmyv.supabase.co/functions/v1/kakao-webhook`
  - prod 앱 → `https://qggewtakkrwcclyxtxnz.supabase.co/functions/v1/kakao-webhook`
- 각 함수 시크릿의 `KAKAO_ADMIN_KEY`가 해당 환경 카카오 앱의 어드민 키인지 확인 (검증 대조 키)
- 등록 후 운영 설정 대장(`supabase-migration-plan.md`)에 기록

## 5. 검증 계획

- 로컬: 카카오가 로컬로 웹훅을 쏠 수 없으므로 **curl로 KakaoAK 헤더 포함 모사 요청** → 검증/지급/상한/중복방 거절 확인, 잘못된 키 401
- 한도 연동: 보상 2건 insert 후 생성 5회째 성공·6회째 429
- staging/실공유: 웹훅 URL 등록 후 실제 카카오톡 공유 → 로그 적재 확인 (4장 환경 확인 결과에 따라)
- PC 재현 확인(1-2 확인 항목)과 팝업 차단 대응 문구 검토

## 6. 확정 사항 (2026-07-27)

- [x] 보상: 공유 1회 = +1, **일일 보상 상한 없음**
- [x] MemoChat(나와의 채팅): **미인정**
- [x] 동일 채팅방 반복 공유: **1일 1회만 인정**
- [x] 카카오 앱 staging/prod 분리 → 웹훅 URL 환경별 등록
- [ ] 보상 대상 공유 범위: 말씀카드 공유만(기본안) vs 전체 공유 — 미확정 시 기본안 적용
- [ ] QT 확장 여부 (기본안: 1차는 말씀카드만)
- [ ] 소진 화면 공유 유도 CTA 문구
