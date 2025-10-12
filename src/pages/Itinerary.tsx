import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Calendar, Users, Sparkles, Clock, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Navigation, Map, Edit } from "lucide-react";
import { toast } from "sonner";
import { ActivityMap } from "@/components/ActivityMap";
import { ShareItineraryDialog } from "@/components/ShareItineraryDialog";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";
import { ActivityStatusActions } from "@/components/ActivityStatusActions";
import { ExperienceSection } from "@/components/ExperienceSection";
import { EditActivityDialog } from "@/components/EditActivityDialog";
import { MapPlaceholderDialog } from "@/components/MapPlaceholderDialog";
import { getActivityIcon } from "@/utils/activityIcons";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  tips?: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

interface AIContent {
  overview: string;
  highlights: string[];
  days: DayPlan[];
  practical_info: {
    best_time: string;
    getting_around: string;
    budget_tips: string;
    local_cuisine: string;
  };
}

interface ItineraryData {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  participants_type: string;
  specific_interests: string;
  travel_pace: string;
  ai_content: AIContent | null;
  status: string;
}

const Itinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityStatuses, setActivityStatuses] = useState<
    Record<string, "pending" | "in_progress" | "completed">
  >({});
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activityImages, setActivityImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (id) {
      loadItinerary();
      loadActivityStatuses();
    }
  }, [id]);

  useEffect(() => {
    if (itinerary?.ai_content?.days) {
      loadActivityImages();
    }
  }, [itinerary?.ai_content]);

  const loadActivityImages = async () => {
    // Simulazione caricamento immagini - in produzione queste verrebbero da un database o API
    const mockImages: Record<string, string[]> = {};
    if (itinerary?.ai_content?.days) {
      itinerary.ai_content.days.forEach((day) => {
        day.activities.forEach((_, index) => {
          const key = `${day.day}-${index}`;
          // Placeholder images - sostituire con vere immagini
          mockImages[key] = [
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
          ];
        });
      });
    }
    setActivityImages(mockImages);
  };

  useEffect(() => {
    if (!id) return;

    // Subscribe to realtime updates for activity statuses
    const channel = supabase
      .channel(`activity-statuses-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_statuses",
          filter: `itinerary_id=eq.${id}`,
        },
        () => {
          loadActivityStatuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    // Polling per aggiornamenti se l'itinerario è in generazione
    if (itinerary?.status === "generating") {
      const interval = setInterval(() => {
        loadItinerary();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [itinerary?.status]);

  const loadItinerary = async () => {
    try {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setItinerary(data as unknown as ItineraryData);
    } catch (error: any) {
      toast.error("Errore nel caricamento dell'itinerario");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadActivityStatuses = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("activity_statuses")
        .select("*")
        .eq("itinerary_id", id);

      if (error) throw error;

      const statusMap: Record<string, "pending" | "in_progress" | "completed"> = {};
      data?.forEach((status) => {
        const key = `${status.day_number}-${status.activity_index}`;
        statusMap[key] = status.status as "pending" | "in_progress" | "completed";
      });

      setActivityStatuses(statusMap);
    } catch (error: any) {
      console.error("Error loading activity statuses:", error);
    }
  };

  const getActivityStatus = (dayNumber: number, activityIndex: number) => {
    const key = `${dayNumber}-${activityIndex}`;
    return activityStatuses[key] || "pending";
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
  ) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          {itinerary && user?.id === itinerary.user_id && (
            <ShareItineraryDialog
              itineraryId={itinerary.id}
              itineraryTitle={itinerary.title}
            />
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
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
            <Badge variant={itinerary.status === "generated" || itinerary.status === "in_progress" ? "default" : "secondary"} className="text-sm">
              {itinerary.status === "generating" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {itinerary.status === "draft" ? "Bozza" : 
                itinerary.status === "generating" ? "Generazione..." : 
                itinerary.status === "in_progress" ? "In Corso" : "Completato"}
            </Badge>
          </div>
        </div>

        {itinerary.status === "generating" && (
          <Card className="mb-8 shadow-elevated border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Generazione Itinerario in Corso</h3>
                  <p className="text-muted-foreground">
                    L'intelligenza artificiale sta creando il tuo itinerario personalizzato. Ci vorranno pochi secondi...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {itinerary.ai_content && (
          <>
            <div className="mb-8">
              <Accordion type="single" collapsible>
                <AccordionItem value="overview" className="border rounded-lg shadow-soft bg-card">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-accent" />
                      <div className="text-left">
                        <h2 className="text-xl font-bold">Panoramica del Viaggio</h2>
                        <p className="text-sm text-muted-foreground font-normal">
                          Scopri il tuo viaggio in sintesi
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-lg mb-6 leading-relaxed">{itinerary.ai_content.overview}</p>
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-4">✨ Highlights del Viaggio</h3>
                      <div className="flex flex-wrap gap-4">
                        {itinerary.ai_content.highlights.map((highlight, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
                            style={{ flex: '1 1 calc(33.333% - 1rem)', minWidth: '280px' }}
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-accent" />
                            </div>
                            <span className="flex-1 text-sm leading-relaxed">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Day Progress Wizard */}
            <div className="mt-8 mb-8 p-6 bg-card rounded-xl border shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lungo il viaggio</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                    disabled={selectedDay === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-3">Giorno {selectedDay}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDay(Math.min(itinerary.ai_content!.days.length, selectedDay + 1))}
                    disabled={selectedDay === itinerary.ai_content.days.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {itinerary.ai_content.days.map((day, index) => {
                  const dayActivities = day.activities.map((_, actIndex) => 
                    getActivityStatus(day.day, actIndex)
                  );
                  const completedCount = dayActivities.filter(s => s === "completed").length;
                  const inProgressCount = dayActivities.filter(s => s === "in_progress").length;
                  const totalActivities = day.activities.length;
                  const isCompleted = completedCount === totalActivities;
                  const isInProgress = inProgressCount > 0 || completedCount > 0;
                  const isSelected = selectedDay === day.day;
                  
                  return (
                    <div key={day.day} className="flex items-center flex-1 min-w-[120px]">
                      <button
                        onClick={() => setSelectedDay(day.day)}
                        className="flex flex-col items-center flex-1 transition-all hover:scale-105"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all border-2",
                          isSelected ? "ring-4 ring-primary/30" : "",
                          isCompleted ? "bg-green-500 text-white border-green-600" :
                          isInProgress ? "bg-primary text-white border-primary" :
                          "bg-muted text-muted-foreground border-muted"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <span className={cn(
                          "text-xs font-medium text-center",
                          isSelected ? "text-primary font-bold" : ""
                        )}>
                          Giorno {day.day}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {completedCount}/{totalActivities}
                        </span>
                      </button>
                      {index < itinerary.ai_content!.days.length - 1 && (
                        <div className={cn(
                          "h-1 flex-1 mx-2 rounded transition-all",
                          isCompleted ? "bg-green-500" : "bg-muted"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <Accordion type="single" collapsible>
                {itinerary.ai_content.days
                  .filter(day => day.day === selectedDay)
                  .map((day) => (
                  <AccordionItem key={day.day} value={`day-${day.day}`} className="border rounded-lg shadow-soft bg-card">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-accent" />
                        <div className="text-left">
                          <h2 className="text-xl font-bold">Dettagli Giorno {selectedDay}</h2>
                          <p className="text-sm text-muted-foreground font-normal">
                            {day.title}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="flex flex-wrap gap-4">
                        {day.activities.map((activity, index) => {
                          const activityStatus = getActivityStatus(day.day, index);
                          const { icon: ActivityIcon, color: iconColor } = getActivityIcon(activity.title, activity.description);
                          const imageKey = `${day.day}-${index}`;
                          const images = activityImages[imageKey] || [];
                          
                          return (
                            <Card key={index} className="inline-flex flex-col flex-1 min-w-[340px] max-w-[400px] shadow-soft hover:shadow-elevated transition-all">
                              <CardContent className="p-0">
                                {/* Header con Stato */}
                                <div className="flex items-center justify-between p-4 border-b">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center",
                                      "bg-gradient-to-br from-background to-muted border"
                                    )}>
                                      <ActivityIcon className={cn("h-5 w-5", iconColor)} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{activity.time}</span>
                                        <span>•</span>
                                        <span>{activity.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ActivityStatusBadge status={activityStatus} />
                                </div>

                                {/* Slider Foto */}
                                {images.length > 0 && (
                                  <div className="relative">
                                    <Carousel className="w-full">
                                      <CarouselContent>
                                        {images.map((img, imgIndex) => (
                                          <CarouselItem key={imgIndex}>
                                            <div className="aspect-[16/9] relative">
                                              <img
                                                src={img}
                                                alt={`${activity.title} ${imgIndex + 1}`}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          </CarouselItem>
                                        ))}
                                      </CarouselContent>
                                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, dotIndex) => (
                                          <div
                                            key={dotIndex}
                                            className="w-1.5 h-1.5 rounded-full bg-white/60 transition-all"
                                          />
                                        ))}
                                      </div>
                                      <CarouselPrevious className="left-2" />
                                      <CarouselNext className="right-2" />
                                    </Carousel>
                                  </div>
                                )}

                                {/* Contenuto */}
                                <div className="p-4 space-y-3">
                                  <h4 className="font-bold text-base leading-tight">{activity.title}</h4>
                                  <p className="text-muted-foreground line-clamp-2">{activity.description}</p>
                                  
                                  {activity.tips && (
                                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                                      <p className="text-xs">
                                        <span className="font-semibold">💡 Tip:</span> {activity.tips}
                                      </p>
                                    </div>
                                  )}

                                  {/* Pulsanti Azioni */}
                                  <div className="flex gap-2 pt-2">
                                    <MapPlaceholderDialog 
                                      activityTitle={activity.title}
                                      type="directions"
                                    />
                                    <MapPlaceholderDialog 
                                      activityTitle={activity.title}
                                      type="map"
                                    />
                                  </div>

                                  {/* Edit Button per owner */}
                                  {user?.id === itinerary.user_id && (
                                    <div className="pt-2 border-t">
                                      <EditActivityDialog
                                        itineraryId={itinerary.id}
                                        dayNumber={day.day}
                                        activityIndex={index}
                                        activity={activity}
                                        onActivityUpdated={loadItinerary}
                                      />
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {itinerary.status === "in_progress" && (
              <ExperienceSection
                itineraryId={itinerary.id}
                destination={itinerary.destination}
                days={itinerary.ai_content.days}
                activityStatuses={activityStatuses}
                getActivityStatus={getActivityStatus}
                onStatusChange={loadActivityStatuses}
              />
            )}

            <Accordion type="single" collapsible>
              <AccordionItem value="practical-info" className="border rounded-lg shadow-soft bg-card">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <div className="text-left">
                      <h2 className="text-xl font-bold">Cosa sapere</h2>
                      <p className="text-sm text-muted-foreground font-normal">
                        Informazioni pratiche per il tuo viaggio
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span>🗓️</span>
                        <span>Periodo Migliore</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{itinerary.ai_content.practical_info.best_time}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span>🚌</span>
                        <span>Come Spostarsi</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{itinerary.ai_content.practical_info.getting_around}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span>💰</span>
                        <span>Consigli sul Budget</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{itinerary.ai_content.practical_info.budget_tips}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span>🍝</span>
                        <span>Cucina Locale</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{itinerary.ai_content.practical_info.local_cuisine}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {!itinerary.ai_content && itinerary.status === "draft" && (
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Itinerary;
