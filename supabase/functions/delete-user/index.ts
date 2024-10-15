import { corsHeaders } from "../_shared/cors.ts";
import { supabase } from "../serverClient.ts";

Deno.serve(async (req) => {
  const { userId } = await req.json();
  const { data, error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
