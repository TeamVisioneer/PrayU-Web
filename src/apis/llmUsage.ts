import { supabase } from "./../../supabase/client";
import { getISOTodayDateYMD } from "@/lib/utils";
import * as Sentry from "@sentry/react";

const kstDayStartISO = () => {
  const { year, month, day } = getISOTodayDateYMD();
  return `${year}-${month}-${day}T00:00:00+09:00`;
};

// KST 기준 오늘 LLM 호출 횟수.
// 표시용이며 실제 한도 강제는 edge function이 담당 (실패 시 null → 표시 생략)
// user_id 필터는 필수다 — 로그 읽기가 열려 있어 빼면 전체 사용자 집계가 잡힌다
export const fetchTodayLlmUsage = async (
  userId: string,
  feature: "bible_card" | "qt",
): Promise<number | null> => {
  try {
    const { count, error } = await supabase
      .from("llm_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("feature", feature)
      .gte("created_at", kstDayStartISO());
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return count ?? 0;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

// KST 기준 오늘 공유 보상 수 — 생성 한도는 서버에서 (기본 + 보상)으로 계산되며 여기는 표시용
export const fetchTodayShareReward = async (
  userId: string,
  feature: "bible_card",
): Promise<number | null> => {
  try {
    const { count, error } = await supabase
      .from("share_reward_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("feature", feature)
      .gte("created_at", kstDayStartISO());
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return count ?? 0;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
