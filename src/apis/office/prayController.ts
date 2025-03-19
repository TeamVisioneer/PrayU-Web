import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";
import { PrayCard } from "../../../supabase/types/tables";
import { PostgrestError } from "@supabase/supabase-js";
import {
  fetchPrayCountByGroupIds,
  getDirectPrayCount,
} from "../../utils/prayUtils";

export class PrayController {
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
          pray(count)
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

  /**
   * Fetches the total prayer count for the specified group IDs in a date range
   * This uses the utility function that accumulates pray[0].count values
   */
  async fetchPrayCountByGroupIds(
    groupIds: string[],
    startDt: string,
    endDt: string,
  ): Promise<number | null> {
    return fetchPrayCountByGroupIds(groupIds, startDt, endDt);
  }

  /**
   * Directly counts prayers for the specified groups using a more optimized approach
   * This is preferred when you only need the count and not the full pray card data
   */
  async getDirectPrayCount(
    groupIds: string[],
    startDt: string,
    endDt: string,
  ): Promise<number | null> {
    return getDirectPrayCount(groupIds, startDt, endDt);
  }
}

export const prayController = new PrayController();
