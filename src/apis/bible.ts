import { supabase } from "./../../supabase/client";
import { Bible } from "../../supabase/types/tables";
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

export const searchBible = async (
  query: string,
): Promise<{ bible: Bible[] | null; keywords: string[] | null }> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/bible`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ query }),
      },
    );
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
