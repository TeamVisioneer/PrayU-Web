import { supabase } from "./../../../supabase/client";
import * as Sentry from "@sentry/react";
import { GroupUnion } from "../../../supabase/types/tables";

interface CreateGroupUnionParams {
  church: string;
  name: string;
  intro: string;
}

export class GroupUnionController {
  // Class constructor can be expanded for dependency injection if needed
  constructor(private supabaseClient = supabase) {}

  async createGroupUnion(
    createGroupUnionParams: CreateGroupUnionParams,
  ): Promise<GroupUnion | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("group_union")
        .insert([createGroupUnionParams])
        .select();

      if (error) {
        Sentry.captureException(error);
        return null;
      }

      return data[0];
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async getGroupUnion(groupUnionId: string): Promise<GroupUnion | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("group_union")
        .select("*")
        .eq("id", groupUnionId)
        .single();

      if (error) {
        Sentry.captureException(error);
        return null;
      }

      return data;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async fetchGroupUnionListByUserId(
    userId: string,
  ): Promise<GroupUnion[] | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from("group_union")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        Sentry.captureException(error);
        return null;
      }

      return data;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }
}

// Export a default instance for easy usage
export const groupUnionController = new GroupUnionController();
