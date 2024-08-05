import { getISOToday } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { Member, MemberWithProfiles } from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";

export const fetchMemberListByGroupId = async (
  groupId: string | undefined
): Promise<MemberWithProfiles[] | null> => {
  try {
    if (!groupId) return null;
    const { data, error } = await supabase
      .from("member")
      .select(`*, profiles (id, full_name, avatar_url)`)
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
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

export const createMember = async (
  groupId: string | undefined,
  userId: string | undefined
): Promise<Member | null> => {
  try {
    if (!groupId || !userId) return null;
    const { error, data } = await supabase
      .from("member")
      .insert([{ group_id: groupId, user_id: userId }])
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
  groupId: string | undefined
): Promise<MemberWithProfiles | null> => {
  try {
    if (!groupId) return null;
    const { data, error } = await supabase
      .from("member")
      .select(`*, profiles (id, full_name, avatar_url)`)
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .is("deleted_at", null);
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
  memberId: string | undefined,
  praySummary: string | undefined,
  updatedAt?: string
): Promise<Member | null> => {
  try {
    if (!memberId) return null;
    const updateParams = {
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

export const deleteMemberbyGroupId = async (
  userId: string,
  groupId: string
) => {
  try {
    const { error } = await supabase
      .from("member")
      .update({ deleted_at: getISOToday() })
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
