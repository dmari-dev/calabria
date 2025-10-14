import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
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
                className="group hover:shadow-soft transition-all cursor-pointer border-border/50 overflow-hidden h-full"
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
