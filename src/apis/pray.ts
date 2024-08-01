import { getISOTodayDate } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { Pray, PrayWithProfiles } from "../../supabase/types/tables";
import { PrayType } from "../Enums/prayType";
import * as Sentry from "@sentry/react";

export const fetchPrayData = async (
  prayCardId: string | undefined
): Promise<Pray[] | null> => {
  try {
    if (!prayCardId) return null;
    const { data, error } = await supabase
      .from("pray")
      .select("*")
      .eq("pray_card_id", prayCardId)
      .is("deleted_at", null);
    if (error) {
      console.error("error", error);
      return null;
    }
    return data as Pray[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchIsPrayToday = async (
  userId: string | undefined,
  groupId: string | undefined
): Promise<boolean> => {
  try {
    if (!userId || !groupId) return false;
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
      console.error("Error fetching pray data:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

export const fetchPrayDataByUserId = async (
  prayCardId: string | undefined,
  userId: string | undefined
): Promise<PrayWithProfiles[] | null> => {
  try {
    if (!prayCardId) return null;
    let query = supabase
      .from("pray")
      .select("*, profiles (id, full_name, avatar_url)")
      .eq("pray_card_id", prayCardId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query;

    if (error) {
      console.error("error", error);
      return null;
    }
    return data as PrayWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const createPray = async (
  PrayCardId: string | undefined,
  userId: string | undefined,
  prayType: PrayType | null
): Promise<Pray | null> => {
  try {
    if (!PrayCardId || !userId) return null;
    const { error, data } = await supabase
      .from("pray")
      .insert([
        { pray_card_id: PrayCardId, user_id: userId, pray_type: prayType },
      ])
      .select();
    if (error) {
      console.error("error", error);
      return null;
    }
    return data ? data[0] : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
