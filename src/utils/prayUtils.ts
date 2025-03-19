import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Interface for pray card with pray count data
 */
interface PrayCardWithCount {
  id: string;
  pray?: Array<{ count: number }>;
  group_id?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_id?: string;
  // Using Record<string, unknown> is better than [key: string]: any
  [key: string]: unknown;
}

/**
 * Daily prayer count data structure
 */
export interface DailyPrayerCount {
  date: Date;
  dayStr: string;
  count: number;
  isToday: boolean;
}

/**
 * Handles errors by logging them to Sentry
 * @param error The error to handle
 * @returns null
 */
export const handlePrayError = (error: Error | PostgrestError): null => {
  Sentry.captureException(error);
  return null;
};

/**
 * Calculates the total prayer count from pray cards with prayer counts
 * @param prayCards Array of pray card objects that include pray count data
 * @returns Total count of prayers
 */
export const calculateTotalPrayCount = (
  prayCards: PrayCardWithCount[],
): number => {
  if (!prayCards || !Array.isArray(prayCards)) return 0;

  return prayCards.reduce((acc, item) => {
    // Safely access the count, handling potential undefined values
    const count = item.pray && item.pray[0] ? item.pray[0].count || 0 : 0;
    return acc + count;
  }, 0);
};

/**
 * Fetches prayer counts for a list of groups in a given date range
 * @param groupIds Array of group IDs
 * @param startDt Start date in ISO string format
 * @param endDt End date in ISO string format
 * @returns Total prayer count or null if an error occurs
 */
export const fetchPrayCountByGroupIds = async (
  groupIds: string[],
  startDt: string,
  endDt: string,
): Promise<number | null> => {
  try {
    if (!groupIds || groupIds.length === 0) return 0;

    const { data, error } = await supabase
      .from("pray_card")
      .select(`
        *,
        pray(count)
      `)
      .in("group_id", groupIds)
      .is("deleted_at", null)
      .gte("created_at", startDt)
      .lte("created_at", endDt);

    if (error) return handlePrayError(error);
    if (!data) return 0;

    return calculateTotalPrayCount(data as PrayCardWithCount[]);
  } catch (error) {
    return handlePrayError(error as Error);
  }
};

/**
 * Optimized method to directly count all prayers for groups
 * @param groupIds Array of group IDs
 * @param startDt Start date in ISO string format
 * @param endDt End date in ISO string format
 * @returns Total prayer count or null if an error occurs
 */
export const getDirectPrayCount = async (
  groupIds: string[],
  startDt: string,
  endDt: string,
): Promise<number | null> => {
  try {
    if (!groupIds || groupIds.length === 0) return 0;

    // 1. Find pray_card IDs in the specified groups
    const { data: prayCards, error: prayCardsError } = await supabase
      .from("pray_card")
      .select("id")
      .in("group_id", groupIds)
      .is("deleted_at", null)
      .gte("created_at", startDt)
      .lte("created_at", endDt);

    if (prayCardsError) return handlePrayError(prayCardsError);
    if (!prayCards || prayCards.length === 0) return 0;

    // 2. Count prayers associated with these pray_cards
    const prayCardIds = prayCards.map((card) => card.id);
    const { count, error: countError } = await supabase
      .from("pray")
      .select("*", { count: "exact", head: true })
      .in("pray_card_id", prayCardIds)
      .is("deleted_at", null);

    if (countError) return handlePrayError(countError);

    return count || 0;
  } catch (error) {
    return handlePrayError(error as Error);
  }
};

/**
 * Gets prayer statistics for today, this week, and this month for specified groups
 * Uses local timezone for date calculations
 * @param groupIds Array of group IDs
 * @returns Object with prayer counts for different time periods or null if an error occurs
 */
export const getPrayerStatsForGroups = async (
  groupIds: string[],
): Promise<
  {
    todayCount: number;
    weeklyCount: number;
    monthlyCount: number;
    totalCount: number;
  } | null
> => {
  try {
    if (!groupIds || groupIds.length === 0) {
      return {
        todayCount: 0,
        weeklyCount: 0,
        monthlyCount: 0,
        totalCount: 0,
      };
    }

    // Get the current date in local timezone
    const now = new Date();

    // Calculate date boundaries for filtering in local timezone
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now);
    monthStart.setDate(1); // Start of month
    monthStart.setHours(0, 0, 0, 0);

    // Format dates for Supabase query (these will be converted to UTC)
    const todayStartISO = todayStart.toISOString();
    const weekStartISO = weekStart.toISOString();
    const monthStartISO = monthStart.toISOString();
    const nowISO = now.toISOString();

    // Perform all queries in parallel for better performance
    const [todayCount, weeklyCount, monthlyCount, totalCount] = await Promise
      .all([
        // Today's count
        getDirectPrayCount(groupIds, todayStartISO, nowISO),
        // Weekly count
        getDirectPrayCount(groupIds, weekStartISO, nowISO),
        // Monthly count
        getDirectPrayCount(groupIds, monthStartISO, nowISO),
        // Total count (use a far-past date for the start)
        getDirectPrayCount(groupIds, "2000-01-01", nowISO),
      ]);

    // If any query returned null (error), return null
    if (
      todayCount === null || weeklyCount === null ||
      monthlyCount === null || totalCount === null
    ) {
      return null;
    }

    return {
      todayCount,
      weeklyCount,
      monthlyCount,
      totalCount,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * Gets daily prayer counts for the past 7 days for the specified groups
 * This uses the local timezone of the user for date calculations
 * @param groupIds Array of group IDs
 * @returns Array of daily prayer count data or null if an error occurs
 */
export const getDailyPrayerCountsForLastWeek = async (
  groupIds: string[],
): Promise<DailyPrayerCount[] | null> => {
  try {
    if (!groupIds || groupIds.length === 0) {
      return generateEmptyDailyData();
    }

    // Start with local date for the user
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Midnight in local timezone

    // Get date 7 days ago in local timezone
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // End of today in local timezone
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Convert to ISO strings for Supabase (which will be in UTC)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    const todayEndISO = todayEnd.toISOString();

    // 1. Find pray_card IDs in the specified groups
    const { data: prayCards, error: prayCardsError } = await supabase
      .from("pray_card")
      .select("id")
      .in("group_id", groupIds)
      .is("deleted_at", null);

    if (prayCardsError) return handlePrayError(prayCardsError);
    if (!prayCards || prayCards.length === 0) return generateEmptyDailyData();

    // 2. Get all prayers from the past 7 days with their creation timestamps
    const prayCardIds = prayCards.map((card) => card.id);
    const { data: prayers, error: prayersError } = await supabase
      .from("pray")
      .select("created_at")
      .in("pray_card_id", prayCardIds)
      .is("deleted_at", null)
      .gte("created_at", sevenDaysAgoISO)
      .lte("created_at", todayEndISO);

    if (prayersError) return handlePrayError(prayersError);
    if (!prayers) return generateEmptyDailyData();

    // 3. Count prayers by day using empty template
    const dailyCounts = generateEmptyDailyData();

    // Group prayers by day in local timezone
    prayers.forEach((prayer) => {
      // Convert UTC timestamp from database to local date
      const prayDate = new Date(prayer.created_at);

      // Reset hours to get start of the day in local timezone
      const prayDateLocal = new Date(
        prayDate.getFullYear(),
        prayDate.getMonth(),
        prayDate.getDate(),
        0,
        0,
        0,
        0,
      );

      // Find matching day in our dailyCounts array
      const dayIndex = dailyCounts.findIndex((day) =>
        day.date.getFullYear() === prayDateLocal.getFullYear() &&
        day.date.getMonth() === prayDateLocal.getMonth() &&
        day.date.getDate() === prayDateLocal.getDate()
      );

      if (dayIndex !== -1) {
        dailyCounts[dayIndex].count += 1;
      }
    });

    return dailyCounts;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

/**
 * Generates empty daily data structure for the past 7 days using local timezone
 * @returns Array with empty count data for each of the past 7 days
 */
const generateEmptyDailyData = (): DailyPrayerCount[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Midnight in local timezone

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);

    return {
      date,
      dayStr: dayNames[date.getDay()],
      count: 0,
      isToday: i === 6, // Last item is today
    };
  });
};
