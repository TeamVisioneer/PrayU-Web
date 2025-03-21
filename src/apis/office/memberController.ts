import { supabase } from "../../../supabase/client";
import * as Sentry from "@sentry/react";
import { PostgrestError } from "@supabase/supabase-js";
import { MemberWithProfiles } from "../../../supabase/types/tables";

export interface MemberWithActivity extends MemberWithProfiles {
  lastActive: string;
  role: string;
}

export class MemberController {
  constructor(private supabaseClient = supabase) {}

  private handleError(error: Error | PostgrestError): null {
    Sentry.captureException(error);
    return null;
  }

  /**
   * 그룹의 모든 멤버 정보를 조회합니다.
   * @param groupId 그룹 ID
   * @returns 멤버 목록 또는 null (오류 발생 시)
   */
  async getGroupMembers(groupId: string): Promise<MemberWithActivity[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("member")
        .select(`
          *,
          profiles (id, full_name, avatar_url)
        `)
        .eq("group_id", groupId)
        .is("deleted_at", null);

      if (error) return this.handleError(error);

      if (!data) return [];

      // 활동 정보를 가공하여 반환
      const membersWithActivity = data.map((member) => {
        // 멤버가 그룹 리더인지 확인 (더 복잡한 로직이 필요하다면 확장 가능)
        const isLeader = false; // 기본값
        const role = isLeader ? "리더" : "멤버";

        return {
          ...member,
          lastActive: member.updated_at || member.created_at,
          role,
        } as MemberWithActivity;
      });

      return membersWithActivity;
    } catch (error) {
      return this.handleError(error as Error);
    }
  }
}

export const memberController = new MemberController();
