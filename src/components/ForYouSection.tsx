import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Calendar, MapPin, ArrowRight, Landmark, Plus } from "lucide-react";
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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    loadPlatformItineraries();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">Itinerari per te</h2>
          <p className="text-sm text-muted-foreground">Itinerari selezionati per te</p>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {itineraries.map((itinerary) => (
            <CarouselItem key={itinerary.id} className="md:basis-1/2 lg:basis-1/3">
              <Card 
                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden h-full flex flex-col"
                style={{ borderRadius: '0' }}
                onClick={handleItineraryClick}
              >
                <ItineraryCoverImage 
                  destination={itinerary.destination}
                  title={itinerary.title}
                />
                <CardContent className="flex-1 flex flex-col p-6">
                  {/* Title with icon */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 flex-1">
                      {itinerary.title}
                    </h3>
                    <Landmark className="w-6 h-6 ml-2 flex-shrink-0" style={{ color: '#C50972' }} />
                  </div>

                  {/* Description */}
                  {itinerary.ai_content?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {itinerary.ai_content.description}
                    </p>
                  )}

                  {/* Category badge */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-foreground tracking-wider">MUSEI</span>
                  </div>

                  {/* Scopri di più link */}
                  <button 
                    className="flex items-center gap-2 mb-4 group/link"
                    style={{ color: '#C50972' }}
                  >
                    <span className="text-sm font-bold">SCOPRI DI PIÙ</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </button>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Distanza: 3 km</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <span>Aggiungi ai preferiti</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      {/* Dot Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(itineraries.length / 3) }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index 
                ? 'bg-primary w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
