import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";
import { PostgrestError } from "@supabase/supabase-js";
import { PrayCard } from "../../../supabase/types/tables";

export class PrayCardController {
  constructor(private supabaseClient = supabase) {}

  private handleError(error: Error | PostgrestError): null {
    Sentry.captureException(error);
    return null;
  }

  async fetchPrayCardByGroupIds(
    groupIds: string[],
    startDt: string,
    endDt: string,
  ): Promise<PrayCard[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("pray_card")
        .select(`
          *,
          pray(created_at)
        `)
        .in("group_id", groupIds)
        .is("deleted_at", null)
        .gte("created_at", startDt)
        .lte("created_at", endDt);

      if (error) return this.handleError(error);
      return data as PrayCard[];
    } catch (error) {
      return this.handleError(error as Error);
    }
  }
}

export const prayCardController = new PrayCardController();
