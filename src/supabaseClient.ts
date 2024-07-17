import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";
const supabaseUrl = import.meta.env.VITE_SUPA_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPA_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
