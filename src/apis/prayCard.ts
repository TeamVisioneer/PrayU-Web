import { getISOToday } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { PrayCard, PrayCardWithProfiles } from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";

export const fetchGroupPrayCardList = async (
  groupId: string,
  currentUserId: string,
  startDt: string,
  endDt: string
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
      profiles (id, full_name, avatar_url, kakao_id),
      pray (*, 
        profiles (id, full_name, avatar_url, kakao_id)
      )`
      )
      .eq("group_id", groupId)
      .eq("pray.user_id", currentUserId)
      .not("user_id", "is", null)
      .not("profiles.id", "is", null)
      .not("pray.user_id", "is", null)
      .gte("created_at", startDt)
      .lt("created_at", endDt)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    console.log("data", data);
    return data as PrayCardWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchOtherPrayCardListByGroupId = async (
  currentUserId: string,
  userId: string,
  groupId: string,
  limit: number = 1,
  offset: number = 0
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
        profiles (id, full_name, avatar_url, kakao_id),
        pray (*, 
          profiles (id, full_name, avatar_url, kakao_id)
        )`
      )
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .not("user_id", "is", null)
      .not("profiles.id", "is", null)
      .not("pray.user_id", "is", null)
      .eq("pray.user_id", currentUserId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data as PrayCardWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchUserPrayCardListByGroupId = async (
  currentUserId: string,
  groupId: string,
  limit: number = 1,
  offset: number = 0
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
      profiles (id, full_name, avatar_url, kakao_id),
      pray (*, 
        profiles (id, full_name, avatar_url, kakao_id)
      )`
      )
      .eq("user_id", currentUserId)
      .eq("group_id", groupId)
      .not("user_id", "is", null)
      .not("profiles.id", "is", null)
      .not("pray.user_id", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }

    const sortedData = data.map((data) => ({
      ...data,
      pray: data.pray.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));
    return sortedData as PrayCardWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const createPrayCard = async (
  groupId: string,
  userId: string,
  content: string
): Promise<PrayCard | null> => {
  try {
    const { error, data } = await supabase
      .from("pray_card")
      .insert([{ group_id: groupId, user_id: userId, content }])
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

export async function updatePrayCardContent(
  prayCardId: string,
  newPrayContent: string
) {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .update({
        content: newPrayContent,
        updated_at: getISOToday(),
      })
      .eq("id", prayCardId);

    if (error) {
      Sentry.captureException(error.message);
      return null;
    }
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
}

export const deletePrayCard = async (prayCardId: string) => {
  try {
    const { error } = await supabase
      .from("pray_card")
      .update({ deleted_at: getISOToday() })
      .eq("id", prayCardId);

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

export const deletePrayCardByGroupId = async (
  userId: string,
  groupId: string
) => {
  try {
    const { error } = await supabase
      .from("pray_card")
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
