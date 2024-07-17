import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "../supabaseClient";
import { User } from "@supabase/supabase-js";
import { Group } from "../types/tables";

export interface BaseStore {
  // user
  user: User | null;
  getUser: () => void;
  signOut: () => void;

  // group
  groupList: Group[] | null;
  targetGroup: Group | null;
  fetchGroupListByUserId: (userId: string) => void;
  getGroup: (groupId: string) => void;
}

const useBearStore = create<BaseStore>()(
  immer((set) => ({
    // user
    user: null,
    getUser: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set((state) => {
        state.user = session?.user || null;
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set((state) => {
          state.user = session?.user || null;
        });
      });

      return () => {
        subscription?.unsubscribe();
      };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      set((state) => {
        state.user = null;
      });
    },

    // group
    groupList: null,
    targetGroup: null,
    fetchGroupListByUserId: async (userId: string) => {
      const { error, data } = await supabase
        .from("group")
        .select("*")
        .eq("user_id", userId);
      if (error) {
        console.error("error", error);
        return;
      }
      set((state) => {
        state.groupList = data;
      });
    },
    getGroup: async (groupId: string) => {
      const { data, error } = await supabase
        .from("group")
        .select("*")
        .eq("id", groupId)
        .is("deleted_at", null)
        .single();
      if (error) {
        console.error("Error get group ID:", error);
        return null;
      }
      set((state) => {
        state.targetGroup = data;
      });
    },
  }))
);

export default useBearStore;
