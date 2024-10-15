import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.3";

const supabaseProjectURL = Deno.env.get("SUPA_PROJECT_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPA_SERVICE_ROLE_KEY")!;

export const supabase = createClient(
  supabaseProjectURL,
  supabaseServiceRoleKey,
);
