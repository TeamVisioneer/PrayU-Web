import { getISOToday } from "@/lib/utils";
import { supabase } from "../../supabase/client";
import { PrayCard, PrayCardWithProfiles } from "../../supabase/types/tables";
import * as Sentry from "@sentry/react";

export const fetchGroupPrayCardList = async (
  groupId: string,
  currentUserId: string,
  startDt: string,
  endDt: string,
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
      profiles (id, full_name, avatar_url, kakao_id),
      pray (*, 
        profiles (id, full_name, avatar_url, kakao_id)
      )`,
      )
      .eq("group_id", groupId)
      .eq("pray.user_id", currentUserId)
      .gte("created_at", startDt)
      .lt("created_at", endDt)
      .is("deleted_at", null)
      .is("pray.deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(25);

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

export const fetchOtherPrayCardListByGroupId = async (
  currentUserId: string,
  userId: string,
  groupId: string,
  limit: number = 1,
  offset: number = 0,
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
        profiles (id, full_name, avatar_url, kakao_id),
        pray (*, 
          profiles (id, full_name, avatar_url, kakao_id)
        )`,
      )
      .eq("user_id", userId)
      .eq("group_id", groupId)
      .eq("pray.user_id", currentUserId)
      .is("deleted_at", null)
      .is("pray.deleted_at", null)
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
  offset: number = 0,
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
      profiles (id, full_name, avatar_url, kakao_id),
      pray (*, 
        profiles (id, full_name, avatar_url, kakao_id)
      )`,
      )
      .eq("user_id", currentUserId)
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .is("pray.deleted_at", null)
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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }));
    return sortedData as PrayCardWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchUserPrayCardList = async (
  currentUserId: string,
  limit: number = 18,
  offset: number = 0,
): Promise<PrayCardWithProfiles[] | null> => {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .select(
        `*,
      profiles (id, full_name, avatar_url, kakao_id),
      pray (*, 
        profiles (id, full_name, avatar_url, kakao_id)
      ),
      group(name)`,
      )
      .eq("user_id", currentUserId)
      .is("deleted_at", null)
      .is("pray.deleted_at", null)
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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }));
    return sortedData as PrayCardWithProfiles[];
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const fetchUserPrayCardCount = async (
  currentUserId: string,
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("pray_card")
      .select("id", { count: "exact" })
      .eq("user_id", currentUserId)
      .is("deleted_at", null);

    if (error) {
      Sentry.captureException(error.message);
      return 0;
    }
    return count || 0;
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};

export const createPrayCard = async (
  groupId: string,
  userId: string,
  content: string,
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

export const bulkCreatePrayCard = async (
  groupIds: string[],
  userId: string | null,
  content: string,
  life: string,
): Promise<PrayCard[] | null> => {
  try {
    const { error, data } = await supabase
      .from("pray_card")
      .insert(
        groupIds.map((groupId) => ({
          group_id: groupId,
          user_id: userId,
          content,
          life,
        })),
      )
      .select();
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

export interface createPrayCardParams {
  group_id?: string;
  user_id?: string | null;
  content: string;
  bible_card_url?: string | null;
  life?: string;
}

export const createPrayCardWithParams = async (
  params: createPrayCardParams,
): Promise<PrayCard | null> => {
  try {
    const { error, data } = await supabase
      .from("pray_card")
      .insert([params])
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

export interface updatePrayCardParams {
  group_id?: string;
  user_id?: string;
  bible_card_url?: string;
  life?: string;
  content?: string;
}

export async function updatePrayCard(
  prayCardId: string,
  params: updatePrayCardParams,
) {
  try {
    const { data, error } = await supabase
      .from("pray_card")
      .update(params)
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
  groupId: string,
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
