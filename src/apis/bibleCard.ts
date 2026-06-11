import { supabase } from "../../supabase/client";
import { BibleCard } from "../../supabase/types/tables";
import { TablesInsert } from "../../supabase/types/database";
import { TablesUpdate } from "../../supabase/types/database";
import * as Sentry from "@sentry/react";

/**
 * 새로운 말씀 카드를 생성합니다.
 */
export const createBibleCard = async (
  bibleCard: TablesInsert<"bible_card">,
): Promise<BibleCard | null> => {
  try {
    const { data, error } = await supabase
      .from("bible_card")
      .insert(bibleCard)
      .select()
      .single();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as BibleCard;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * 특정 사용자의 말씀 카드 목록을 가져옵니다.
 */
export const fetchBibleCards = async (
  userId: string,
): Promise<BibleCard[] | null> => {
  try {
    const { data, error } = await supabase
      .from("bible_card")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as BibleCard[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * 특정 ID의 말씀 카드를 가져옵니다.
 */
export const getBibleCard = async (id: string): Promise<BibleCard | null> => {
  try {
    const { data, error } = await supabase
      .from("bible_card")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as BibleCard;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * 말씀 카드를 수정합니다.
 */
export const updateBibleCard = async (
  id: string,
  bibleCard: TablesUpdate<"bible_card">,
): Promise<BibleCard | null> => {
  try {
    const { data, error } = await supabase
      .from("bible_card")
      .update(bibleCard)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as BibleCard;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};


