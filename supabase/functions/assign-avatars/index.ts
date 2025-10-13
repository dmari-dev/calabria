import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const colors = [
  "FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8",
  "F7DC6F", "BB8FCE", "85C1E2", "F8B195", "C06C84",
  "6C5B7B", "355C7D", "F67280", "C06C84", "A8E6CF",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Verify authenticated user
    const {
      data: { user },
      error: authErr,
    } = await supabaseUser.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Non autenticato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr || !roleData) {
      return new Response(JSON.stringify({ error: "User not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting avatar assignment...");

    // Get all profiles without avatar
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, first_name, last_name")
      .is("avatar_url", null);

    if (profilesError) throw profilesError;

    let updated = 0;

    for (const profile of profiles || []) {
      try {
        const displayName = profile.display_name || 
                          (profile.first_name && profile.last_name 
                            ? `${profile.first_name} ${profile.last_name}` 
                            : "User");
        
        const color = colors[updated % colors.length];
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200&background=${color}&color=fff&bold=true&format=png`;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", profile.user_id);

        if (updateError) {
          console.error(`Error updating profile ${profile.user_id}:`, updateError);
        } else {
          updated++;
          console.log(`Updated avatar for: ${displayName}`);
        }
      } catch (e) {
        console.error(`Exception for profile ${profile.user_id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Aggiornati ${updated} avatar`,
        total: profiles?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("assign-avatars error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});