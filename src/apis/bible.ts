import { supabase } from "./../../supabase/client";
import { Bible } from "../../supabase/types/tables";
import { fetchTodayLlmUsage } from "@/apis/llmUsage";
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

// KST 기준 오늘 말씀카드 생성(LLM 호출) 횟수 — 공용 조회로 위임
export const fetchTodayBibleCardUsage = (): Promise<number | null> =>
  fetchTodayLlmUsage("bible_card");
