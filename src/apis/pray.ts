import { getISOTodayDate } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { Pray } from "../../supabase/types/tables";
import { PrayType } from "../Enums/prayType";
import * as Sentry from "@sentry/react";

export const fetchIsPrayToday = async (
  userId: string,
  groupId: string
): Promise<boolean> => {
  try {
    const today = getISOTodayDate();
    const { data, error } = await supabase
      .from("pray")
      .select(
        `
      created_at,
      pray_card!inner (group_id)
    `
      )
      .eq("pray_card.group_id", groupId)
      .eq("user_id", userId)
      .gte("created_at", today)
      .is("deleted_at", null);

    if (error) {
      Sentry.captureException(error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

export const createPray = async (
  PrayCardId: string,
  userId: string,
  prayType: PrayType
): Promise<Pray | null> => {
  try {
    const { error, data } = await supabase
      .from("pray")
      .insert([
        { pray_card_id: PrayCardId, user_id: userId, pray_type: prayType },
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
