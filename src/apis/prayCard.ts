import { getISOToday } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { PrayCard, PrayCardWithProfiles } from "../../supabase/types/tables";

export const fetchGroupPrayCardList = async (
  groupId: string | undefined,
  startDt: string,
  endDt: string
): Promise<PrayCardWithProfiles[] | null> => {
  if (!groupId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq("group_id", groupId)
    .gte("created_at", startDt)
    .lt("created_at", endDt)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCardWithProfiles[];
};

export const fetchUserPrayCardListByGroupId = async (
  userId: string | undefined,
  groupId: string | undefined,
  limit: number = 10,
  offset: number = 0
): Promise<PrayCardWithProfiles[] | null> => {
  if (!userId || !groupId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select(
      `*, 
      profiles (id, full_name, avatar_url),
      pray (id, pray_card_id, user_id, pray_type, created_at, updated_at)`
    )
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCardWithProfiles[];
};

export const createPrayCard = async (
  groupId: string | undefined,
  userId: string | undefined,
  content: string
): Promise<PrayCard | null> => {
  if (!groupId || !userId) {
    console.error("groupId, userId is required");
    return null;
  }
  const { error, data } = await supabase
    .from("pray_card")
    .insert([{ group_id: groupId, user_id: userId, content }])
    .select();
  if (error) {
    console.error("error", error);
    return null;
  }
  return data ? data[0] : null;
};

export async function updatePrayCardContent(
  prayCardId: string,
  newPrayContent: string
) {
  const { data, error } = await supabase
    .from("pray_card")
    .update({
      content: newPrayContent,
      updated_at: getISOToday(),
    })
    .eq("id", prayCardId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
