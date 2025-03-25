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
        console.error("기도 카드 카운트 조회 오류:", error);
        Sentry.captureException(error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("기도 카드 카운트 조회 중 오류 발생:", error);
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
        console.error("기도 카드 조회 오류:", prayCardError);
        Sentry.captureException(prayCardError);
        return [];
      }

      return prayCards as PrayCardWithProfiles[] || [];
    } catch (error) {
      console.error("기도 카드 조회 중 오류 발생:", error);
      Sentry.captureException(error);
      return [];
    }
  }

  // 특정 그룹의 모든 기도 카드 조회
  async getGroupPrayCards(groupId: string): Promise<PrayCardWithProfiles[]> {
    try {
      // 1. 해당 그룹에 속한 멤버 목록 조회
      const { data: members, error: memberError } = await this.supabaseClient
        .from("member")
        .select("id, user_id")
        .eq("group_id", groupId);

      if (memberError) {
        console.error("멤버 조회 오류:", memberError);
        return [];
      }

      if (!members || members.length === 0) {
        return [];
      }

      // 2. 그룹 멤버들의 user_id 목록 추출
      const userIds = members.map((member) => member.user_id).filter(Boolean);

      // 3. 해당 user_id를 가진 모든 기도 카드 조회
      const { data: prayCards, error: prayCardError } = await this
        .supabaseClient
        .from("pray_card")
        .select(`
          *,
          profiles!inner (*),
          pray (*)
        `)
        .in("user_id", userIds);

      if (prayCardError) {
        console.error("기도 카드 조회 오류:", prayCardError);
        return [];
      }

      return prayCards as PrayCardWithProfiles[] || [];
    } catch (error) {
      console.error("기도 카드 조회 중 오류 발생:", error);
      return [];
    }
  }

  // 특정 그룹의 기도 카드와 기도 수 조회 (최적화 버전)
  async getGroupPrayCount(groupId: string): Promise<{
    totalPrayCards: number;
    totalPrays: number;
  }> {
    try {
      // 1. 총 기도 카드 수 조회
      const { count: totalPrayCards, error: cardCountError } = await this
        .supabaseClient
        .from("pray_card")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId)
        .is("deleted_at", null);

      if (cardCountError) {
        console.error("기도 카드 수 조회 오류:", cardCountError);
        return {
          totalPrayCards: 0,
          totalPrays: 0,
        };
      }

      // 2. 총 기도 수 조회
      const { count: totalPrays, error: prayCountError } = await this
        .supabaseClient
        .from("pray")
        .select("*", { count: "exact", head: true })
        .eq("pray_card.group_id", groupId)
        .is("pray_card.deleted_at", null);

      if (prayCountError) {
        console.error("기도 수 조회 오류:", prayCountError);
        return {
          totalPrayCards: totalPrayCards || 0,
          totalPrays: 0,
        };
      }

      return {
        totalPrayCards: totalPrayCards || 0,
        totalPrays: totalPrays || 0,
      };
    } catch (error) {
      console.error("기도 통계 조회 중 오류 발생:", error);
      return {
        totalPrayCards: 0,
        totalPrays: 0,
      };
    }
  }
}

export const prayCardController = new PrayCardController();
