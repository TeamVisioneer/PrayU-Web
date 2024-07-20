import { supabase } from "../../supabase/client";
import { PrayCard } from "../../supabase/types/tables";

export const fetchPrayCardListByGroupId = async (
  groupId: string | undefined
): Promise<PrayCard[] | null> => {
  if (!groupId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select("*")
    .eq("group_id", groupId)
    .is("deleted_at", null);
  // TODO : 이후에 7일 이내의 데이터만 가져오도록 수정 필요
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCard[];
};

export const fetchPrayCardListByUserId = async (
  userId: string | undefined
): Promise<PrayCard[] | null> => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("pray_card")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .limit(10); // TODO: 이후 페이지네이션 적용 필요
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCard[];
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
