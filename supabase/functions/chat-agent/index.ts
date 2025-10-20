import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dati beni culturali calabresi
const heritageData = [
  {
    ID: "1800167442",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167442",
    Description:
      "La configurazione strutturale del fortino in esame si inquadra perfettamente nella tipologia di campo trincerato a forti e batterie staccate, analogo ad altri forti caratterizzanti l\u0027hinterland calabro e siciliano, che in termini prettamente architettonici si snoda a partire da blocchi di elementi a carattere prettamente difensivo che di norma vengono insediati e collocati in posizioni collinare proprio per garantire massimo livello di visibilit\u00E0 della costa che da sempre ha rappresentato il principale punto di accesso delle incursioni. La batteria T. Gull\u00EC \u00E8 collocata fra le batterie di media dimensione, connotata da un impianto quadrangolare accentuato da una notevole orizzontalit\u00E0 degli apparati rispetto all\u0027altezza degli stessi. Occupa una vasta area di circa 24 ettari nella contrada meglio nota come Arghill\u00E0; l\u0027accesso avviene mediante un\u0027 unica stradella, mentre i rimanenti tre lati risultano perimetralmente chiusi. Le soluzioni costruttive si uniformano a quelle delle altre costruzioni militari, realizzate in muratura mista di pietrame e laterizi. Notevole attenzione ai particolari strategici ancora oggi visibili come la caponiera situata in una delle stanze al piano terreno, dotata di una piccola finestra necessaria per la vedetta e di una botola attraverso la quale si accede alle zone sotterranee. Interessante e perfettamente conservato l\u0027alloggiamento dei cannoni situato nella zona sovrastante la collina di Arghill\u00E0",
  },
  {
    ID: "1800167417",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167417",
    Description:
      "Il faro capo dell\u0027Armi \u00E8 caratterizzato da un impianto strutturale costituito da una torre bianca ottagonale in muratura su un fabbricato a 2 piani. L\u0027ottica del faro \u00E8 costituita da lenti di Fresnel le quali ruotano intorno ad una lampada di 1000 watt; la sua altezza \u00E8 pari a 12 m, l\u0027elevazione rispetto al livello del mare \u00E8 pari a 95 m. La portata pu\u00F2 raggiungere 40 miglia ed il segnale emesso \u00E8 costituito da due lampi bianchi ad un intervallo costante di 10 secondi. Il faro rientra nella reggenza della Marina Militare Italiana ed \u00E8 presidiato da personale addetto",
  },
  {
    ID: "1800167431",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167431",
    Description:
      "Palazzo degli Uffici (XX secolo), in stile neoclassico, risulta essere un complesso architettonico di particolare interesse storico, eseguito da maestranze provinciali. Il palazzo propone una costruzione massiccia ed equilibrata, che evidenzia la sua funzione pubblica di marcata derivazione classica",
  },
  {
    ID: "1800167433",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167433",
    Description:
      "Il palazzo, si inquadra all\u0027interno di un progetto di riqualificazione edilizia avviata a partire dall\u0027approvazione del piano de Nava ed occupa una della quinte di piazza Castello. Lo stile architettonico compositivo, permeato nell\u0027impronta neoclassica si segnala per la sua imponenza; il gioco di rientranze e sporgenze della facciata principale mettono in evidenza il corpo di fabbrica centrale caratterizzato da alcune linee monumentali. La forte pendenza del terreno comporta dei dislivelli nell\u0027articolazione complessiva della struttura. Il corpo principale collegato con le altre parti da ampi corridoi e la grandiosa architettura degli esterni che contribuisce a dare un aspetto unitario e monumentale ad una struttura pensata con finalit\u00E0 di razionale distribuzione degli uffici. Il manufatto presenta una configurazione tipologica a doppia corte, chiusa con copertura a terrazza e due piani fuori terra. Il fronte principale, di forma rettangolare e delimitato verticalmente da lesene piatte di ordine ionico poste agli spigoli, si eleva su un\u0027ampia scalinata ad ordine unico, con un gigantesco colonnato ionico che scandisce le aperture. Il portale \u00E8 costituito da tre grandi aperture architravate sovrastate da tre grandi finestroni rettangolari tripartiti e chiusi da inferriate artisticamente lavorate che ripetono le stesse linee decorative dei cancelli degli ingressi. Ai suoi lati si susseguono due serie di finestre incorniciate e sormontate da un decorato cornicione lineare in aggetto al di sopra del quale si trovano decorazioni circolari incave. Il basamento in bugnato liscio contiene le aperture del seminterrato. La parte sommitale del manufatto inizia con una grandiosa trabeazione, poco sviluppata nel rilievo ma molto alta, sopra la quale poggia la ricca cornice di gronda e si conclude con un parapetto in muratura che si innalza in corrispondenza dell\u0027ingresso principale. Gli altri prospetti, di altezza maggiore per il dislivello dell\u0027isolato, ripetono le stesse linee architettoniche del prospetto principale e risultano divisi orizzontalmente da ricche cornici marcapiano",
  },
  {
    ID: "1800167506",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167506",
    Description: "torre, costiera, Torre di Gerace o Torre dei Corvi",
  },
  {
    ID: "1800167454",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167454",
    Description:
      "La configurazione strutturale primaria mostra come questo fortino sia stato elaborato in termini architettonici e compositivi, secondo il cosiddetto sistema \u0022trincerato a forti\u0022 e batterie staccate, se pur collegate tatticamente tra loro. Gli elementi primari sono il fossato, le caponiere e le rampe. La particolarit\u00E0 di questo fortino come evidente anche in altre strutture superstiti appartenenti a questa tipologia rintracciabili su territorio calabro, \u00E8 sicuramente la posizione strategica di vedetta rispetto alla costa, mantenendo occultata e non facilmente visibile la propria organizzazione strutturale interna, di modo da rendere ancor pi\u00F9 marcato il proprio carattere difensivo",
  },
  {
    ID: "1800110348",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110348",
    Description: "palazzo, Palazzo Ariani",
  },
  {
    ID: "1800006861",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006861",
    Description: "palazzo, privato, Palazzo Melissari",
  },
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
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Salve, viandante. Sono Pitagora di Samo. Che la saggezza degli antichi ti accompagni nel tuo viaggio attraverso la Magna Grecia. Come posso guidarti nella scoperta del patrimonio culturale di questa terra che ho tanto amato?",
          },
        ],
      },
    ];

    // Aggiungi la storia della conversazione
    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Payload per l'API di Google Gemini
    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    };

    console.log("Calling Google Gemini API with streaming...");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GOOGLE_API_KEY,
        },
        body: JSON.stringify(requestBody),
      },
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
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              const content = jsonData?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (content) {
                // Formatta nel formato SSE compatibile con il frontend
                const sseData = `data: ${JSON.stringify({
                  choices: [
                    {
                      delta: {
                        content: content,
                      },
                    },
                  ],
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
      },
    });

    console.log("Streaming response from Gemini...");
    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
