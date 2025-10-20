import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  {
    ID: "1800110414",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110414",
    Description: "chiesa, privata, Chiesa del Carmine",
  },
  {
    ID: "1800110628",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110628",
    Description: "palazzo, privato, palazzo Pellegrini",
  },
  {
    ID: "1800027753",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027753",
    Description: "palazzo, privato, Palazzo Pelaia",
  },
  {
    ID: "1800027754",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027754",
    Description: "palazzo, privato, Palazzo de Masi",
  },
  {
    ID: "1800027755",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027755",
    Description: "palazzo, privato, Palazzo Cannatelli",
  },
  {
    ID: "1800027756",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027756",
    Description: "palazzo, privato, Palazzo Pistininzi",
  },
  {
    ID: "1800011250",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011250",
    Description: "palazzo, privato, Palazzo Naso",
  },
  {
    ID: "1800011251",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011251",
    Description: "palazzo, ducale, Palazzo dei Duchi di Montalto",
  },
  {
    ID: "1800154272",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800154272",
    Description: "palazzo, privato, palazzo Capria",
  },
  {
    ID: "1800009971",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009971",
    Description: "casa, privata",
  },
  {
    ID: "1800006889",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006889",
    Description: "palazzo, nobiliare, Palazzo Scordo",
  },
  {
    ID: "1800006739",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006739",
    Description: "casa, privata, Palazzo Romeo",
  },
  {
    ID: "1800011192",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011192",
    Description: "casa, privata, Casa Via Duomo part. 164",
  },
  {
    ID: "1800006916",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006916",
    Description: "palazzo, nobiliare, Crea",
  },
  {
    ID: "1800006914",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006914",
    Description: "palazzo, nobiliare, Capialbi",
  },
  {
    ID: "1800010013",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010013",
    Description: "casa, privata, Casa Sandicchi Fortunato",
  },
  {
    ID: "1800110258",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110258",
    Description: "palazzo, palazzo Cordopatri",
  },
  {
    ID: "1800010059",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010059",
    Description: "palazzo, privato, Sigill\u00F2",
  },
  {
    ID: "1800010062",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010062",
    Description: "palazzo, privato, Rodin\u00F2",
  },
  {
    ID: "1800110560",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110560",
    Description: "palazzo, privata, Palazzo Misasi",
  },
  {
    ID: "1800110252",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110252",
    Description: "palazzo, Palazzo Murmura",
  },
  {
    ID: "1800010011",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010011",
    Description: "Cemento armato e struttura di tamponamento in mattoni",
  },
  {
    ID: "1800009969",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009969",
    Description: "casa, privata, Casa via Fabio Filzi partt. 33-34-35",
  },
  {
    ID: "1800110254",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110254",
    Description: "palazzo, Palazzo d\u0027 Alcontres",
  },
  {
    ID: "1800110259",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110259",
    Description: "palazzo, Palazzo di Francia",
  },
  {
    ID: "1800010049",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010049",
    Description: "palazzo, privato, Luddeni, gi\u00E0 Tigani",
  },
  {
    ID: "1800027761",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027761",
    Description: "portale, Portale del Palazzo Argir\u00F2-Sarlo",
  },
  {
    ID: "1800006876",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006876",
    Description: "casa, privata, Casa Manganaro",
  },
  {
    ID: "1800027760",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027760",
    Description: "palazzo, privato, Palazzo Argir\u00F2 Sarlo",
  },
  {
    ID: "1800010053",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010053",
    Description: "palazzo, nobiliare, Riario-Sforza",
  },
  {
    ID: "1800010054",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010054",
    Description: "palazzo, privato, Pecora-Sansotta",
  },
  {
    ID: "1800010055",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010055",
    Description: "palazzo, privato, Palazzo Napoli (ex Rodin\u00F2)",
  },
  {
    ID: "1800010061",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010061",
    Description: "palazzo, privato, Palazzo Avati Tombato",
  },
  {
    ID: "1800006879A",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006879A",
    Description: "casa, privata, Casa Federico",
  },
  {
    ID: "1800009961",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009961",
    Description: "casa, privata, Casa via N. Sauro part. 141",
  },
  {
    ID: "1800009967",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009967",
    Description: "casa, privata, Casa via N. Sauro part.115",
  },
  {
    ID: "1800009966",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009966",
    Description: "casa, privata, Casa via Duomo",
  },
  {
    ID: "1800010060",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010060",
    Description: "palazzo, privato, Cannata",
  },
  {
    ID: "1800023423",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800023423",
    Description: "chiesa, privata, Spirito Santo",
  },
  {
    ID: "1800009976",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009976",
    Description: "casa, privata, Casa via Regina Elena part. 97",
  },
  {
    ID: "1800006901",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006901",
    Description: "villa, nobiliare, Villa Genoese Zerbi",
  },
  {
    ID: "1800027752",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027752",
    Description: "palazzo, privato, Palazzo D\u0027Elia",
  },
  {
    ID: "1800006894",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006894",
    Description: "casa, privata, Casa Mazzitelli",
  },
  {
    ID: "1800157786",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800157786",
    Description: "palazzo, privato, Palazzo Cipolla",
  },
  {
    ID: "1800010047",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010047",
    Description: "palazzo, privato, Palazzo Iemma",
  },
  {
    ID: "1800110127",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110127",
    Description: "Pietrame misto e malta",
  },
  {
    ID: "1800006880",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006880",
    Description: "palazzo, privato, Casa Mantica",
  },
  {
    ID: "1800009960",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009960",
    Description: "casa, privata, Casa vico Correggio part. 31",
  },
  {
    ID: "1800010052",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010052",
    Description: "palazzo, privato, Mileto",
  },
  {
    ID: "1800010056",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010056",
    Description: "palazzo, privato, Calcopietro",
  },
  {
    ID: "1800006816",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006816",
    Description: "palazzo, Palazzo Luly",
  },
  {
    ID: "1800010038",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010038",
    Description: "casa, popolare, Case Economiche _Isolato 78",
  },
  {
    ID: "1800009958",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009958",
    Description: "palazzo, privato",
  },
  {
    ID: "1800006742",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006742",
    Description: "casa, privata, Palazzetto Condemi",
  },
  {
    ID: "1800010042",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010042",
    Description: "casa, popolare, Case Economiche_ Isolato 55",
  },
  {
    ID: "1800006863A",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006863A",
    Description: "palazzo, privato, Casa d\u0027Angelo",
  },
  {
    ID: "1800006885",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006885",
    Description: "palazzo, privato, Palazzo Giuffr\u00E8",
  },
  {
    ID: "1800010041",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010041",
    Description: "casa, popolare, Case Economiche _ Isolato 175",
  },
  {
    ID: "1800009973",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009973",
    Description: "casa, privata, Casa via Regina Elena partt. 90 - 92",
  },
  {
    ID: "1800009974",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009974",
    Description: "casa, privata, Casa via Duomo",
  },
  {
    ID: "1800110255",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110255",
    Description: "palazzo, Palazzo Capialbi",
  },
  {
    ID: "1800110257",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110257",
    Description: "palazzo, Palazzo Romei",
  },
  {
    ID: "1800011198",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011198",
    Description: "casa, privata, Casa via Principe di Piemonte part. 184",
  },
  {
    ID: "1800009963",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009963",
    Description: "casa, privata",
  },
  {
    ID: "1800010035",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010035",
    Description: "palazzo, Palazzo Rossi",
  },
  {
    ID: "1800010058",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010058",
    Description: "palazzo, privato, Amendolea",
  },
  {
    ID: "1800010009",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010009",
    Description: "Struttura primaria in cemento armato e tamponamento in mattoni",
  },
  {
    ID: "1800110256",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110256",
    Description: "palazzo, palazzo Francica",
  },
  {
    ID: "1800006752",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006752",
    Description: "palazzo, privato, Palazzetto Romeo",
  },
  {
    ID: "1800006864",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006864",
    Description: "palazzo, Palazzo Musitano",
  },
  {
    ID: "1800010034",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010034",
    Description: "palazzo, Palazzo Montesano",
  },
  {
    ID: "1800110263",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110263",
    Description: "palazzo, Palazzo Condoleo",
  },
  {
    ID: "1800010051",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010051",
    Description: "palazzo, privato, Palazzo Valensise",
  },
  {
    ID: "1800027750",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027750",
    Description: "casa, Palazzo Galati",
  },
  {
    ID: "1800006915",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006915",
    Description: "palazzo, nobiliare, Lamberti",
  },
  {
    ID: "1800010048",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010048",
    Description: "palazzo, privato, Famiglia Cavatore",
  },
  {
    ID: "1800110201",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800110201",
    Description: "palazzo, Palazzo Marzano",
  },
  {
    ID: "1800010036",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010036",
    Description: "palazzo, privato, Casa Palmisano",
  },
  {
    ID: "1800009957",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009957",
    Description: "palazzo, privato, Palazzo via Principe di Piemonte",
  },
  {
    ID: "1800006865",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006865",
    Description: "palazzo, privato, Palazzo Nesci",
  },
  {
    ID: "1800010012",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010012",
    Description: "teatro, privato, Teatro Siracusa",
  },
  {
    ID: "1800010033",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010033",
    Description: "palazzo, privato, Casa Pavone Corso Garibaldi RC",
  },
  {
    ID: "1800006744",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006744",
    Description: "palazzo, nobiliare, Palazzo Nesci",
  },
  {
    ID: "1800006751",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006751",
    Description: "palazzo, privato, Palazzo Nucera",
  },
  {
    ID: "1800010057",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010057",
    Description: "palazzo, privato, Riolo Carbone",
  },
  {
    ID: "1800027059A",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027059A",
    Description: "castello, medievale, Castello dei Cavalieri di Malta",
  },
  {
    ID: "1800006890",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006890",
    Description: "palazzo, nobiliare, Palazzo Vitrioli",
  },
  {
    ID: "1800010040",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010040",
    Description: "palazzo, Palazzo Melissari",
  },
  {
    ID: "1800006866",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006866",
    Description: "palazzo, nobiliare, Palazzo Vilardi",
  },
  {
    ID: "1800006888",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006888",
    Description: "palazzo, nobiliare, Palazzo Rognetta",
  },
  {
    ID: "1800006910",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006910",
    Description: "Muratura mista in pietra e frammenti di mattoni",
  },
  {
    ID: "1800157782",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800157782",
    Description: "palazzo, privato, Palazzo Lattari",
  },
  {
    ID: "1800011190",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011190",
    Description: "casa, privata, Palazzo Tribuna",
  },
  {
    ID: "1800011191",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011191",
    Description: "casa, privata",
  },
  {
    ID: "1800010015",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010015",
    Description: "palazzo, privato, Casa Sandicchi Pasquale",
  },
  {
    ID: "1800027746",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027746",
    Description: "casa, Palazzo Pisano",
  },
  {
    ID: "1800027747",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027747",
    Description: "casa, Palazzo Insitari",
  },
  {
    ID: "1800009975",
    Type: "Construction, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009975",
    Description: "Edificio a pianta rettangolare articolato su due piani",
  },
  {
    ID: "1800011194",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011194",
    Description: "casa, privata, Casa via F. Filzi part. 99",
  },
  {
    ID: "1800009959",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009959",
    Description: "casa, privata, Casa vico Fandullo",
  },
  {
    ID: "1800006877",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006877",
    Description: "casa, privata, Casa Foti",
  },
  {
    ID: "1800006860",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006860",
    Description: "palazzo, Palazzo Margiotta",
  },
  {
    ID: "1800006887",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Construction",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006887",
    Description: "Struttura in legno e putrelle di ferro",
  },
  {
    ID: "1800009970",
    Type: "ArchitecturalOrLandscapeHeritage, Construction, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009970",
    Description: "casa, privata, vico Correggio part. 30",
  },
  {
    ID: "1800009964",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009964",
    Description: "Muratura mista di pietrame e malta",
  },
  {
    ID: "1800009965",
    Type: "ImmovableCulturalProperty, Construction, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800009965",
    Description: "palazzo, privato, Palazzetto via Cesare Battisti part. 126",
  },
  {
    ID: "1800011195",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011195",
    Description: "casa, privata",
  },
  {
    ID: "1800025377",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800025377",
    Description: "chiesa, Chiesa del SS. Rosario",
  },
  {
    ID: "1800006743",
    Type: "Construction, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006743",
    Description: "casa, plurifamiliare, Insediamento case: Casa Mesiano e Casa Cuppari",
  },
  {
    ID: "ICCD_MODI_0994362943961",
    Type: "ImmovableCulturalProperty, CulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/18iccd_modi_0994362943961",
    Description:
      "La localit\u00E0 del Santuario viene detta \u0022Luogo Santo\u0022 a motivo del sangue ivi versato dai Santi martiri: Dominata e i figli Senatore, Viatore e Cassiadoro nell\u2019antica \u201CArgentanum\u201D da qui la dizione \u201CMartiri Argentanesi\u201D. Durante una delle persecuzioni furono imprigionati dall\u0027autorit\u00E0 romana a motivo della loro fede cristiana e condannati a morte. I loro corpi furono sepolti al di l\u00E0 del fiume Fullone e sulla loro tomba successivamente fu costruita una piccola chiesa detta di S. Senatore. In epoca normanna le reliquie dei Santi Martiri furono portate prima nella Cattedrale di San Marco e successivamente nella chiesa della SS.ma Trinit\u00E0 a Venosa, ove \u00E8 la sepoltura di Roberto il Guiscardo. In questa chiesa nel 1603 fu fatta una ricognizione dei resti. Nel 1845 mons. Marsico, vescovo di San Marco ne chiese ed ottenne da mons. De Gattis, vescovo di Venosa, la restituzione di una buona parte di esse; attualmente sono conservate parte nella Cattedrale e parte nel Santuario, in una teca posta sotto l\u0027altare centrale. Accanto al Santuario dei Santi Martiri Argentanesi si trova una rarissima specie dell\u2019ulivo \u201COlea Europaea Leucocarpa o leucolea\u201D, l\u2019esemplare di oliva bianca, oggi \u00E8 presente essenzialmente in Calabria, veniva chiamato anche \u201Colio del Krisma\u201D ed era utilizzato oltre che nelle funzioni religiose anche nelle cerimonie per l\u2019incoronazione degli imperatori e alimentare le lampade nei luoghi sacri perch\u00E9 bruciando produce poco fumo",
  },
  {
    ID: "1800177796",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, CulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800177796",
    Description:
      "Il centro storico si divide in tre quartieri: la citt\u00E0 alta, il borghetto ed il borgo Maggiore. Il borgo Maggiore corrisponde alla parte pi\u00F9 bassa della citt\u00E0 storica, anch\u0027essa cinta da mura - parte delle quali sono ravvisabili nell\u0027andamento a scarpa delle case che costeggiano la Via Nazionale - e accessibile da quattro porte. Il Borgo Minore si trova a ridosso della porta omonina e della salita del \u0022Mergolo\u0022, all\u0027interno della cinta muraria principale della citt\u00E0. E\u0027 tagliato dalla via Roma, che corrisponde alla pi\u00F9 importante arteria di accesso alla Citt\u00E0 Alta e vede la presenza di palazzi gentilizi di un certo pregio e della chiesa di San Martino. La Citt\u00E0 Alta corrisponde al centro vero e proprio della Citt\u00E0, chiuso da mura di cinta, ospitante la Cattedrale e sormontato dalla rocca del Castello. La citt\u00E0 alta si affaccia sul Borgo Maggiore attraverso le \u0022Bombarde\u0022 e la passeggiata \u0022San Domenico\u0022. Il centro urbano \u00E8 caratterizzato da rioni la cui identit\u00E0 \u00E8 spesso collegata alla presenza di confraternite o di parrocchie; gli edifici appaiono, in massima parte, di grande rilievo e importanza, trattandosi nella maggior parte dei casi di palazzi a uno o, molto raramente, due piani con cortili interni e facciate caratterizzate da portali decorati a bugnato e balconi aggettanti. L\u0027impianto urbano \u00E8 caratterizzato da strade ad andamento irregolare, seppur quelle della parte pi\u00F9 occidentali tendano ad essere parallele al corpo della cattedrale, di dimensioni medie o piccole, con piccole piazze spesso di forma quadrilatera irregolare. Molte vie sono caratterizzate dalla presenza di archi di comunicazione tra palazzi e si nota un certo numero di \u0022lamie\u0022. Tra i rioni, la Ruga grande \u00E8 la zona pi\u00F9 ad est del centro storico ed \u00E8 caratterizzata dalla presenza di edifici di carattere signorile databili all\u0027inizio del XIX secolo, da case torri di origine medievale e da abitazioni semplici con o senza piccolo giardino. Altri rioni sono: Cittadella, Piazza, Ripa, Cannonello, San Domenico, Fosia, Judeca (cos\u00EC chiamato a causa della presenza della Sinagoga), Pracarelle, Castello. La cinta muraria medievale \u00E8 visibile in pi\u00F9 punti della citt\u00E0 nonostante molti crolli e distruzioni. La citt\u00E0 essendo naturalmente protetta non presenta una cinta muraria possente ma piuttosto un sottile recinto in pi\u00F9 parti bucato da porte di accesso e da feritoie. Le porte di accesso ancora esistenti sono: La porta di Santa Maria Egiziaca, o porta del Borghetto e la porta del Sole o Bombarde e, all\u0027interno della citt\u00E0, la Porta dei Vescovi. Non pi\u00F9 esistenti sono la Porta di Santa Lucia, quella del Mergolo, quella della Piana - o Portella -, quella di Trac\u00F2 e quella del Cofino",
  },
  {
    ID: "1800006732CS",
    Type: "ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty, Building",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006732CS",
    Description:
      "Posta in contrada \u0022Torre del Ferro\u0022 e a pianta quadrata, si sviluppa su quattro piani, il lato esterno della base misura m 8.95, interno m 6.80, al primo e secondo, piano il lato esterno misura m 7.90, al terzo m 8.95, lo spessore del muro alla base \u00E8 di m 0.95,ai piani superiori \u00E8 di 0.65. La struttura muraria \u00E8 realizzata in opus incertum, opus caementicium. La torre \u00E8 alta complessivamente m 13, la differenza di quota tra il piano terra ed il piano primo \u00E8 maggiore rispetto gli altri due. La corrispondenza del solaio del paino primo e del secondo \u00E8 una cordonatura, mentre al terzo e al piano di copertura sporge un cornicione a modanatura. Tramite una porta successivamente tamponata, e successivamente riaperta, si accede al piano terreno, in alto a sinistra di detta porta vi \u00E8 un finestrino quadrato, di epoca posteriore. Il piano terreno \u00E8 composto da un unico ambiente, largo m 508, con copertura a volta, sul lato destro si accede, tramite una porta parzialmente diroccata e ostruita",
  },
  {
    ID: "1800006856A",
    Type: "Building, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006856A",
    Description: "cemento armato",
  },
  {
    ID: "1800167524",
    Type: "Building, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167524",
    Description:
      "Edificio in muratura portante mista, con solai del primo piano voltati e tetto in cemento armato. Molti sono gli interventi in cemento armato visibili",
  },
  {
    ID: "1800027721",
    Type: "Building, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800027721",
    Description: "Mattoni e cemento armato",
  },
  {
    ID: "1800167519",
    Type: "ArchitecturalOrLandscapeHeritage, Building, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167519",
    Description: "L\u0027edificio \u00E8 con struttura in muratura ordinaria",
  },
  {
    ID: "ICCD_MODI_1031911411961",
    Type: "ArchitecturalOrLandscapeHeritage, CulturalProperty, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/18iccd_modi_1031911411961",
    Description:
      "Il Santuario della Madonna del Ponte si trova ai piedi del colle di Squillace, fuori dall\u0027abitato, circondato da ulivi, aranci, siepi e rovi, allietato dallo scroscio dei due fiumi che lo circondano, l\u2019Alessi e il Ghetterello, che si uniscono (sotto un ponte) per sfociare insieme nello Jonio. Nell\u2019alto medioevo, prima dell\u2019edificazione del Santuario, si trovava in questi luoghi un cenobio forse di origine basiliana",
  },
  {
    ID: "1800174315",
    Type: "ArchitecturalOrLandscapeHeritage, CulturalProperty, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800174315",
    Description:
      "CARATTERIZZAZIONE DEL TERRITORIO: il territorio di Laino Borgo, posto lungo il confine meridionale della Lucania, nella conca montuosa che culmina ad ovest col Monte Rossino (m 1.168) e Ciagola (m 1.463) ad est col Pollino (m 2.248), passa dai 1.264 metri del monte Gada ai 237 metri della parte inferiore del Lao, che col fiume Iannello rappresenta il principale sistema idrico del territorio. Il territorio lainese \u00E8 ricco di sorgenti e vene d\u2019acqua, freschissime e potabili, che creano luoghi incantevoli e suggestivi. CARATTERI IDROGEOLOGICI: Il centro abitato, posto a quota 270 m s.l.m., \u00E8 ubicato in destra idrografica del Fiume Lao, e poggia su terreni quasi pianeggianti. L\u2019area urbana insiste su depositi alluvionali recenti e su sedimenti fluvio-lacustri del Mercure. Il paese non presenta particolari problemi di stabilit\u00E0, ad eccezione di alcuni modesti cedimenti sulle sponde del Fiume Lao. A circa 1 km a Nord Ovest del paese si segnalano alcuni movimenti franosi. Il territorio di Laino Borgo \u00E8 attraversato da diversi affluenti del Lao. Uno dei pi\u00F9 importanti, il Fosso Iannello, si unisce al Fiume Lao proprio nei pressi del centro abitato. Le carte geologiche riportano l\u2019asta fluviale del Mercure come inondabile. Dati storici riportano diversi eventi alluvionali provocati dal Fiume Lao e dal Fosso Iannello. ALTRI SISTEMI: nei vicoli del centro si ammirano numerosi edifici nobiliari dei secoli XVI-XIX, interessanti, oltre che dal punto di vista storico anche a livello architettonico, per le loro armoniose chiostrine e soprattutto per i bei davanzali e portali litici scolpiti, recanti gli stemmi delle famiglie originarie. BENI CULTURALI DA VALORIZZARE: Casa natia Beato Pietro Paolo Navarro, Casa Carlo V, Casa Gioia, Casa natia Biagio Longo",
  },
  {
    ID: "1800006882",
    Type: "Building, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006882",
    Description: "Muratura collaborante",
  },
  {
    ID: "1800010037",
    Type: "ArchitecturalOrLandscapeHeritage, Building, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800010037",
    Description: "palazzo, Palazzo della Congrega di Ges\u00F9 e Maria",
  },
  {
    ID: "1800006858",
    Type: "Building, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006858",
    Description: "Struttura a telaio in cemento armato",
  },
  {
    ID: "1800006709A",
    Type: "Building, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800006709A",
    Description: "casa, part. 290",
  },
  {
    ID: "1800167515",
    Type: "Building, ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167515",
    Description: "Edificio in muratura portante mista e solai voltati",
  },
  {
    ID: "1800022775A",
    Type: "Building, ArchitecturalOrLandscapeHeritage, ImmovableCulturalProperty",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800022775A",
    Description: "chiesa, parrocchiale, Chiesa di Sant\u0027Anna",
  },
  {
    ID: "1800011249",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Building",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800011249",
    Description: "palazzo, privato, Palazzo Cipriani",
  },
  {
    ID: "1800157845",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Building",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800157845",
    Description: "Edificio in muratura continua con androne coperto da volta a botte",
  },
  {
    ID: "1800157566",
    Type: "ImmovableCulturalProperty, Building, ArchitecturalOrLandscapeHeritage",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800157566",
    Description: "Struttura portante in muratura comune e legante di malta di calce",
  },
  {
    ID: "1800167517",
    Type: "ImmovableCulturalProperty, ArchitecturalOrLandscapeHeritage, Building",
    URL: "https://dati.beniculturali.it/lodview-arco/resource/ArchitecturalOrLandscapeHeritage/1800167517",
    Description: "Edificio ad un piano in muratura portante e tetto a falde in legno",
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting chat with Google Gemini...");

    // System prompt come Pitagora con i dati dei beni culturali
    const systemPrompt = `Sei Pitagora di Samo, il grande filosofo e matematico greco che visse in Magna Grecia, nell'attuale Calabria.
Parla in prima persona come se fossi veramente Pitagora, condividi la tua saggezza antica e il tuo amore per la matematica, la filosofia e l'armonia.

Hai accesso a informazioni dettagliate sui beni culturali della Calabria, la terra dove hai vissuto e insegnato:
${JSON.stringify(heritageData, null, 2)}

Quando l'utente ti fa domande sui luoghi culturali, consulta gli URL nei dati per fornire informazioni accurate e dettagliate ma NON risultare troppo prolisso.

Il tuo compito è:
1. Aiutare gli utenti a scoprire il patrimonio culturale calabrese con la saggezza di un filosofo antico
2. Condividere aneddoti e riflessioni sulla Magna Grecia e la tua vita in Calabria
3. Guidare gli utenti nella pianificazione di viaggi culturali, sempre mantenendo il tuo carattere filosofico
4. Rispondere sempre in italiano, con un tono saggio, colto ma accessibile

Ricorda: sei Pitagora, quindi incorpora elementi della tua filosofia (numeri, armonia, musica delle sfere) nelle tue risposte quando appropriato.`;

    // Costruisce i messaggi per Lovable AI e raccoglie estratti dalle fonti
    const fetchText = async (url: string): Promise<string> => {
      try {
        const r = await fetch(url, { headers: { Accept: "text/html,application/xhtml+xml" } });
        const html = await r.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return text.slice(0, 1200);
      } catch (_e) {
        return "";
      }
    };

    const sources = await Promise.all(heritageData.map(async (h) => ({ url: h.URL, snippet: await fetchText(h.URL) })));

    const sourcesText = sources
      .map((s) => (s.snippet ? `Fonte: ${s.url}\n${s.snippet}` : `Fonte: ${s.url}\n(nessun estratto disponibile)`))
      .join("\n\n");

    const systemPitagora = `${systemPrompt}\n\nUsa le seguenti fonti come riferimento prioritario (cita sempre l'URL pertinente):\n${sourcesText}`;

    const llmMessages = [
      { role: "system", content: systemPitagora },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    // requestBody rimosso: usiamo Lovable AI Gateway con llmMessages e streaming

    console.log("Calling Lovable AI Gateway with streaming...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: llmMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Proxy diretto dello stream del Lovable AI Gateway (formato OpenAI SSE)
    console.log("Proxying AI gateway stream...");
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
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
