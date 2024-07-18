import { supabase } from "../../supabase/client";
import { MemberWithGroup, Group } from "../../supabase/types/tables";

export const fetchGroupListByUserId = async (
  userId: string
): Promise<Group[] | null> => {
  const { data, error } = await supabase
    .from("member")
    .select(`group (*)`)
    .eq("user_id", userId)
    .is("deleted_at", null);
  if (error) {
    console.error("error", error);
    return null;
  }
  return (data as MemberWithGroup[]).map((member) => member.group);
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
  const { error, data } = await supabase
    .from("group")
    .select("*")
    .eq("id", groupId)
    .single();
  if (error) {
    console.error("error", error);
    return null;
  }
  return data;
};
