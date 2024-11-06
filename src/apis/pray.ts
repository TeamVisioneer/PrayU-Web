import { getISOTodayDate } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { PrayType } from "../Enums/prayType";
import { Pray, PrayWithPrayCard } from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";

export const fetchTodayUserPrayByGroupId = async (
  userId: string,
  groupId: string
): Promise<PrayWithPrayCard[]> => {
  try {
    const today = getISOTodayDate();
    const { data, error } = await supabase
      .from("pray")
      .select(`*, pray_card!inner (*)`)
      .eq("pray_card.group_id", groupId)
      .eq("user_id", userId)
      .gte("created_at", today)
      .is("deleted_at", null);

    if (error) {
      Sentry.captureException(error.message);
      return [];
    }

    return data as PrayWithPrayCard[];
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const fetchTotalPrayCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("pray")
      .select("id", { count: "exact", head: true });
    if (error) {
      Sentry.captureException(error.message);
      return 0;
    }
    return count || 0;
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};

export const createPray = async (
  prayCardId: string,
  userId: string,
  prayType: PrayType
): Promise<Pray | null> => {
  try {
    const { error, data } = await supabase
      .from("pray")
      .insert([
        { pray_card_id: prayCardId, user_id: userId, pray_type: prayType },
      ])
      .select();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const updatePray = async (
  prayCardId: string | undefined,
  userId: string | undefined,
  prayType: PrayType
): Promise<Pray | null> => {
  try {
    if (!prayCardId || !userId) return null;
    const { error, data } = await supabase
      .from("pray")
      .update({ pray_type: prayType })
      .eq("pray_card_id", prayCardId)
      .eq("user_id", userId)
      .gte("created_at", getISOTodayDate());
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchPrayByDateRange = async (
  userId: string | undefined,
  startDt: string,
  endDt: string
): Promise<Pray[] | null> => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("pray")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDt)
      .lt("created_at", endDt);

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }

    return data ? data : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
