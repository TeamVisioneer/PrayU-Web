import { supabase } from "./../../supabase/client";
import { MemberWithGroup, Group } from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";
import { getISOToday } from "@/lib/utils";

export const fetchGroupListByUserId = async (
  userId: string | undefined
): Promise<Group[] | null> => {
  try {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("member")
      .select(`group (*)`)
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return (data as MemberWithGroup[])
      .filter((member) => member.group != null)
      .map((member) => member.group);
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const getGroup = async (
  groupId: string | undefined
): Promise<Group | null> => {
  try {
    if (!groupId) return null;
    const { error, data } = await supabase
      .from("group")
      .select("*")
      .eq("id", groupId)
      .single();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const createGroup = async (
  userId: string | undefined,
  name: string | undefined,
  intro: string | undefined
): Promise<Group | null> => {
  try {
    if (!userId || !name || !intro) return null;
    const { error, data } = await supabase
      .from("group")
      .insert([{ user_id: userId, name, intro }])
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

export const deleteGroup = async (groupId: string) => {
  try {
    const { error } = await supabase
      .from("group")
      .update({ deleted_at: getISOToday() })
      .eq("id", groupId);

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
