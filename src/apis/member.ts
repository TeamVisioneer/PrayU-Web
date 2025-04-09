import { getISOToday } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import {
  Member,
  MemberWithGroup,
  MemberWithProfiles,
} from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";

export const fetchMemberListByGroupId = async (
  groupId: string,
  limit: number = 25,
  offset: number = 0,
): Promise<MemberWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("member")
      .select(`*, profiles (id, full_name, avatar_url, kakao_id)`)
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as MemberWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchMemberListByUserId = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<MemberWithGroup[] | null> => {
  try {
    const { data, error } = await supabase
      .from("member")
      .select(`*, group (*)`)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data.filter((member) => member.group != null) as MemberWithGroup[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
export const fetchMemberCountByGroupId = async (
  groupId: string,
): Promise<number | null> => {
  try {
    const { count, error } = await supabase
      .from("member")
      .select("id", { count: "exact" })
      .eq("group_id", groupId)
      .is("deleted_at", null);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return count;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const createMember = async (
  groupId: string,
  userId: string,
  praySummay: string,
): Promise<Member | null> => {
  try {
    const { error, data } = await supabase
      .from("member")
      .insert([
        { group_id: groupId, user_id: userId, pray_summary: praySummay },
      ])
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

export const getMember = async (
  userId: string,
  groupId: string,
): Promise<MemberWithProfiles | null> => {
  try {
    const { data, error } = await supabase
      .from("member")
      .select(
        `*, profiles (id, full_name, avatar_url, kakao_id, blocking_users, kakao_notification)`,
      )
      .eq("user_id", userId)
      .eq("group_id", groupId);
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data ? (data[0] as MemberWithProfiles) : null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const updateMember = async (
  memberId: string,
  praySummary: string,
  updatedAt?: string,
): Promise<Member | null> => {
  try {
    const updateParams = {
      deleted_at: null,
      pray_summary: praySummary,
      ...(updatedAt && { updated_at: getISOToday() }),
    };
    const { error, data } = await supabase
      .from("member")
      .update(updateParams)
      .eq("id", memberId)
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

export const bulkUpdateMembers = async (
  memberIds: string[],
  praySummary: string,
  updatedAt?: boolean,
): Promise<Member[] | null> => {
  try {
    const updateParams = {
      deleted_at: null,
      pray_summary: praySummary,
      ...(updatedAt && { updated_at: getISOToday() }),
    };
    const { error, data } = await supabase
      .from("member")
      .update(updateParams)
      .in("id", memberIds)
      .select();
    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as Member[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const deleteMemberbyGroupId = async (
  userId: string,
  groupId: string,
) => {
  try {
    const { error } = await supabase
      .from("member")
      .update({ pray_summary: null, deleted_at: getISOToday() })
      .eq("user_id", userId)
      .eq("group_id", groupId);
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
