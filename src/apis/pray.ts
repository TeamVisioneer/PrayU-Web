import { getISOTodayDate } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { Pray } from "../../supabase/types/tables";
import { PrayType } from "../Enums/prayType";

export const fetchPrayData = async (
  prayCardId: string | undefined
): Promise<Pray[] | null> => {
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
};

export const fetchIsPrayToday = async (
  userId: string | undefined,
  groupId: string | undefined
): Promise<boolean> => {
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
};

export const fetchPrayDataByUserId = async (
  prayCardId: string | undefined,
  userId: string | undefined
): Promise<Pray[] | null> => {
  if (!prayCardId) return null;

  let query = supabase
    .from("pray")
    .select("*")
    .eq("pray_card_id", prayCardId)

    .is("deleted_at", null);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;

  if (error) {
    console.error("error", error);
    return null;
  }
  console.log(data);
  return data as Pray[];
};

export const createPray = async (
  PrayCardId: string | undefined,
  userId: string | undefined,
  prayType: PrayType | null
): Promise<Pray | null> => {
  if (!PrayCardId || !userId) {
    console.error("PrayCardId, userId is required");
    return null;
  }
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
};
