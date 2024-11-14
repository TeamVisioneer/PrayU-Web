import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";
import { Json } from "supabase/types/database";

export const createQtData = async (
  userId: string,
  longLabel: string,
  chapter: number,
  startParagragh: number,
  endParagraph: number,
  fullSentence: string,
  result: Json
) => {
  try {
    const { data, error } = await supabase
      .from("qt_data")
      .insert({
        user_id: userId,
        long_label: longLabel,
        chapter: chapter,
        start_paragragh: startParagragh,
        end_paragraph: endParagraph,
        full_sentence: fullSentence,
        result: result,
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchQtData = async (
  longLabel: string,
  chapter: number,
  startParagragh: number,
  endParagraph: number
) => {
  try {
    const { data, error } = await supabase
      .from("qt_data")
      .select()
      .eq("long_label", longLabel)
      .eq("chapter", chapter)
      .eq("start_paragragh", startParagragh)
      .eq("end_paragraph", endParagraph)
      .order("created_at", { ascending: true });

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
