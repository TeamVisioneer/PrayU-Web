import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";
import { PrayCardWithProfiles } from "../../../supabase/types/tables";

export class PrayCardController {
  constructor(private supabaseClient = supabase) {}

  // 여러 그룹들의 기도 카드 카운트 조회
  async getPrayCardCountByGroupIds(
    groupIds: string[],
    startDt: string,
    endDt: string,
  ): Promise<number> {
    try {
      const { data, error } = await this.supabaseClient
        .from("pray_card")
        .select("id", { count: "exact", head: true })
        .in("group_id", groupIds)
        .gte("created_at", startDt)
        .lt("created_at", endDt)
        .is("deleted_at", null);

      if (error) {
        Sentry.captureException(error.message);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      Sentry.captureException(error);
      return 0;
    }
  }

  // 특정 사용자의 기도 카드 조회 (그룹 필터링 포함)
  async getPrayCardsByUserAndGroup(
    userId: string,
    groupId: string,
  ): Promise<PrayCardWithProfiles[]> {
    try {
      // 특정 사용자(userId)의 기도카드 조회 (그룹 필터링 포함)
      const { data: prayCards, error: prayCardError } = await this
        .supabaseClient
        .from("pray_card")
        .select(`
          *,
          profiles!inner (*),
          pray (*)
        `)
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(3);

      if (prayCardError) {
        Sentry.captureException(prayCardError.message);
        return [];
      }

      return prayCards as PrayCardWithProfiles[] || [];
    } catch (error) {
      console.error("기도 카드 조회 중 오류 발생:", error);
      Sentry.captureException(error);
      return [];
    }
  }
}

export const prayCardController = new PrayCardController();
