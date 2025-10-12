import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Calendar, Users, Sparkles, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivityMap } from "@/components/ActivityMap";
import { ShareItineraryDialog } from "@/components/ShareItineraryDialog";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";
import { ActivityStatusActions } from "@/components/ActivityStatusActions";
import { ExperienceSection } from "@/components/ExperienceSection";

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

  useEffect(() => {
    if (id) {
      loadItinerary();
      loadActivityStatuses();
    }
  }, [id]);

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
            <Badge variant={itinerary.status === "generated" ? "default" : "secondary"} className="text-sm">
              {itinerary.status === "generating" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {itinerary.status === "draft" ? "Bozza" : 
               itinerary.status === "generating" ? "Generazione..." : "Completato"}
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
            <Card className="mb-8 shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-amber" />
                  Panoramica del Viaggio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-6 leading-relaxed">{itinerary.ai_content.overview}</p>
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-4">✨ Highlights del Viaggio</h3>
                  <div className="grid gap-3">
                    {itinerary.ai_content.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span className="flex-1">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {itinerary.status === "in_progress" && (
              <ExperienceSection
                itineraryId={itinerary.id}
                destination={itinerary.destination}
                days={itinerary.ai_content.days}
                activityStatuses={activityStatuses}
                getActivityStatus={getActivityStatus}
              />
            )}

            <div className="space-y-6 mb-8">
              {itinerary.ai_content.days.map((day) => (
                <Card key={day.day} className="shadow-soft">
                  <CardHeader className="bg-gradient-hero/5">
                    <CardTitle className="flex items-center gap-3">
                      <Badge variant="default" className="text-base px-4 py-1.5 bg-gradient-hero">
                        Giorno {day.day}
                      </Badge>
                      <span className="text-xl">{day.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {day.activities.map((activity, index) => {
                      const activityStatus = getActivityStatus(day.day, index);
                      return (
                        <div key={index}>
                          {index > 0 && <Separator className="my-6" />}
                          <div className="space-y-3">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-semibold text-sm">{activity.time}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.duration}
                                  </Badge>
                                  <ActivityStatusBadge status={activityStatus} />
                                </div>
                                <h4 className="font-bold text-lg mb-2">{activity.title}</h4>
                                <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
                                {activity.tips && (
                                  <div className="mt-4 p-4 bg-amber/10 border border-amber/20 rounded-lg">
                                    <p className="text-sm">
                                      <span className="font-semibold">💡 Consiglio Pratico:</span> {activity.tips}
                                    </p>
                                  </div>
                                )}
                                <ActivityMap title={activity.title} location={activity.title} />
                              </div>
                              {user?.id === itinerary.user_id && (
                                <ActivityStatusActions
                                  itineraryId={itinerary.id}
                                  dayNumber={day.day}
                                  activityIndex={index}
                                  currentStatus={activityStatus}
                                  onStatusChange={loadActivityStatuses}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="text-2xl">📋 Informazioni Pratiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
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
