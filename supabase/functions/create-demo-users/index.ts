import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    console.log("Creating demo users...");
    const results = [];

    // Admin user
    const adminEmail = "amministratore@culture.it";
    const adminPassword = "dev@1234";
    
    try {
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          display_name: "Amministratore Sistema",
        },
      });

      if (adminError) {
        console.error("Admin user error:", adminError);
        results.push({ email: adminEmail, status: "error", message: adminError.message });
      } else {
        console.log("Admin user created successfully");
        results.push({ email: adminEmail, status: "success" });
      }
    } catch (e) {
      console.error("Admin user exception:", e);
      results.push({ email: adminEmail, status: "error", message: String(e) });
    }

    // Normal user
    const userEmail = "user@culture.it";
    const userPassword = "culture@1234";
    
    try {
      const { data: normalUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          display_name: "Utente Demo",
        },
      });

      if (userError) {
        console.error("Normal user error:", userError);
        results.push({ email: userEmail, status: "error", message: userError.message });
      } else {
        console.log("Normal user created successfully");
        results.push({ email: userEmail, status: "success" });
      }
    } catch (e) {
      console.error("Normal user exception:", e);
      results.push({ email: userEmail, status: "error", message: String(e) });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo users creation completed",
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-demo-users error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});