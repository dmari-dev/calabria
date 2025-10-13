import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sampleUsers = [
  { firstName: "Marco", lastName: "Rossi", email: "marco.rossi@example.it", city: "Milano", profession: "Ingegnere", phone: "+39 333 1234567", address: "Via Dante 15", company: "TechItalia SpA", bio: "Appassionato di tecnologia e viaggi culturali", birthDate: "1985-03-15" },
  { firstName: "Laura", lastName: "Bianchi", email: "laura.bianchi@example.it", city: "Roma", profession: "Architetto", phone: "+39 334 2345678", address: "Piazza Navona 8", company: "Studio Architettura Bianchi", bio: "Amo l'arte e la storia dell'architettura italiana", birthDate: "1990-07-22" },
  { firstName: "Giuseppe", lastName: "Verdi", email: "giuseppe.verdi@example.it", city: "Napoli", profession: "Medico", phone: "+39 335 3456789", address: "Via Toledo 42", company: "Ospedale San Carlo", bio: "Medico specializzato in cardiologia", birthDate: "1978-11-30" },
  { firstName: "Anna", lastName: "Ferrari", email: "anna.ferrari@example.it", city: "Torino", profession: "Avvocato", phone: "+39 336 4567890", address: "Corso Vittorio Emanuele 33", company: "Studio Legale Ferrari", bio: "Avvocato civilista con passione per i diritti umani", birthDate: "1988-05-14" },
  { firstName: "Francesco", lastName: "Russo", email: "francesco.russo@example.it", city: "Firenze", profession: "Professore", phone: "+39 337 5678901", address: "Via dei Calzaiuoli 12", company: "Università di Firenze", bio: "Docente di storia dell'arte rinascimentale", birthDate: "1975-09-08" },
  { firstName: "Sofia", lastName: "Romano", email: "sofia.romano@example.it", city: "Bologna", profession: "Designer", phone: "+39 338 6789012", address: "Via Zamboni 28", company: "CreativeHub Bologna", bio: "Designer grafica freelance specializzata in branding", birthDate: "1992-02-18" },
  { firstName: "Alessandro", lastName: "Gallo", email: "alessandro.gallo@example.it", city: "Venezia", profession: "Fotografo", phone: "+39 339 7890123", address: "Fondamenta Nove 45", company: "Studio Fotografico Gallo", bio: "Fotografo professionista di paesaggi veneziani", birthDate: "1987-06-25" },
  { firstName: "Giulia", lastName: "Conti", email: "giulia.conti@example.it", city: "Genova", profession: "Giornalista", phone: "+39 340 8901234", address: "Via XX Settembre 18", company: "Il Secolo XIX", bio: "Giornalista di cultura e spettacolo", birthDate: "1991-12-03" },
  { firstName: "Matteo", lastName: "Marino", email: "matteo.marino@example.it", city: "Palermo", profession: "Chef", phone: "+39 341 9012345", address: "Via Maqueda 67", company: "Ristorante Il Gattopardo", bio: "Chef stellato specializzato in cucina siciliana", birthDate: "1983-04-20" },
  { firstName: "Chiara", lastName: "Greco", email: "chiara.greco@example.it", city: "Bari", profession: "Insegnante", phone: "+39 342 0123456", address: "Corso Cavour 55", company: "Liceo Classico Orazio Flacco", bio: "Insegnante di lettere classiche", birthDate: "1989-08-11" },
  { firstName: "Lorenzo", lastName: "Bruno", email: "lorenzo.bruno@example.it", city: "Catania", profession: "Musicista", phone: "+39 343 1234567", address: "Via Etnea 234", company: "Teatro Bellini", bio: "Violinista dell'orchestra del Teatro Bellini", birthDate: "1986-01-27" },
  { firstName: "Valentina", lastName: "Ricci", email: "valentina.ricci@example.it", city: "Verona", profession: "Psicologa", phone: "+39 344 2345678", address: "Via Mazzini 9", company: "Studio Psicologia Ricci", bio: "Psicologa clinica e psicoterapeuta", birthDate: "1984-10-16" },
  { firstName: "Davide", lastName: "Costa", email: "davide.costa@example.it", city: "Padova", profession: "Programmatore", phone: "+39 345 3456789", address: "Via del Santo 14", company: "SoftwareLab Srl", bio: "Full-stack developer appassionato di AI", birthDate: "1993-03-05" },
  { firstName: "Alessia", lastName: "Fontana", email: "alessia.fontana@example.it", city: "Trieste", profession: "Biologa", phone: "+39 346 4567890", address: "Piazza Unità d'Italia 3", company: "Istituto di Ricerca Marina", bio: "Biologa marina specializzata in ecosistemi costieri", birthDate: "1990-07-19" },
  { firstName: "Luca", lastName: "Caruso", email: "luca.caruso@example.it", city: "Perugia", profession: "Commercialista", phone: "+39 347 5678901", address: "Corso Vannucci 87", company: "Studio Caruso & Associati", bio: "Commercialista e consulente fiscale", birthDate: "1981-11-23" },
  { firstName: "Martina", lastName: "Lombardi", email: "martina.lombardi@example.it", city: "Cagliari", profession: "Farmacista", phone: "+39 348 6789012", address: "Via Roma 156", company: "Farmacia Centrale", bio: "Farmacista con master in fitoterapia", birthDate: "1988-05-30" },
  { firstName: "Simone", lastName: "Moretti", email: "simone.moretti@example.it", city: "Brescia", profession: "Geometra", phone: "+39 349 7890123", address: "Via Musei 21", company: "Studio Tecnico Moretti", bio: "Geometra specializzato in ristrutturazioni", birthDate: "1987-09-12" },
  { firstName: "Elena", lastName: "Barbieri", email: "elena.barbieri@example.it", city: "Parma", profession: "Veterinaria", phone: "+39 350 8901234", address: "Strada della Repubblica 44", company: "Clinica Veterinaria Parma", bio: "Veterinaria specializzata in animali domestici", birthDate: "1985-02-28" },
  { firstName: "Andrea", lastName: "Colombo", email: "andrea.colombo@example.it", city: "Modena", profession: "Consulente", phone: "+39 351 9012345", address: "Via Emilia 99", company: "Colombo Consulting", bio: "Consulente aziendale per PMI", birthDate: "1982-12-07" },
  { firstName: "Federica", lastName: "Esposito", email: "federica.esposito@example.it", city: "Salerno", profession: "Nutrizionista", phone: "+39 352 0123456", address: "Lungomare Trieste 12", company: "Studio Nutrizione Esposito", bio: "Nutrizionista sportiva certificata", birthDate: "1991-06-14" },
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
            address: userData.address,
            company: userData.company,
            bio: userData.bio,
            birth_date: userData.birthDate,
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