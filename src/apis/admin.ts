import { supabase } from "./../../supabase/client";
import * as Sentry from "@sentry/react";
import { LLM_PRICE_PER_1K_TOKENS } from "@/constants/llmPricing";

/**
 * 어드민 대시보드 집계.
 *
 * 집계 로직은 전부 여기(앱)에 있다 — DB 함수(RPC)로 내려보내지 않는다.
 * 원본 행을 과하게 끌어오지 않기 위한 규칙:
 *  - 단순 개수는 head:true 카운트 (행 전송 0)
 *  - 추이는 created_at 한 컬럼만 가져와 KST 기준으로 앱에서 나눈다
 *  - 그룹별 수치는 임베디드 count로 N+1을 피한다
 *
 * 주의: 지금은 대상 테이블의 SELECT 정책이 모두 열려 있어 클라이언트에서 집계가 가능하다.
 * RLS 전면 정비(security-backlog 1번)로 그룹 격리가 들어가면 이 파일의 조회가 깨진다 —
 * 그때 관리자 select 정책 추가 또는 서버 경유로 전환한다. (docs/backlog.md 참조)
 */

/**
 * 프리미엄 만료일 설정/해제 (`null` = 해제).
 *
 * `profiles.premium_expired_at` 은 **컬럼 권한이 회수되어** 클라이언트가 직접 쓸 수 없다 —
 * 로그인만 하면 자기 행에 만료일을 넣어 프리미엄을 공짜로 얻을 수 있었기 때문이다
 * (PrayU-Api/docs/plans/premium-guard.md). 이 엔드포인트가 유일한 쓰기 경로이고,
 * 관리자 여부는 서버가 `profiles.is_admin` 을 읽어 판단한다.
 */
export const setPremiumExpiry = async (
  userId: string,
  premiumExpiredAt: string | null,
): Promise<boolean> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/api/admin/premium`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId, premiumExpiredAt }),
      },
    );

    const { error } = await response.json();
    if (error) {
      Sentry.captureException(
        `프리미엄 설정 실패 (${response.status}): ${error}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 타임스탬프를 KST 기준 YYYY-MM-DD로 (일별 버킷 키) */
export const toKstDateKey = (iso: string): string =>
  new Date(new Date(iso).getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

/** 오늘로부터 n일 전 0시(KST)의 ISO — 기간 조회 시작점 */
export const kstDaysAgoISO = (days: number): string => {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const startMs =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate() - days,
    ) - KST_OFFSET_MS;
  return new Date(startMs).toISOString();
};

/** from~to 사이의 KST 날짜 키 목록 (빈 날도 0으로 채우기 위해) */
const kstDateKeysBetween = (fromISO: string, toISO: string): string[] => {
  const keys: string[] = [];
  const start = new Date(new Date(fromISO).getTime() + KST_OFFSET_MS);
  const end = new Date(new Date(toISO).getTime() + KST_OFFSET_MS);
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  while (cursor.getTime() < end.getTime()) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
};

type CountableTable =
  | "profiles"
  | "group"
  | "member"
  | "pray"
  | "pray_card"
  | "bible_card"
  | "qt_data";

const countCreated = async (
  table: CountableTable,
  from?: string,
  to?: string,
): Promise<number> => {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lt("created_at", to);
  const { count, error } = await query;
  if (error) throw new Error(`${table} count 실패: ${error.message}`);
  return count ?? 0;
};

const fetchCreatedAts = async (
  table: CountableTable,
  from: string,
  to: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from(table)
    .select("created_at")
    .gte("created_at", from)
    .lt("created_at", to);
  if (error) throw new Error(`${table} 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => row.created_at);
};

export interface KpiSummary {
  totalUsers: number;
  todayNewUsers: number; // 오늘(KST) 가입
  todayNewGroups: number; // 오늘(KST) 개설
  newUsers: number;
  prevNewUsers: number;
  totalGroups: number;
  newGroups: number;
  prevNewGroups: number;
  prayCount: number;
  prayCardCount: number;
  activeUsers: number; // 기간 내 기도 1회 이상
  dau: number;
  wau: number;
}

export const fetchKpiSummary = async (
  days: number,
): Promise<KpiSummary | null> => {
  try {
    const now = new Date().toISOString();
    const from = kstDaysAgoISO(days);
    const prevFrom = kstDaysAgoISO(days * 2);
    const todayStart = kstDaysAgoISO(0);

    const [
      totalUsers,
      todayNewUsers,
      todayNewGroups,
      newUsers,
      prevNewUsers,
      totalGroups,
      newGroups,
      prevNewGroups,
      prayCount,
      prayCardCount,
      periodPrayUsers,
      dauUsers,
      wauUsers,
    ] = await Promise.all([
      countCreated("profiles"),
      countCreated("profiles", todayStart, now),
      countCreated("group", todayStart, now),
      countCreated("profiles", from, now),
      countCreated("profiles", prevFrom, from),
      countCreated("group"),
      countCreated("group", from, now),
      countCreated("group", prevFrom, from),
      countCreated("pray", from, now),
      countCreated("pray_card", from, now),
      fetchPrayUserIds(from, now),
      fetchPrayUserIds(kstDaysAgoISO(1), now),
      fetchPrayUserIds(kstDaysAgoISO(7), now),
    ]);

    return {
      totalUsers,
      todayNewUsers,
      todayNewGroups,
      newUsers,
      prevNewUsers,
      totalGroups,
      newGroups,
      prevNewGroups,
      prayCount,
      prayCardCount,
      activeUsers: new Set(periodPrayUsers).size,
      dau: new Set(dauUsers).size,
      wau: new Set(wauUsers).size,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

const fetchPrayUserIds = async (
  from: string,
  to: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("pray")
    .select("user_id")
    .gte("created_at", from)
    .lt("created_at", to);
  if (error) throw new Error(`pray user 조회 실패: ${error.message}`);
  return (data ?? [])
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));
};

export interface DailyPoint {
  date: string;
  newUsers: number;
  newGroups: number;
  prays: number;
  prayCards: number;
}

export const fetchDailySeries = async (
  days: number,
): Promise<DailyPoint[] | null> => {
  try {
    const now = new Date().toISOString();
    const from = kstDaysAgoISO(days);

    const [users, groups, prays, prayCards] = await Promise.all([
      fetchCreatedAts("profiles", from, now),
      fetchCreatedAts("group", from, now),
      fetchCreatedAts("pray", from, now),
      fetchCreatedAts("pray_card", from, now),
    ]);

    const buckets = new Map<string, DailyPoint>();
    for (const date of kstDateKeysBetween(from, now)) {
      buckets.set(date, {
        date,
        newUsers: 0,
        newGroups: 0,
        prays: 0,
        prayCards: 0,
      });
    }

    const tally = (rows: string[], key: keyof Omit<DailyPoint, "date">) => {
      for (const iso of rows) {
        const bucket = buckets.get(toKstDateKey(iso));
        if (bucket) bucket[key] += 1;
      }
    };
    tally(users, "newUsers");
    tally(groups, "newGroups");
    tally(prays, "prays");
    tally(prayCards, "prayCards");

    return Array.from(buckets.values());
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export interface ActivationFunnel {
  signedUp: number;
  joinedGroup: number;
  wrotePrayCard: number;
  prayed: number;
}

/** 기간 내 가입자가 각 단계까지 도달한 인원 — 어디서 이탈하는지 보기 위함 */
export const fetchActivationFunnel = async (
  days: number,
): Promise<ActivationFunnel | null> => {
  try {
    const now = new Date().toISOString();
    const from = kstDaysAgoISO(days);

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .gte("created_at", from)
      .lt("created_at", now);
    if (error) throw new Error(`가입자 조회 실패: ${error.message}`);

    const signupIds = (data ?? []).map((row) => row.id);
    if (signupIds.length === 0) {
      return { signedUp: 0, joinedGroup: 0, wrotePrayCard: 0, prayed: 0 };
    }

    const [joined, wrote, prayed] = await Promise.all([
      countDistinctUsers("member", signupIds),
      countDistinctUsers("pray_card", signupIds),
      countDistinctUsers("pray", signupIds),
    ]);

    return {
      signedUp: signupIds.length,
      joinedGroup: joined,
      wrotePrayCard: wrote,
      prayed,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

// .in() 필터는 URL 길이 제한이 있어 나눠 보낸다
const IN_CHUNK_SIZE = 300;

const countDistinctUsers = async (
  table: "member" | "pray_card" | "pray",
  userIds: string[],
): Promise<number> => {
  const reached = new Set<string>();
  for (let i = 0; i < userIds.length; i += IN_CHUNK_SIZE) {
    const chunk = userIds.slice(i, i + IN_CHUNK_SIZE);
    const { data, error } = await supabase
      .from(table)
      .select("user_id")
      .in("user_id", chunk);
    if (error) throw new Error(`${table} 도달 조회 실패: ${error.message}`);
    for (const row of data ?? []) {
      if (row.user_id) reached.add(row.user_id);
    }
  }
  return reached.size;
};

export interface GroupStat {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  prayCardCount: number;
  isDormant: boolean; // 최근 14일 기도카드 0
}

export const fetchGroupStats = async (
  limit = 100,
): Promise<GroupStat[] | null> => {
  try {
    const { data, error } = await supabase
      .from("group")
      .select("id, name, created_at, member(count), pray_card(count)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`그룹 조회 실패: ${error.message}`);

    const { data: recent, error: recentError } = await supabase
      .from("pray_card")
      .select("group_id")
      .gte("created_at", kstDaysAgoISO(14));
    if (recentError) {
      throw new Error(`최근 활동 조회 실패: ${recentError.message}`);
    }
    const activeGroupIds = new Set(
      (recent ?? []).map((row) => row.group_id).filter(Boolean),
    );

    type EmbeddedCount = { count: number }[] | null;
    return (data ?? []).map((row) => {
      const members = row.member as unknown as EmbeddedCount;
      const cards = row.pray_card as unknown as EmbeddedCount;
      return {
        id: row.id,
        name: row.name || "(이름 없음)",
        createdAt: row.created_at,
        memberCount: members?.[0]?.count ?? 0,
        prayCardCount: cards?.[0]?.count ?? 0,
        isDormant: !activeGroupIds.has(row.id),
      };
    });
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export interface FeatureUsage {
  llmByFeature: Array<{
    feature: string;
    calls: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
  }>;
  llmDaily: Array<{ date: string; calls: number; costUsd: number }>;
  shareRewardCount: number;
  shareRewardUsers: number;
  bibleCardCount: number;
  qtCount: number;
  notificationSent: number;
  notificationChecked: number;
}

export const fetchFeatureUsage = async (
  days: number,
): Promise<FeatureUsage | null> => {
  try {
    const now = new Date().toISOString();
    const from = kstDaysAgoISO(days);

    const [llmResult, rewardResult, bibleCardCount, qtCount, notifications] =
      await Promise.all([
        supabase
          .from("llm_usage_log")
          .select("feature, model, prompt_tokens, completion_tokens, created_at")
          .gte("created_at", from)
          .lt("created_at", now),
        supabase
          .from("share_reward_log")
          .select("user_id, created_at")
          .gte("created_at", from)
          .lt("created_at", now),
        countCreated("bible_card", from, now),
        countCreated("qt_data", from, now),
        fetchNotificationStats(from, now),
      ]);

    if (llmResult.error) {
      throw new Error(`LLM 로그 조회 실패: ${llmResult.error.message}`);
    }
    if (rewardResult.error) {
      throw new Error(`공유 보상 조회 실패: ${rewardResult.error.message}`);
    }

    const rows = llmResult.data ?? [];
    const byFeature = new Map<string, FeatureUsage["llmByFeature"][number]>();
    const byDay = new Map<string, { date: string; calls: number; costUsd: number }>();
    for (const date of kstDateKeysBetween(from, now)) {
      byDay.set(date, { date, calls: 0, costUsd: 0 });
    }

    for (const row of rows) {
      const prompt = row.prompt_tokens ?? 0;
      const completion = row.completion_tokens ?? 0;
      const cost = estimateCostUsd(row.model, prompt, completion);

      const feature = byFeature.get(row.feature) ?? {
        feature: row.feature,
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCostUsd: 0,
      };
      feature.calls += 1;
      feature.promptTokens += prompt;
      feature.completionTokens += completion;
      feature.estimatedCostUsd += cost;
      byFeature.set(row.feature, feature);

      const day = byDay.get(toKstDateKey(row.created_at));
      if (day) {
        day.calls += 1;
        day.costUsd += cost;
      }
    }

    const rewards = rewardResult.data ?? [];
    return {
      llmByFeature: Array.from(byFeature.values()),
      llmDaily: Array.from(byDay.values()),
      shareRewardCount: rewards.length,
      shareRewardUsers: new Set(rewards.map((row) => row.user_id)).size,
      bibleCardCount,
      qtCount,
      notificationSent: notifications.sent,
      notificationChecked: notifications.checked,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/** 토큰 단가는 코드 상수 — 단가가 바뀌면 배포가 필요하다 (constants/llmPricing.ts) */
const estimateCostUsd = (
  model: string | null,
  promptTokens: number,
  completionTokens: number,
): number => {
  const price = LLM_PRICE_PER_1K_TOKENS[model ?? ""] ??
    LLM_PRICE_PER_1K_TOKENS.default;
  return (
    (promptTokens / 1000) * price.prompt +
    (completionTokens / 1000) * price.completion
  );
};

const fetchNotificationStats = async (from: string, to: string) => {
  const [sentResult, checkedResult] = await Promise.all([
    supabase
      .from("notification")
      .select("id", { count: "exact", head: true })
      .gte("created_at", from)
      .lt("created_at", to),
    supabase
      .from("notification")
      .select("id", { count: "exact", head: true })
      .gte("created_at", from)
      .lt("created_at", to)
      .not("checked_at", "is", null),
  ]);

  if (sentResult.error) {
    throw new Error(`알림 조회 실패: ${sentResult.error.message}`);
  }
  if (checkedResult.error) {
    throw new Error(`알림 확인 조회 실패: ${checkedResult.error.message}`);
  }
  return {
    sent: sentResult.count ?? 0,
    checked: checkedResult.count ?? 0,
  };
};
