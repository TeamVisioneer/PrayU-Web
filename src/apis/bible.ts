import { supabase } from "./../../supabase/client";
import { Bible } from "../../supabase/types/tables";
import { stripBibleMarkers } from "@/lib/bibleText";
import * as Sentry from "@sentry/react";

// DB 는 원본 표기(`<구역 제목>`·`○`)를 보존한다 — 앱으로 나가는 입구에서 한 번만 걷어낸다.
// (main #475 백포트 — Api v1.0.0 의 성경 원본 동기화로 prod 본문에 ○ 가 들어오기 때문)
const toDisplayBible = (row: Bible): Bible => ({
  ...row,
  sentence: stripBibleMarkers(row.sentence),
});

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
    return toDisplayBible(data as Bible);
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
    return (data as Bible[]).map(toDisplayBible);
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
