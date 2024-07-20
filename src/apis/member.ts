import { supabase } from "../../supabase/client";
import { Member, MemberWithProfiles } from "../../supabase/types/tables";

export const fetchMemberListByGroupId = async (
  groupId: string | undefined
): Promise<MemberWithProfiles[] | null> => {
  if (!groupId) return null;
  const { data, error } = await supabase
    .from("member")
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq("group_id", groupId)
    .is("deleted_at", null);
  if (error) {
    console.error("error", error);
    return null;
  }
  return data as MemberWithProfiles[];
};

export const createMember = async (
  groupId: string | undefined,
  userId: string | undefined
): Promise<Member | null> => {
  if (!groupId || !userId) return null;
  const { error, data } = await supabase
    .from("member")
    .insert([{ group_id: groupId, user_id: userId }])
    .select();
  if (error) {
    console.error("error", error);
    return null;
  }
  return data ? data[0] : null;
};
