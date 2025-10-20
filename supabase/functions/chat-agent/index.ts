import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dati beni culturali calabresi
const heritageData = [
  {
    "ID": "1800167442",
    "URL": "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167442",
  },
  {
    "ID": "1800167417",
    "URL": "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167417",
  },
  {
    "ID": "1800167431",
    "URL": "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167431",
  }
];

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
    
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    console.log("Starting chat with Google Gemini...");

    // System prompt come Pitagora con i dati dei beni culturali
    const systemPrompt = `Sei Pitagora di Samo, il grande filosofo e matematico greco che visse in Magna Grecia, nell'attuale Calabria.
Parla in prima persona come se fossi veramente Pitagora, condividi la tua saggezza antica e il tuo amore per la matematica, la filosofia e l'armonia.

Hai accesso a informazioni dettagliate sui beni culturali della Calabria, la terra dove hai vissuto e insegnato:
${JSON.stringify(heritageData, null, 2)}

Quando l'utente ti fa domande sui luoghi culturali, consulta gli URL nei dati per fornire informazioni accurate e dettagliate.

Il tuo compito è:
1. Aiutare gli utenti a scoprire il patrimonio culturale calabrese con la saggezza di un filosofo antico
2. Condividere aneddoti e riflessioni sulla Magna Grecia e la tua vita in Calabria
3. Guidare gli utenti nella pianificazione di viaggi culturali, sempre mantenendo il tuo carattere filosofico
4. Rispondere sempre in italiano, con un tono saggio, colto ma accessibile

Ricorda: sei Pitagora, quindi incorpora elementi della tua filosofia (numeri, armonia, musica delle sfere) nelle tue risposte quando appropriato.`;

    // Costruisce la storia della conversazione per Google Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Salve, viandante. Sono Pitagora di Samo. Che la saggezza degli antichi ti accompagni nel tuo viaggio attraverso la Magna Grecia. Come posso guidarti nella scoperta del patrimonio culturale di questa terra che ho tanto amato?" }]
      }
    ];

    // Aggiungi la storia della conversazione
    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    // Payload per l'API di Google Gemini con grounding
    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: "MODE_DYNAMIC"
          }
        }
      }]
    };

    console.log("Calling Google Gemini API with streaming...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GOOGLE_API_KEY}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Gemini API error:", response.status, errorText);
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    // Crea uno stream transformer per convertire il formato di Google in SSE compatibile
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              const content = jsonData?.candidates?.[0]?.content?.parts?.[0]?.text;
              
              if (content) {
                // Formatta nel formato SSE compatibile con il frontend
                const sseData = `data: ${JSON.stringify({
                  choices: [{
                    delta: {
                      content: content
                    }
                  }]
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(sseData));
              }
            } catch (e) {
              console.error("Error parsing SSE line:", e);
            }
          }
        }
      },
      flush(controller) {
        // Segnala la fine dello stream
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      }
    });

    console.log("Streaming response from Gemini...");
    return new Response(response.body?.pipeThrough(transformStream), {
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
