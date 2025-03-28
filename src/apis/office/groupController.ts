import { supabase } from "./../../../supabase/client";
import * as Sentry from "@sentry/react";
import { GroupWithProfiles } from "../../../supabase/types/tables";

export class GroupController {
  constructor(private supabaseClient = supabase) {}

  async fetchGroupListByUserId(
    userId: string,
  ): Promise<GroupWithProfiles[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("group")
        .select(`
          *,
          profiles (id, full_name, avatar_url),
          member!inner (
            id,
            profiles (id, full_name, avatar_url)
          )
        `)
        .eq("user_id", userId)
        .is("group_union_id", null)
        .is("deleted_at", null)
        .is("member.deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      return data as GroupWithProfiles[];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }
  async fetchGroupListByUnionId(
    unionId: string,
  ): Promise<GroupWithProfiles[] | null> {
    try {
      // 그룹 정보와 함께 그룹장 정보를 조인하여 가져옵니다
      const { data, error } = await this.supabaseClient
        .from("group")
        .select(`
          *,
          profiles (id, full_name, avatar_url)
        `)
        .eq("group_union_id", unionId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        Sentry.captureException(error.message);
        return [];
      }

      return data as GroupWithProfiles[];
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  async getGroup(groupId: string): Promise<GroupWithProfiles | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("group")
        .select(`
          *,
          profiles (id, full_name, avatar_url)
        `)
        .eq("id", groupId)
        .single();

      if (error) {
        Sentry.captureException(error.message);
        return null;
      }
      return data as GroupWithProfiles;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }
}

// 편의를 위한 인스턴스 기본 제공
export const groupController = new GroupController();
