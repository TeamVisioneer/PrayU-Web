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
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as PrayCard[];
};
