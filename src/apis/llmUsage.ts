import { supabase } from "./../../supabase/client";
import { getISOTodayDateYMD } from "@/lib/utils";
import * as Sentry from "@sentry/react";

// KST 기준 오늘 LLM 호출 횟수 — RLS로 본인 로그만 조회됨.
// 표시용이며 실제 한도 강제는 edge function이 담당 (실패 시 null → 표시 생략)
export const fetchTodayLlmUsage = async (
  feature: "bible_card" | "qt",
): Promise<number | null> => {
  try {
    const { year, month, day } = getISOTodayDateYMD();
    const kstDayStartISO = `${year}-${month}-${day}T00:00:00+09:00`;
    const { count, error } = await supabase
      .from("llm_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("feature", feature)
      .gte("created_at", kstDayStartISO);
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
