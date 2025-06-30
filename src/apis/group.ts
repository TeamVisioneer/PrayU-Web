import { supabase } from "./../../supabase/client";
import {
  Group,
  GroupWithProfiles,
  MemberWithGroup,
} from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";
import { getISOToday } from "@/lib/utils";

export const fetchGroupListByGroupIds = async (
  groupIds: string[],
  limit: number = 20,
  offset: number = 0,
): Promise<GroupWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("group")
      .select(`
        *, 
        profiles (id, full_name, avatar_url),
        member (id,user_id, profiles (id, full_name, avatar_url))
      `)
      .in("id", groupIds)
      .is("deleted_at", null)
      .is("member.deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as GroupWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchGroupListByUserId = async (
  userId: string,
): Promise<Group[] | null> => {
  try {
    const { data, error } = await supabase
      .from("member")
      .select(`group (*)`)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
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

export const fetchGroupListByDate = async (
  createdAt: string,
): Promise<Group[] | null> => {
  try {
    const { data, error } = await supabase
      .from("group")
      .select("*")
      .gt("created_at", createdAt)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return (data as Group[]);
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const getGroup = async (
  groupId: string,
): Promise<GroupWithProfiles | null> => {
  try {
    const { error, data } = await supabase
      .from("group")
      .select(
        `*, profiles (id, full_name, avatar_url, kakao_id), group_union (id, name, profiles (id, full_name, avatar_url))`,
      )
      .eq("id", groupId)
      .single();
    if (error) {
      if (error.code == "22P02") return null; // groupId가 uuid 가 아닌경우
      if (error.code == "PGRST116") return null; // 해당 row 가 없는 경우
      Sentry.captureException(error.message);
      return null;
    }
    return data as GroupWithProfiles;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const getGroupWithMemberList = async (
  groupId: string,
): Promise<GroupWithProfiles | null> => {
  try {
    const { error, data } = await supabase
      .from("group")
      .select(
        `*, member!inner(user_id)`,
      )
      .eq("id", groupId)
      .is("member.deleted_at", null)
      .single();
    if (error) {
      if (error.code == "22P02") return null; // groupId가 uuid 가 아닌경우
      if (error.code == "PGRST116") return null; // 해당 row 가 없는 경우
      Sentry.captureException(error.message);
      return null;
    }
    return data as GroupWithProfiles;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const createGroup = async (
  userId: string,
  name: string,
  intro: string,
): Promise<GroupWithProfiles | null> => {
  try {
    const { error, data } = await supabase
      .from("group")
      .insert([{ user_id: userId, name, intro }])
      .select(`*, profiles (id, full_name, avatar_url, kakao_id)`);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? (data[0] as GroupWithProfiles) : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export interface updateGroupParams {
  name?: string;
  intro?: string;
  user_id?: string;
}

export const updateGroup = async (
  groupId: string,
  params: updateGroupParams,
) => {
  try {
    const { error, data } = await supabase
      .from("group")
      .update(params)
      .eq("id", groupId)
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
