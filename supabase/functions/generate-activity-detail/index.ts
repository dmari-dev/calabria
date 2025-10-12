import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activity, description, destination } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Sei una guida turistica esperta. Fornisci informazioni dettagliate, interessanti e coinvolgenti sui luoghi turistici, includendo curiosità storiche, culturali e pratiche.`;

    const userPrompt = `Fornisci un abstract dettagliato (circa 200-300 parole) su "${activity}" a ${destination}.

Descrizione base: ${description}

Includi:
- Storia e contesto culturale
- Curiosità interessanti e aneddoti
- Cosa aspettarsi durante la visita
- Dettagli architettonici o naturali rilevanti
- Consigli per apprezzare al meglio l'esperienza

Scrivi in italiano con un tono coinvolgente ma informativo.`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Troppi tentativi. Riprova tra qualche minuto.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Crediti esauriti. Contatta il supporto.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Errore dal gateway AI");
    }

    const data = await response.json();
    const detail = data.choices?.[0]?.message?.content || "Dettagli non disponibili.";

    // Genera un'immagine per l'attività
    const imagePrompt = `Create a high-quality, photorealistic image of ${activity} in ${destination}. The image should capture the essence and beauty of this location, showing architectural details, cultural atmosphere, and natural surroundings. Style: professional travel photography, vivid colors, good lighting.`;
    
    let imageUrl = "";
    
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
      }
    } catch (imageError) {
      console.error("Error generating image:", imageError);
      // Continue without image if generation fails
    }

    // Cerca video su YouTube
    const videoSearchQuery = encodeURIComponent(`${activity} ${destination} tour guide`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${videoSearchQuery}`;

    return new Response(
      JSON.stringify({ 
        detail, 
        imageUrl,
        youtubeSearchUrl 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-activity-detail:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
