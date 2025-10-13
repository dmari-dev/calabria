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

    console.log(`Recupero dettagli per: ${activity} a ${destination}`);

    // 1. Recupera abstract da Wikipedia
    let detail = "Dettagli non disponibili.";
    try {
      const searchQuery = encodeURIComponent(`${activity} ${destination}`);
      const wikiSearchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`;
      
      const searchResponse = await fetch(wikiSearchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.query?.search?.[0]) {
        const pageTitle = searchData.query.search[0].title;
        const pageId = searchData.query.search[0].pageid;
        
        // Recupera il contenuto della pagina
        const contentUrl = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageId}&format=json&origin=*`;
        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();
        
        const extract = contentData.query?.pages?.[pageId]?.extract;
        if (extract) {
          // Limita a circa 300 parole
          const words = extract.split(' ').slice(0, 300);
          detail = words.join(' ') + (words.length >= 300 ? '...' : '');
        }
      }
    } catch (wikiError) {
      console.error("Errore recupero Wikipedia:", wikiError);
      detail = description || "Informazioni non disponibili al momento.";
    }

    // 2. Recupera immagine da Wikimedia Commons
    let imageUrl = "";
    try {
      const imageSearchQuery = encodeURIComponent(`${activity} ${destination}`);
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${imageSearchQuery}&srnamespace=6&format=json&origin=*&srlimit=5`;
      
      const imageSearchResponse = await fetch(commonsUrl);
      const imageSearchData = await imageSearchResponse.json();
      
      if (imageSearchData.query?.search?.[0]) {
        const imageTitle = imageSearchData.query.search[0].title;
        
        // Recupera l'URL dell'immagine
        const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
        const imageInfoResponse = await fetch(imageInfoUrl);
        const imageInfoData = await imageInfoResponse.json();
        
        const pages = imageInfoData.query?.pages;
        const pageId = Object.keys(pages || {})[0];
        imageUrl = pages?.[pageId]?.imageinfo?.[0]?.url || "";
      }
    } catch (imageError) {
      console.error("Errore recupero immagine Wikimedia:", imageError);
      // Fallback: usa un'immagine placeholder
      imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(activity)},${encodeURIComponent(destination)}`;
    }

    // 3. Cerca video su YouTube (solo URL di ricerca, nessuna API key necessaria)
    const videoSearchQuery = encodeURIComponent(`${activity} ${destination} tour guide italiano`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${videoSearchQuery}`;

    console.log(`Dettagli recuperati con successo per: ${activity}`);

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
