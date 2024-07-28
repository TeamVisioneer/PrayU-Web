import { supabase } from "./../../supabase/client";
import { MemberWithGroup, Group } from "../../supabase/types/tables";

export const fetchGroupListByUserId = async (
  userId: string | undefined
): Promise<Group[] | null> => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("member")
    .select(`group (*)`)
    .eq("user_id", userId)
    .is("deleted_at", null);
  if (error) {
    console.error("error", error);
    return null;
  }
  return (data as MemberWithGroup[])
    .filter((member) => member.group != null)
    .map((member) => member.group);
};

export const getGroup = async (
  groupId: string | undefined
): Promise<Group | null> => {
  if (!groupId) return null;
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

export const createGroup = async (
  userId: string | undefined,
  name: string | undefined,
  intro: string | undefined
): Promise<Group | null> => {
  if (!userId || !name || !intro) {
    console.error("userId, name, intro is required");
    return null;
  }
  const { error, data } = await supabase
    .from("group")
    .insert([{ user_id: userId, name, intro }])
    .select();
  if (error) {
    console.error("error", error);
    return null;
  }
  return data ? data[0] : null;
};
