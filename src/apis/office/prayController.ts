import { Pray } from "supabase/types/tables";
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
        Sentry.captureException(error);
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
      Sentry.captureException(error);
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
  }
}

export const prayController = new PrayController();
