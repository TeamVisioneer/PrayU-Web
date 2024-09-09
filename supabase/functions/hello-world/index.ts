import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const data = {
    message: `Hello world!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

// import { createClient } from "@supabase/supabase-js";

// Deno.serve(req, res) {
//   console.log("deleteUser");
//   const { userId } = req.body;
//   const supabaseAdminKey = process.env.VITE_SUPA_SERVICE_ROLE;
//   const supabaseUrl = process.env.VITE_SUPA_PROJECT_URL;
//   if (!supabaseUrl) {
//     return res.status(500).json({ error: "Supabase URL is not defined." });
//   }
//   if (!supabaseAdminKey) {
//     return res
//       .status(500)
//       .json({ error: "Supabase Admin Key is not defined." });
//   }
//   const supabase = createClient(supabaseUrl, supabaseAdminKey);

//   const { data, error } = await supabase.auth.admin.deleteUser(userId);

//   if (error) {
//     return res.status(500).json({ error: error.message });
//   }

//   res.status(200).json({ message: "User deleted successfully", data });
// }
