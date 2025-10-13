import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { ItineraryCoverImage } from "@/components/ItineraryCoverImage";

interface PlatformItinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  ai_content: any;
}

export const ForYouSection = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<PlatformItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatformItineraries();
  }, []);

  const loadPlatformItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_itineraries")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setItineraries(data || []);
    } catch (error: any) {
      console.error("Error loading platform itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItineraryClick = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.info("Effettua l'accesso per visualizzare i dettagli completi");
      navigate("/auth");
      return;
    }

    toast.info("Funzionalità in arrivo!");
  };

  if (loading || itineraries.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">For You</h2>
            <p className="text-sm text-muted-foreground">Itinerari selezionati per te</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <Card 
            key={itinerary.id}
            className="group hover:shadow-soft transition-all cursor-pointer border-border/50 overflow-hidden"
            onClick={handleItineraryClick}
          >
            <ItineraryCoverImage 
              destination={itinerary.destination}
              title={itinerary.title}
            />
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Proposto
                </Badge>
              </div>
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                {itinerary.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {itinerary.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(itinerary.start_date), "dd MMM", { locale: it })} - {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: it })}
                </span>
              </div>
              
              {itinerary.ai_content?.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {itinerary.ai_content.description}
                </p>
              )}

              <Button 
                variant="ghost" 
                className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
              >
                Scopri di più
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
