import { supabase } from "../../supabase/client";
import * as Sentry from "@sentry/react";
import { TablesInsert, TablesUpdate } from "../../supabase/types/database";
import { ThanksCard } from "../../supabase/types/tables";

// Thanks Card 타입 정의
export type ThanksCardInsert = TablesInsert<"thanks_card">;
export type ThanksCardUpdate = TablesUpdate<"thanks_card">;

export class ThanksCardController {
  constructor(private supabaseClient = supabase) {}

  /**
   * 모든 감사 카드를 조회합니다 (삭제되지 않은 것만)
   * @param limit 조회할 카드 수 제한 (기본값: 50)
   * @param offset 페이지네이션을 위한 오프셋
   * @returns ThanksCard[] | null
   */
  async fetchAllThanksCards(
    limit: number = 50,
    offset: number = 0,
  ): Promise<ThanksCard[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      return data as ThanksCard[];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * 특정 감사 카드를 조회합니다
   * @param id 감사 카드 ID
   * @returns ThanksCard | null
   */
  async getThanksCard(id: number): Promise<ThanksCard | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) {
        Sentry.captureException(error.message);
        return null;
      }

      return data as ThanksCard;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  /**
   * 새로운 감사 카드를 생성합니다
   * @param thanksCardData 생성할 감사 카드 데이터
   * @returns ThanksCard | null
   */
  async createThanksCard(
    thanksCardData: Partial<ThanksCardInsert>,
  ): Promise<ThanksCard | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .insert(thanksCardData)
        .select()
        .single();

      if (error) {
        Sentry.captureException(error.message);
        return null;
      }

      return data as ThanksCard;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  /**
   * 감사 카드를 업데이트합니다
   * @param id 업데이트할 감사 카드 ID
   * @param updateData 업데이트할 데이터
   * @returns ThanksCard | null
   */
  async updateThanksCard(
    id: number,
    updateData: ThanksCardUpdate,
  ): Promise<ThanksCard | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .update(updateData)
        .eq("id", id)
        .is("deleted_at", null)
        .select()
        .single();

      if (error) {
        Sentry.captureException(error.message);
        return null;
      }

      return data as ThanksCard;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  /**
   * 감사 카드를 소프트 삭제합니다
   * @param id 삭제할 감사 카드 ID
   * @returns boolean
   */
  async deleteThanksCard(id: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from("thanks_card")
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .is("deleted_at", null);

      if (error) {
        Sentry.captureException(error.message);
        return false;
      }

      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * 전체 감사 카드 개수를 조회합니다 (삭제되지 않은 것만)
   * @returns number
   */
  async getThanksCardCount(): Promise<number> {
    try {
      const { count, error } = await this.supabaseClient
        .from("thanks_card")
        .select("*", { count: "exact", head: true })
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
  }

  /**
   * 총 감사카드 row 수를 가져옵니다 (별칭 함수)
   * @returns number
   */
  async fetchThanksCardCount(): Promise<number> {
    return this.getThanksCardCount();
  }

  /**
   * 전체 감사 카드 개수를 조회합니다
   * @returns number 전체 개수
   */
  async getThanksCardStats(): Promise<number> {
    try {
      // 전체 개수 조회
      const { count: totalCount, error: totalError } = await this.supabaseClient
        .from("thanks_card")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      if (totalError) {
        Sentry.captureException(totalError.message);
        return 0;
      }

      return totalCount || 0;
    } catch (error) {
      Sentry.captureException(error);
      return 0;
    }
  }

  /**
   * 최근 생성된 감사 카드들을 조회합니다
   * @param limit 조회할 카드 수 제한 (기본값: 10)
   * @returns ThanksCard[] | null
   */
  async getRecentThanksCards(
    limit: number = 10,
  ): Promise<ThanksCard[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      return data as ThanksCard[];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * 특정 사용자의 감사 카드들을 조회합니다
   * @param userName 사용자 이름
   * @param limit 조회할 카드 수 제한 (기본값: 20)
   * @returns ThanksCard[] | null
   */
  async getThanksCardsByUser(
    userName: string,
    limit: number = 20,
  ): Promise<ThanksCard[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("thanks_card")
        .select("*")
        .eq("user_name", userName)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      return data as ThanksCard[];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }
}

// 편의를 위한 인스턴스 기본 제공
export const thanksCardController = new ThanksCardController();
