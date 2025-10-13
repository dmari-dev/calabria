import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sampleUsers = [
  { firstName: "Marco", lastName: "Rossi", email: "marco.rossi@example.it", city: "Milano", profession: "Ingegnere", phone: "+39 333 1234567" },
  { firstName: "Laura", lastName: "Bianchi", email: "laura.bianchi@example.it", city: "Roma", profession: "Architetto", phone: "+39 334 2345678" },
  { firstName: "Giuseppe", lastName: "Verdi", email: "giuseppe.verdi@example.it", city: "Napoli", profession: "Medico", phone: "+39 335 3456789" },
  { firstName: "Anna", lastName: "Ferrari", email: "anna.ferrari@example.it", city: "Torino", profession: "Avvocato", phone: "+39 336 4567890" },
  { firstName: "Francesco", lastName: "Russo", email: "francesco.russo@example.it", city: "Firenze", profession: "Professore", phone: "+39 337 5678901" },
  { firstName: "Sofia", lastName: "Romano", email: "sofia.romano@example.it", city: "Bologna", profession: "Designer", phone: "+39 338 6789012" },
  { firstName: "Alessandro", lastName: "Gallo", email: "alessandro.gallo@example.it", city: "Venezia", profession: "Fotografo", phone: "+39 339 7890123" },
  { firstName: "Giulia", lastName: "Conti", email: "giulia.conti@example.it", city: "Genova", profession: "Giornalista", phone: "+39 340 8901234" },
  { firstName: "Matteo", lastName: "Marino", email: "matteo.marino@example.it", city: "Palermo", profession: "Chef", phone: "+39 341 9012345" },
  { firstName: "Chiara", lastName: "Greco", email: "chiara.greco@example.it", city: "Bari", profession: "Insegnante", phone: "+39 342 0123456" },
  { firstName: "Lorenzo", lastName: "Bruno", email: "lorenzo.bruno@example.it", city: "Catania", profession: "Musicista", phone: "+39 343 1234567" },
  { firstName: "Valentina", lastName: "Ricci", email: "valentina.ricci@example.it", city: "Verona", profession: "Psicologa", phone: "+39 344 2345678" },
  { firstName: "Davide", lastName: "Costa", email: "davide.costa@example.it", city: "Padova", profession: "Programmatore", phone: "+39 345 3456789" },
  { firstName: "Alessia", lastName: "Fontana", email: "alessia.fontana@example.it", city: "Trieste", profession: "Biologa", phone: "+39 346 4567890" },
  { firstName: "Luca", lastName: "Caruso", email: "luca.caruso@example.it", city: "Perugia", profession: "Commercialista", phone: "+39 347 5678901" },
  { firstName: "Martina", lastName: "Lombardi", email: "martina.lombardi@example.it", city: "Cagliari", profession: "Farmacista", phone: "+39 348 6789012" },
  { firstName: "Simone", lastName: "Moretti", email: "simone.moretti@example.it", city: "Brescia", profession: "Geometra", phone: "+39 349 7890123" },
  { firstName: "Elena", lastName: "Barbieri", email: "elena.barbieri@example.it", city: "Parma", profession: "Veterinaria", phone: "+39 350 8901234" },
  { firstName: "Andrea", lastName: "Colombo", email: "andrea.colombo@example.it", city: "Modena", profession: "Consulente", phone: "+39 351 9012345" },
  { firstName: "Federica", lastName: "Esposito", email: "federica.esposito@example.it", city: "Salerno", profession: "Nutrizionista", phone: "+39 352 0123456" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Client as the user (to read JWT)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Service client for admin operations
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

    console.log("Starting user seeding...");
    const createdUsers = [];

    for (const userData of sampleUsers) {
      try {
        // Create auth user
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: "Culture@2025",
          email_confirm: true,
          user_metadata: {
            display_name: `${userData.firstName} ${userData.lastName}`,
          },
        });

        if (createError) {
          console.error(`Error creating user ${userData.email}:`, createError);
          continue;
        }

        console.log(`Created auth user: ${userData.email}`);

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            user_id: authUser.user.id,
            display_name: `${userData.firstName} ${userData.lastName}`,
            first_name: userData.firstName,
            last_name: userData.lastName,
            city: userData.city,
            profession: userData.profession,
            phone: userData.phone,
            country: "Italia",
          });

        if (profileError) {
          console.error(`Error creating profile for ${userData.email}:`, profileError);
        } else {
          console.log(`Created profile for: ${userData.email}`);
          createdUsers.push({
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
          });
        }
      } catch (e) {
        console.error(`Exception for user ${userData.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Creati ${createdUsers.length} utenti su ${sampleUsers.length}`,
        users: createdUsers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-users error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});