import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Calendar, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ItineraryData {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  participants_type: string;
  specific_interests: string;
  travel_pace: string;
  ai_content: any;
  status: string;
}

const Itinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadItinerary();
    }
  }, [id]);

  const loadItinerary = async () => {
    try {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setItinerary(data);
    } catch (error: any) {
      toast.error("Errore nel caricamento dell'itinerario");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!itinerary) {
    return null;
  }

  const daysDifference = Math.ceil(
    (new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{itinerary.title}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {itinerary.destination}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(itinerary.start_date).toLocaleDateString('it-IT')} - {new Date(itinerary.end_date).toLocaleDateString('it-IT')}
              <span className="ml-2">({daysDifference} {daysDifference === 1 ? 'giorno' : 'giorni'})</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {itinerary.participants_count} {itinerary.participants_type && `(${itinerary.participants_type})`}
            </div>
          </div>
        </div>

        <Card className="shadow-elevated border-primary/20 bg-gradient-hero/5 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Generazione AI in Corso</h3>
                <p className="text-muted-foreground">
                  L'intelligenza artificiale sta creando il tuo itinerario personalizzato. 
                  Questa funzionalità sarà disponibile a breve con l'integrazione completa dell'AI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Dettagli della Richiesta</CardTitle>
            <CardDescription>Le tue preferenze per questo viaggio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Ritmo del Viaggio</h4>
              <p className="text-muted-foreground capitalize">
                {itinerary.travel_pace === 'relaxed' && 'Rilassato'}
                {itinerary.travel_pace === 'moderate' && 'Moderato'}
                {itinerary.travel_pace === 'intensive' && 'Intenso'}
              </p>
            </div>

            {itinerary.specific_interests && (
              <div>
                <h4 className="font-semibold mb-1">Interessi Specifici</h4>
                <p className="text-muted-foreground">{itinerary.specific_interests}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Creato il {new Date(itinerary.start_date).toLocaleDateString('it-IT')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border/50">
          <h3 className="font-semibold mb-2">🚧 Funzionalità in Sviluppo</h3>
          <p className="text-muted-foreground text-sm">
            Stiamo lavorando per integrare l'AI che genererà itinerari dettagliati giorno per giorno,
            con suggerimenti su musei, ristoranti, attività culturali e percorsi ottimizzati.
            Questa pagina mostrerà presto una mappa interattiva e la possibilità di modificare
            conversazionalmente il tuo itinerario.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Itinerary;
