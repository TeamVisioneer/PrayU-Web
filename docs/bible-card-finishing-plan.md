# 말씀카드 피처링 마무리 계획

작성: 2026-07 / 상태: **설계 확정 — 구현 대기**
선행 문서: [bible-card-backside-flow-plan.md](./bible-card-backside-flow-plan.md) (v1 뒷면 플로우 — 구현 완료)

## 배경

말씀카드 개편 시리즈(#447 뒷면 플로우 → #448 렌더링 단일화 → #449 키워드·줄바꿈 → #451 색상·배리에이션 → #454 레거시 플립 페이지 제거)로 핵심 기능은 완성됐다.
이 문서는 피처링 마무리로 남은 세 갈래 — ① 재생성/교체 + LLM 사용량 통제, ② 프로필 진입점, ③ 잔재 정리 — 의 설계를 확정한다.

### 확정된 결정 (2026-07)

| 항목 | 결정 |
|---|---|
| 재생성/교체 | **허용**하되 개인별 일일 생성 한도로 통제 |
| 일일 한도 | **3회/일** (신규+교체 합산, KST 기준) |
| 사용량 기록 | 피처 전용 테이블이 아닌 **범용 `llm_usage_log` 테이블** — 토큰 수 포함, 향후 LLM 피처 공용 |
| 프로필 CTA | 기도카드 히스토리 drawer 내부 버튼 |
| 레거시 `bible_card_url` 이관 | 이관하지 않음 — 표시 호환(fallback)만 유지 |

### 설계 원칙

- 한도의 보호 대상은 **LLM 호출**(비용 발생 지점)이다. `bible_card` row 수를 세지 않는다 — 추천만 받고 저장 안 해도 비용은 발생.
- 집행은 **edge function에서 서버 사이드로 강제**. 클라이언트 검사는 UX(횟수 표시·버튼 비활성)일 뿐이다.
- **테이블은 공유 인프라, 정책은 피처별.** "bible_card 3회/일"은 `bibleService`에 산다. QT 등 다른 피처의 한도는 각자 서비스에서 정의한다. 만능 쿼터 엔진을 만들지 않는다.

---

## 1. `llm_usage_log` 테이블

```sql
-- PrayU-Api: supabase migration new add_llm_usage_log
create table llm_usage_log (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id),
  feature           text not null,        -- 'bible_card' | 'qt' | (신규 피처는 값만 추가)
  model             text,                 -- 'gpt-4o-mini' 등
  prompt_tokens     int,
  completion_tokens int,
  metadata          jsonb,                -- 피처별 컨텍스트. bible_card: {"pray_card_id": uuid|null}
  created_at        timestamptz not null default now()
);

create index idx_llm_usage_user_feature
  on llm_usage_log (user_id, feature, created_at desc);

alter table llm_usage_log enable row level security;

-- 클라이언트는 자기 로그 조회만 (남은 횟수 표시용)
create policy "select own llm usage" on llm_usage_log
  for select to authenticated using (auth.uid() = user_id);
-- insert/update 정책 없음: 쓰기는 edge function(service role, RLS 우회) 전용
```

- **기록 시점 2회**: LLM 호출 **전** insert(토큰 null — 실패·타임아웃 호출도 차감되어 재시도 폭탄 방지) → 응답 후 토큰 update. update 실패는 본 흐름을 막지 않는다(로그만).
- **metadata 규율**: 피처별 키를 이 문서(또는 마이그레이션 주석)에 명시하고 임의 키 추가 금지. 현재 정의: `bible_card` → `{"pray_card_id": uuid|null}`, `qt` → `{}` (2026-07 QT 한도 적용 시 추가).
- **동시성 허용 오차**: count 조회와 insert 사이 레이스로 동시 요청 시 한도를 1회 초과할 수 있다. 비용 통제 목적상 **수용**한다 (원자화하려면 DB 함수 필요 — 과잉).

## 2. 세부 구현 — PrayU-Api

### 2-0. 선행 이슈: 사용자 식별 (⚠️ 조사로 발견된 구조 문제)

현재 웹 `searchBible`은 **anon key만** Authorization에 실어 보낸다(`src/apis/bible.ts:66`). `authMiddleware`는 이를 `userId = "anon"`으로 통과시키므로, 지금 상태로는 **호출자가 누군지 몰라 개인별 쿼터가 성립하지 않는다.**

- 웹: 사용자 **세션 토큰**(`session.access_token`)을 보내도록 변경 (→ 3-1)
- 함수: `userId`가 `"anon"`이면 401 거부 (말씀카드 생성은 로그인 전제 기능이므로 정당)
- 참고: `authMiddleware`는 JWT를 서명 검증 없이 decode만 한다. 서명 검증은 Supabase 게이트웨이(verify_jwt)가 담당하므로 **bible 함수의 verify_jwt가 켜져 있는지 config.toml에서 확인**할 것 (꺼져 있으면 위조 JWT로 쿼터 우회 가능)

### 2-1. `_shared/ai/aiClient.ts` — 인터페이스 변경 (토큰 노출)

현재 `chat()`은 파싱된 content만 반환하고 `response.usage`를 버린다. 변경:

```ts
export interface AIUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface AIChatResult {
  content: Record<string, unknown>;
  usage: AIUsage | null;   // provider가 usage를 안 주는 경우 대비
}

export interface AIClient {
  chat(systemPrompt, userPrompt, responseSchema): Promise<AIChatResult>;
}
```

- `openaiClient.ts`: `return { content: parsedContent, usage: { model: this.model, promptTokens: response.usage?.prompt_tokens ?? 0, completionTokens: response.usage?.completion_tokens ?? 0 } }`
- **호출부 2곳 수정 필요**: `bible/bibleService.ts`, `openai/QuietTimeService.ts` — QT는 이번 범위에서 destructure(`.content`)만 적용하고 **로그 기록은 하지 않는다** (follow-up)

### 2-2. `_shared/llmUsageRepository.ts` (신규)

공용 인프라이므로 `_shared`에 둔다 (bible·openai 두 함수에서 재사용 예정).

```ts
import { supabase } from "../client.ts";  // service role — RLS 우회

export class LlmUsageRepository {
  /** KST 기준 오늘 0시를 UTC ISO로 반환 */
  private kstDayStartISO(): string { /* now +9h → 날짜 절삭 → -9h */ }

  async countToday(userId: string, feature: string): Promise<number> {
    // select count(*) where user_id, feature, created_at >= kstDayStartISO()
  }

  async insert(userId: string, feature: string, metadata: Record<string, unknown>): Promise<string> {
    // insert (tokens null) → 생성된 id 반환
  }

  async updateUsage(id: string, usage: AIUsage): Promise<void> {
    // model, prompt_tokens, completion_tokens 갱신
  }
}
```

### 2-3. `bible/bibleService.ts` — 정책이 사는 곳

```ts
const DAILY_LIMIT = Number(Deno.env.get("BIBLE_CARD_DAILY_LIMIT") ?? "3");

export class DailyLimitExceededError extends Error {
  constructor(public limit: number, public used: number) { super("DAILY_LIMIT_EXCEEDED"); }
}

// searchBible(userPrompt) → searchBible(userId, userPrompt, prayCardId?)
async searchBible(userId: string, userPrompt: string, prayCardId?: string) {
  const used = await this.llmUsage.countToday(userId, "bible_card");
  if (used >= DAILY_LIMIT) throw new DailyLimitExceededError(DAILY_LIMIT, used);

  const logId = await this.llmUsage.insert(userId, "bible_card", { pray_card_id: prayCardId ?? null });

  const { content, usage } = await this.aiClient.chat(systemPrompt, userPrompt, BibleSearchResponseSchema);
  if (usage) this.llmUsage.updateUsage(logId, usage).catch(console.error);  // 실패해도 본 흐름 유지

  // 이하 기존 로직 (구절 파싱 → bibleRepository.getBible 본문 조회)
}
```

- `DailyLimitExceededError`는 이 파일에 둔다 — 한도는 bible_card의 정책이므로 `_shared`로 올리지 않는다.

### 2-4. `bible/bibleController.ts` — HTTP 번역

```ts
async searchBible(c: Context) {
  const userId = c.get("userId");
  if (!userId || userId === "anon") {
    return this.createResponse({ data: null, error: "LOGIN_REQUIRED" }, 401);
  }
  const { query, prayCardId } = await c.req.json();
  try {
    const bibleResponse = await this.bibleService.searchBible(userId, query, prayCardId);
    // 기존 null 체크 → 200 응답 유지
  } catch (e) {
    if (e instanceof DailyLimitExceededError) {
      return this.createResponse(
        { data: null, error: "DAILY_LIMIT_EXCEEDED", limit: e.limit, used: e.used }, 429);
    }
    throw e;
  }
}
```

### 2-5. 환경변수

- `BIBLE_CARD_DAILY_LIMIT` (기본값 3, 코드에 fallback 있음) — staging/prod Supabase function secrets에 등록, **운영 설정 대장(`supabase-migration-plan.md`)에 기록**

## 3. 세부 구현 — PrayU-web

### 3-1. `src/apis/bible.ts` — `searchBible` 수정

```ts
export type SearchBibleResult = {
  bible: Bible[] | null;
  keywords: string[] | null;
  errorCode?: "DAILY_LIMIT_EXCEEDED" | "LOGIN_REQUIRED";
};

export const searchBible = async (query: string, prayCardId?: string): Promise<SearchBibleResult> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { bible: null, keywords: null, errorCode: "LOGIN_REQUIRED" };

  const response = await fetch(`${...}/functions/v1/bible`, {
    headers: { authorization: `Bearer ${session.access_token}`, ... },  // anon key → 세션 토큰
    body: JSON.stringify({ query, prayCardId }),
  });
  if (response.status === 429) return { bible: null, keywords: null, errorCode: "DAILY_LIMIT_EXCEEDED" };
  // 이하 기존 파싱 유지
};
```

### 3-2. `src/apis/bible.ts` — 사용량 조회 추가 (같은 도메인이므로 이 파일)

```ts
export const fetchTodayBibleCardUsage = async (): Promise<number | null> => {
  // supabase.from("llm_usage_log")
  //   .select("id", { count: "exact", head: true })
  //   .eq("feature", "bible_card")
  //   .gte("created_at", <KST 오늘 0시 ISO — src/lib/utils.ts KST 유틸 재사용>)
  // RLS가 내 행만 반환. 실패 시 null (표시 생략, 생성은 서버가 지키므로 안전)
};
```

### 3-3. `src/constants/bibleCard.ts`

```ts
// 표시용 상수. 실제 강제는 functions/bible(BIBLE_CARD_DAILY_LIMIT env)이 담당 — 서버가 진실
export const BIBLE_CARD_DAILY_LIMIT = 3;
```

### 3-4. `src/pages/BibleCardPage/BibleCardNewPage.tsx` — 가장 많이 바뀌는 파일

- **지역 상태** `todayUsedCount` (전역 store 추가 없음): mount 시 + 생성 성공 후 `fetchTodayBibleCardUsage()`로 갱신
- 생성 버튼 영역에 "오늘 남은 생성 N회" 표시, `remaining <= 0`이면 비활성
- `searchBible` 결과 `errorCode === "DAILY_LIMIT_EXCEEDED"` → toast "오늘 생성 가능 횟수를 모두 사용했어요. 내일 다시 만들 수 있어요" *(문구는 확정 필요)*
- **재생성/교체** (기존 차단 로직 L407–410 대체):
  - 이미 연결된 카드 선택 → 기존 말씀카드 뒷면 플립 표시 + "새로 만들기" CTA
  - CTA → 확인 다이얼로그(기존 alert/dialog 패턴 재사용): "오늘 N회 남음. 새 말씀카드로 교체할까요?"
  - 확인 → 기존 생성 플로우 그대로 실행 → 성공 시 기존 `updatePrayCard(prayCardId, { bible_card_id })` 로직(L484–487) 재사용해 새 id로 교체
  - **기존 bible_card row는 삭제하지 않는다** (히스토리 확장 여지 — v1에서 unique 안 건 이유)
  - 이미지 저장 실패 시 row 미생성·기존 연결 유지 (기존 방침 그대로)
- 선택 drawer: `연결됨` 라벨 유지하되 `disabled` 해제 (선택 가능으로)

### 3-5. `src/components/profile/PrayCardHistoryDrawer.tsx`

- `prayCard.bible_card` 없음 → "말씀카드 만들기" 버튼 → `/bible-card/new?praycard_id=<id>`
- 있음 → 기존 뒷면 표시 유지 (재생성 진입은 /bible-card/new 안에서)
- 레거시 `bible_card_url`만 있는 카드 → "만들기"로 취급 (새로 만들면 신규 체계로 자연 전환 — 이관 불필요의 근거)
- analytics: 기존 `클릭_말씀카드_페이지` 재사용 + `from: "profile_drawer"` 프로퍼티 *(이벤트 정의 변경 없음 — 신규 이벤트 필요 시 별도 확인)*

### 3-6. 잔재 정리 (같은 PR에 포함)

- `src/components/prayCard/BibleVerse.tsx` 삭제 (import 0건 고아)
- `src/App.tsx` L410 부근 도달 불가 analytics `case "/bible-card"` 제거
- 로컬 `feat-bible-card-v2` 브랜치 삭제
- (후순위·범위 제외) 어드민 `/bible-card/generator`의 구식 html2canvas → 통합 렌더러 전환

## 4. 구현 순서 (크로스 레포)

1. **PrayU-Api PR**: 마이그레이션 + `_shared`(aiClient·llmUsageRepository) + bible 함수 — `supabase db reset` 재생 확인, `npm run supabase-sync`(--local)
2. Api merge → staging 자동 반영 → staging에서 한도·429 동작 확인, env `BIBLE_CARD_DAILY_LIMIT` 등록
3. **PrayU-web PR** (짝 PR 링크): 타입 sync + 3장 전체
4. **prod 순서**: 새 테이블·함수에 의존하는 web PR은 **Api release(prod DB 반영) 이후 merge**
5. Api가 먼저 나가도 무해: 구버전 웹(anon key 호출)은 401을 받고 기존 실패 처리(저장 안 됨)로 흡수됨 — 단 **그 시점부터 구버전 웹에서 말씀카드 생성이 잠시 막히므로**, Api release와 web merge 간격을 짧게 가져갈 것

## 5. 검증 계획

- Api (로컬 스택 `./scripts/dev.sh`):
  - anon 토큰 호출 → 401 / 세션 토큰 → 정상
  - 3회 호출 후 4번째 → 429 + LLM 미호출(로그로 확인)
  - `llm_usage_log`에 토큰 수 기록 확인 (prayu-local-db MCP로 조회)
  - KST 자정 경계: `created_at`을 어제로 조작 insert 후 count 미포함 확인
  - config.toml에서 bible 함수 verify_jwt 활성 확인
- web: `npm run lint`(기존 경고 4개 외 0) + `npm run build`
- 수동 시나리오:
  - 신규 생성 → 남은 횟수 감소 표시 / 소진 → CTA 비활성 + toast + 서버 429
  - 연결된 카드 → 기존 카드 표시 → 새로 만들기 → 확인 → 교체 반영 (프로필 썸네일 갱신)
  - 교체 중 이미지 저장 실패 → 기존 연결 유지
  - 프로필 drawer CTA → praycard_id 프리셀렉트 진입
  - 레거시 `bible_card_url` 카드 표시 회귀 없음
  - QT(`/quiet-time`) 회귀 — aiClient 인터페이스 변경 영향 확인

## 6. 남은 확정 필요 항목

- [ ] 한도 소진 toast 문구 (기본안: "오늘 생성 가능 횟수를 모두 사용했어요. 내일 다시 만들 수 있어요")
- [ ] 소진 시 프리미엄 안내 연결 여부 (기본안: 이번 범위 제외)
- [ ] QT의 usage 로그 기록 (follow-up — 테이블·인터페이스는 이번에 준비됨)

## 7. v1 문서 대비 갱신 사항

- "독립 입력형 `/bible-card` 유지" → #454에서 제거·어드민 격리 (`/bible-card` → `/new` redirect)
- "DB 반영: GUI 추가, migration 추후" → baseline 마이그레이션으로 상환 완료
- v1 미확정 4건 → 본 문서 "확정된 결정" 표로 해소
