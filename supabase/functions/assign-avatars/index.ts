import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch real profile pictures from RandomUser API
const fetchRandomUserPhoto = async (gender?: string): Promise<string> => {
  try {
    const genderParam = gender ? `?gender=${gender.toLowerCase()}` : '';
    const response = await fetch(`https://randomuser.me/api/${genderParam}`);
    const data = await response.json();
    return data.results[0].picture.large;
  } catch (error) {
    console.error("Error fetching random user photo:", error);
    // Fallback to placeholder
    return `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70)}`;
  }
};

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
        // Fetch a real photo from RandomUser API
        const avatarUrl = await fetchRandomUserPhoto();
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", profile.user_id);

        if (updateError) {
          console.error(`Error updating profile ${profile.user_id}:`, updateError);
        } else {
          updated++;
          const displayName = profile.display_name || 
                            (profile.first_name && profile.last_name 
                              ? `${profile.first_name} ${profile.last_name}` 
                              : "User");
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