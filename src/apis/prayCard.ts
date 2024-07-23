import { supabase } from "../../supabase/client";
import { PrayCard, PrayCardWithProfiles } from "../../supabase/types/tables";

export const fetchPrayCardListByGroupId = async (
  groupId: string | undefined
): Promise<PrayCardWithProfiles[] | null> => {
  if (!groupId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq("group_id", groupId)
    .is("deleted_at", null);
  // TODO : 이후에 7일 이내의 데이터만 가져오도록 수정 필요
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCardWithProfiles[];
};

export const fetchPrayCardListByUserId = async (
  userId: string | undefined
): Promise<PrayCardWithProfiles[] | null> => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .limit(10); // TODO: 이후 페이지네이션 적용 필요
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
    .update({ content: newPrayContent })
    .eq("id", prayCardId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
