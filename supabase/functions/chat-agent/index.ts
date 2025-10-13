import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Chat agent function called");
  
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing chat request...");
    const { messages } = await req.json();
    console.log("Received messages:", messages?.length || 0);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting chat with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Sei un assistente virtuale esperto in viaggi culturali italiani chiamato CulturExperience Agent.

La tua missione è aiutare gli utenti a pianificare il loro viaggio culturale perfetto seguendo questo processo:

1. RACCOLTA DESTINAZIONE:
   - Quando l'utente ti dice dove vuole andare o cosa vuole fare, conferma la destinazione
   - Se non è chiara, fai domande per capire meglio

2. RACCOLTA PREFERENZE (fai UNA domanda alla volta, conversazione naturale):
   - Date del viaggio (quando vorrebbero partire e tornare)
   - Numero di partecipanti
   - Tipo di partecipanti (singolo, coppia, famiglia, gruppo amici)
   - Ritmo di viaggio (rilassato, moderato, intenso)
   - Interessi specifici (arte, storia, gastronomia, natura, architettura, etc.)

3. PROPOSTA FINALE:
   - Una volta raccolte almeno 4-5 informazioni chiave, riassumi ciò che hai capito
   - Spiega che puoi creare un itinerario personalizzato dettagliato
   - Invita l'utente a registrarsi per salvare e personalizzare ulteriormente l'itinerario
   - Usa un tono entusiasta ma professionale

IMPORTANTE:
- Fai UNA domanda alla volta per mantenere la conversazione naturale
- Sii conciso e amichevole
- Usa emoji occasionalmente per rendere la conversazione più vivace
- Se l'utente salta una domanda, va bene, passa alla successiva
- Rispondi sempre in italiano` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Troppi messaggi, riprova tra poco." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Crediti insufficienti." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Errore nel servizio AI" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from AI...");
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Errore sconosciuto" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
