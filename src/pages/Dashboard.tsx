import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Calendar, MapPin, Sparkles, FileEdit, PlayCircle, Archive, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ItineraryStatusBadge } from "@/components/ItineraryStatusBadge";
import { ItineraryActions } from "@/components/ItineraryActions";
import { ItinerarySelectionDialog } from "@/components/ItinerarySelectionDialog";
import { Header } from "@/components/Header";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItinerarySelection, setShowItinerarySelection] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadItineraries();
    }
  }, [user, authLoading, navigate]);

  const loadItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento degli itinerari");
    } finally {
      setLoading(false);
    }
  };


  const handleExperienceClick = () => {
    const inProgressItineraries = itineraries.filter(it => it.status === 'in_progress');
    
    if (inProgressItineraries.length === 0) {
      // Caso 3: Nessun itinerario in corso -> vai a creazione
      navigate("/create-itinerary");
    } else if (inProgressItineraries.length === 1) {
      // Caso 2: Un solo itinerario -> vai direttamente all'itinerario
      navigate(`/itinerary/${inProgressItineraries[0].id}`);
    } else {
      // Caso 1: Più itinerari -> mostra dialog di selezione
      setShowItinerarySelection(true);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">I Tuoi Itinerari</h2>
              <p className="text-muted-foreground">
                Gestisci e crea nuovi itinerari culturali personalizzati
              </p>
            </div>
            <Button 
              onClick={handleExperienceClick}
              className="bg-gradient-hero hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Experience
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="draft">
              <FileEdit className="w-4 h-4 mr-2" />
              Bozze
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completi
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              <PlayCircle className="w-4 h-4 mr-2" />
              In Corso
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="w-4 h-4 mr-2" />
              Archiviati
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-pointer transition-all hover:shadow-soft group"
                onClick={() => navigate("/create-itinerary")}
              >
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nuovo Itinerario</h3>
                  <p className="text-muted-foreground text-sm">
                    Crea un nuovo viaggio culturale con l'AI
                  </p>
                </CardContent>
              </Card>

              {itineraries.map((itinerary) => (
                <Card 
                  key={itinerary.id}
                  className="hover:shadow-soft transition-all group relative"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => navigate(`/itinerary/${itinerary.id}`)}>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {itinerary.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {itinerary.destination}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <ItineraryStatusBadge status={itinerary.status} />
                        <ItineraryActions 
                          itineraryId={itinerary.id}
                          currentStatus={itinerary.status}
                          onUpdate={loadItineraries}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="cursor-pointer" onClick={() => navigate(`/itinerary/${itinerary.id}`)}>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(itinerary.start_date).toLocaleDateString('it-IT')} - {new Date(itinerary.end_date).toLocaleDateString('it-IT')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {itineraries.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nessun itinerario ancora</h3>
                <p className="text-muted-foreground mb-6">
                  Inizia creando il tuo primo viaggio culturale personalizzato
                </p>
                <Button 
                  onClick={() => navigate("/create-itinerary")}
                  className="bg-gradient-hero hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crea il Tuo Primo Itinerario
                </Button>
              </div>
            )}
          </TabsContent>

          {['draft', 'approved', 'in_progress', 'archived'].map(statusFilter => (
            <TabsContent key={statusFilter} value={statusFilter}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.filter(it => it.status === statusFilter).map((itinerary) => (
                  <Card 
                    key={itinerary.id}
                    className="hover:shadow-soft transition-all group relative"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/itinerary/${itinerary.id}`)}>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {itinerary.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {itinerary.destination}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <ItineraryStatusBadge status={itinerary.status} />
                          <ItineraryActions 
                            itineraryId={itinerary.id}
                            currentStatus={itinerary.status}
                            onUpdate={loadItineraries}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="cursor-pointer" onClick={() => navigate(`/itinerary/${itinerary.id}`)}>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(itinerary.start_date).toLocaleDateString('it-IT')} - {new Date(itinerary.end_date).toLocaleDateString('it-IT')}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {itineraries.filter(it => it.status === statusFilter).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      Nessun itinerario in questa categoria
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <ItinerarySelectionDialog
          open={showItinerarySelection}
          onOpenChange={setShowItinerarySelection}
          itineraries={itineraries.filter(it => it.status === 'in_progress')}
        />
      </main>
    </div>
  );
};

export default Dashboard;
