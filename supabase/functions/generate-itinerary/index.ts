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
    const { itineraryId, chatContext } = await req.json();

    if (!itineraryId) {
      throw new Error("itineraryId è richiesto");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Recupera i dettagli dell'itinerario
    const { data: itinerary, error: fetchError } = await supabaseClient
      .from("itineraries")
      .select("*")
      .eq("id", itineraryId)
      .single();

    if (fetchError) {
      console.error("Errore recupero itinerario:", fetchError);
      throw new Error("Impossibile recuperare l'itinerario");
    }

    console.log("Generazione itinerario per:", itinerary);

    // Estrai la durata dal chatContext - PRIORITÀ ALLA CONVERSAZIONE
    let days =
      Math.ceil(
        (new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    // Estrai il numero di giorni dalla conversazione con pattern multipli
    if (chatContext && chatContext.length > 0) {
      const conversationText = chatContext.map((msg: any) => msg.content).join(" ");
      // Cerca pattern: "X giorni", "X giorno", "per X giorni"
      const daysMatch = conversationText.match(/(?:per\s+)?(\d+)\s*giorn[oi]/i);
      if (daysMatch) {
        days = parseInt(daysMatch[1]);
        console.log("Durata ESATTA estratta dalla chat:", days, "giorni");
      }
    }

    // Prepara il prompt per l'AI
    const systemPrompt = `Sei un esperto di viaggi culturali in Italia. Crea itinerari dettagliati, autentici e personalizzati che valorizzano il patrimonio culturale italiano.`;

    // Prepara il contesto della conversazione se presente
    let conversationContext = "";
    if (chatContext && chatContext.length > 0) {
      conversationContext = `\n\nContesto della conversazione con l'utente:\n${chatContext.map((msg: any) => `${msg.role === "user" ? "Utente" : "Pitagora"}: ${msg.content}`).join("\n")}\n\nBASANDOTI sulla conversazione sopra, crea un itinerario che includa i luoghi e le esperienze discusse.`;
    }

    const userPrompt = `ATTENZIONE CRITICA: L'itinerario DEVE contenere ESATTAMENTE ${days} giorni. VERIFICA SEMPRE che l'array "days" contenga esattamente ${days} elementi.

Crea un itinerario per ${itinerary.destination}.

Dettagli del viaggio:
- Durata: ESATTAMENTE ${days} giorni (dal ${new Date(itinerary.start_date).toLocaleDateString("it-IT")} al ${new Date(itinerary.end_date).toLocaleDateString("it-IT")})
- Partecipanti: ${itinerary.participants_count} ${itinerary.participants_type || "persone"}
- Ritmo di viaggio: ${itinerary.travel_pace === "relaxed" ? "rilassato" : itinerary.travel_pace === "moderate" ? "moderato" : "intenso"}
- Interessi specifici: ${itinerary.specific_interests || "cultura generale"}${conversationContext}

Struttura l'itinerario in formato JSON con questa struttura:
{
  "overview": "Una panoramica generale dell'itinerario (2-3 frasi)",
  "highlights": ["punto saliente 1", "punto saliente 2", "punto saliente 3"],
  "days": [
    // DEVE contenere ESATTAMENTE ${days} elementi, da day: 1 a day: ${days}
    {
      "day": 1,
      "title": "Titolo della giornata",
      "activities": [
        {
          "time": "09:00",
          "title": "Nome attività",
          "description": "Descrizione dettagliata",
          "duration": "2 ore",
          "tips": "Consigli pratici"
        }
      ]
    }
    // ... fino a day: ${days}
  ],
  "practical_info": {
    "best_time": "Periodo migliore per visitare",
    "getting_around": "Come spostarsi",
    "budget_tips": "Consigli sul budget",
    "local_cuisine": "Piatti tipici da provare"
  }
}

Includi attività culturali autentiche, musei, monumenti, esperienze gastronomiche locali e momenti di immersione nel patrimonio italiano. Sii specifico con orari, luoghi e consigli pratici.

REGOLE CRITICHE (NON NEGOZIABILI):
1. DURATA: L'array "days" DEVE avere ESATTAMENTE ${days} elementi (da 1 a ${days})
2. CONTA I GIORNI: Prima di rispondere, conta che ci siano esattamente ${days} giorni nell'itinerario
3. LUOGHI: Utilizza SOLO i luoghi e i beni culturali menzionati durante la conversazione con l'utente
4. NON inventare luoghi nuovi, NON usare esempi generici
5. Distribuisci i luoghi discussi nei ${days} giorni dell'itinerario

VERIFICA FINALE: Prima di generare la risposta, CONTROLLA che l'array "days" contenga ESATTAMENTE ${days} elementi.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY non configurata");
    }

    // Chiama Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore AI gateway:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite di richieste superato, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti insufficienti per Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Errore nella generazione AI");
    }

    const aiResponse = await response.json();
    const generatedContent = JSON.parse(aiResponse.choices[0].message.content);

    console.log("Contenuto AI generato:", generatedContent);

    // Aggiorna l'itinerario con il contenuto generato
    const { error: updateError } = await supabaseClient
      .from("itineraries")
      .update({
        ai_content: generatedContent,
        status: "in_progress",
      })
      .eq("id", itineraryId);

    if (updateError) {
      console.error("Errore aggiornamento itinerario:", updateError);
      throw new Error("Impossibile salvare l'itinerario generato");
    }

    return new Response(JSON.stringify({ success: true, content: generatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Errore in generate-itinerary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
