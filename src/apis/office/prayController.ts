import { Pray, PrayWithProfiles } from "supabase/types/tables";
import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";

export class PrayController {
  constructor(private supabaseClient = supabase) {}

  async getPrayCountByGroupIds(
    groupIds: string[],
    startDt?: string,
    endDt?: string,
  ): Promise<number> {
    try {
      const query = this.supabaseClient
        .from("pray")
        .select("*, pray_card!inner(*)", {
          count: "exact",
          head: true,
        })
        .in("pray_card.group_id", groupIds);
      if (startDt) query.gte("created_at", startDt);
      if (endDt) query.lt("created_at", endDt);

      const { count, error } = await query;
      if (error) {
        Sentry.captureException(error.message);
        return 0;
      }
      return count || 0;
    } catch (error) {
      Sentry.captureException(error);
      return 0;
    }
  }

  async getPrayDataByGroupIds(
    groupIds: string[],
    startDt: string,
    endDt: string,
  ): Promise<Pray[]> {
    try {
      const query = this.supabaseClient
        .from("pray")
        .select(
          "*, pray_card!inner(group_id)",
        )
        .in("pray_card.group_id", groupIds)
        .gte("created_at", startDt)
        .lt("created_at", endDt)
        .order("created_at", { ascending: true });

      const { data, error } = await query;
      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      // pray data 만 리턴, pray.pray_card 는 제외
      return data?.map((pray) => ({
        pray_card_id: pray.pray_card_id,
        created_at: pray.created_at,
        pray_type: pray.pray_type,
        user_id: pray.user_id,
        deleted_at: pray.deleted_at,
        id: pray.id,
        updated_at: pray.updated_at,
      })) || [];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  // 기도 기록 저장
  async createPray(
    userId: string,
    prayCardId: string,
    prayType: string = "pray",
  ): Promise<PrayWithProfiles | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("pray")
        .insert({
          user_id: userId,
          pray_card_id: prayCardId,
          pray_type: prayType,
        })
        .select(`*, profiles!inner (*)`)
        .single();

      if (error) {
        Sentry.captureException(error.message);
        return null;
      }

      return data as PrayWithProfiles;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }
}

export const prayController = new PrayController();
