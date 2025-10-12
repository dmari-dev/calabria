import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Calendar, MapPin, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

  const handleSignOut = async () => {
    await signOut();
    toast.success("Disconnesso con successo");
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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Itinerari Intelligenti</h1>
              <p className="text-sm text-muted-foreground">Benvenuto, {user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">I Tuoi Itinerari</h2>
          <p className="text-muted-foreground">
            Gestisci e crea nuovi itinerari culturali personalizzati
          </p>
        </div>

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
              className="hover:shadow-soft transition-all cursor-pointer group"
              onClick={() => navigate(`/itinerary/${itinerary.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {itinerary.title}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {itinerary.destination}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    itinerary.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {itinerary.status === 'completed' ? 'Completato' : 'Bozza'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
      </main>
    </div>
  );
};

export default Dashboard;
