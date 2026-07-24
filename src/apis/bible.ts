import { supabase } from "./../../supabase/client";
import { Bible } from "../../supabase/types/tables";
import { getISOTodayDateYMD } from "@/lib/utils";
import * as Sentry from "@sentry/react";

export const getBible = async (
  longLabel: string,
  chapter: number,
  paragraph: number,
): Promise<Bible | null> => {
  try {
    const { data, error } = await supabase
      .from("bible")
      .select("long_label, short_label, chapter, paragraph, sentence")
      .eq("long_label", longLabel)
      .eq("chapter", chapter)
      .eq("paragraph", paragraph)
      .single();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as Bible;
  } catch (error) {
    Sentry.captureException(error);

    return null;
  }
};

export const fetchBibleList = async (
  longLabel: string,
  chapter: number,
  startParagraph: number,
  endParagraph: number,
): Promise<Bible[] | null> => {
  try {
    const { data, error } = await supabase
      .from("bible")
      .select("long_label, short_label, chapter, paragraph, sentence")
      .eq("long_label", longLabel)
      .eq("chapter", chapter)
      .gte("paragraph", startParagraph)
      .lte("paragraph", endParagraph)
      .order("paragraph", { ascending: true });
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as Bible[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export type SearchBibleResult = {
  bible: Bible[] | null;
  keywords: string[] | null;
  errorCode?: "DAILY_LIMIT_EXCEEDED" | "LOGIN_REQUIRED";
};

export const searchBible = async (
  query: string,
  prayCardId?: string,
): Promise<SearchBibleResult> => {
  try {
    // 개인별 일일 한도가 걸린 엔드포인트 — 세션 토큰 필수 (anon key는 서버가 401로 거부)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { bible: null, keywords: null, errorCode: "LOGIN_REQUIRED" };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/bible`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query, prayCardId }),
      },
    );
    if (response.status === 429) {
      return { bible: null, keywords: null, errorCode: "DAILY_LIMIT_EXCEEDED" };
    }
    if (response.status === 401) {
      return { bible: null, keywords: null, errorCode: "LOGIN_REQUIRED" };
    }
    const { data, error } = await response.json();
    if (error) {
      Sentry.captureException(error);
      return {
        bible: null,
        keywords: null,
      };
    }
    return {
      bible: data.bible as Bible[],
      keywords: data.keywords as string[],
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      bible: null,
      keywords: null,
    };
  }
};

// KST 기준 오늘 말씀카드 생성(LLM 호출) 횟수 — RLS로 본인 로그만 조회됨.
// 표시용이며 실제 한도 강제는 functions/bible 이 담당 (실패 시 null → 표시 생략)
export const fetchTodayBibleCardUsage = async (): Promise<number | null> => {
  try {
    const { year, month, day } = getISOTodayDateYMD();
    const kstDayStartISO = `${year}-${month}-${day}T00:00:00+09:00`;
    const { count, error } = await supabase
      .from("llm_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("feature", "bible_card")
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
