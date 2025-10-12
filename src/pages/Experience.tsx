import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Calendar, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

interface AIContent {
  days: DayPlan[];
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  ai_content: AIContent;
}

interface ActivityStatus {
  day_number: number;
  activity_index: number;
  status: "pending" | "in_progress" | "completed";
}

const Experience = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activityStatuses, setActivityStatuses] = useState<Record<string, ActivityStatus[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<{
    title: string;
    description: string;
    destination: string;
  } | null>(null);
  const [activityDetail, setActivityDetail] = useState<string>("");
  const [activityImage, setActivityImage] = useState<string>("");
  const [youtubeSearchUrl, setYoutubeSearchUrl] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadItineraries();
    }
  }, [user, authLoading, navigate]);

  const loadItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("status", "in_progress")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const validItineraries = (data || [])
        .filter((it) => {
          if (!it.ai_content || typeof it.ai_content !== 'object') return false;
          const content = it.ai_content as any;
          return content.days && Array.isArray(content.days);
        })
        .map((it) => ({
          ...it,
          ai_content: it.ai_content as unknown as AIContent,
        })) as Itinerary[];

      setItineraries(validItineraries);

      // Carica gli stati delle attività per ogni itinerario
      for (const itinerary of validItineraries) {
        loadActivityStatuses(itinerary.id);
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento degli itinerari");
    } finally {
      setLoading(false);
    }
  };

  const loadActivityStatuses = async (itineraryId: string) => {
    try {
      const { data, error } = await supabase
        .from("activity_statuses")
        .select("*")
        .eq("itinerary_id", itineraryId);

      if (error) throw error;

      setActivityStatuses((prev) => ({
        ...prev,
        [itineraryId]: data as ActivityStatus[],
      }));
    } catch (error: any) {
      console.error("Error loading activity statuses:", error);
    }
  };

  const getActivityStatus = (
    itineraryId: string,
    dayNumber: number,
    activityIndex: number
  ): "pending" | "in_progress" | "completed" => {
    const statuses = activityStatuses[itineraryId] || [];
    const status = statuses.find(
      (s) => s.day_number === dayNumber && s.activity_index === activityIndex
    );
    return status?.status || "pending";
  };

  const loadActivityDetail = async (
    activityTitle: string,
    activityDescription: string,
    destination: string
  ) => {
    setSelectedActivity({ title: activityTitle, description: activityDescription, destination });
    setLoadingDetail(true);
    setActivityDetail("");
    setActivityImage("");
    setYoutubeSearchUrl("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-activity-detail", {
        body: {
          activity: activityTitle,
          description: activityDescription,
          destination: destination,
        },
      });

      if (error) throw error;

      setActivityDetail(data.detail);
      setActivityImage(data.imageUrl || "");
      setYoutubeSearchUrl(data.youtubeSearchUrl || "");
    } catch (error: any) {
      toast.error("Errore nel caricamento dei dettagli");
      setActivityDetail("Impossibile caricare i dettagli in questo momento.");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (itineraries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Dashboard
            </Button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Nessun Viaggio in Corso</h1>
            <p className="text-muted-foreground text-lg">
              La sezione Experience sarà disponibile quando avrai un itinerario in corso.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")}>Vai alla Dashboard</Button>
        </main>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-amber" />
            Experience
          </h1>
          <p className="text-muted-foreground text-lg">
            Esplora i dettagli dei luoghi nei tuoi viaggi in corso
          </p>
        </div>

        <div className="space-y-8">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="shadow-elevated">
              <CardHeader className="bg-gradient-hero/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{itinerary.title}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 text-base">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {itinerary.destination}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(itinerary.start_date).toLocaleDateString("it-IT")} -{" "}
                        {new Date(itinerary.end_date).toLocaleDateString("it-IT")}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-gradient-hero">
                    In Corso
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {itinerary.ai_content.days.map((day) => (
                    <div key={day.day} className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Badge variant="secondary">Giorno {day.day}</Badge>
                        <span>{day.title}</span>
                      </h3>
                      <div className="grid gap-3">
                        {day.activities.map((activity, index) => {
                          const status = getActivityStatus(itinerary.id, day.day, index);
                          return (
                            <Dialog key={index}>
                              <DialogTrigger asChild>
                                <Card
                                  className="cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() =>
                                    loadActivityDetail(
                                      activity.title,
                                      activity.description,
                                      itinerary.destination
                                    )
                                  }
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-sm text-muted-foreground font-medium">
                                            {activity.time}
                                          </span>
                                          <ActivityStatusBadge status={status} />
                                        </div>
                                        <h4 className="font-semibold text-base mb-1">
                                          {activity.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                          {activity.description}
                                        </p>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        <Sparkles className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">
                                    {selectedActivity?.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {selectedActivity?.destination}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[60vh] pr-4">
                                  {loadingDetail ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                      <p className="text-sm text-muted-foreground">
                                        Generazione di contenuti multimediali...
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-semibold mb-2">Descrizione</h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                          {selectedActivity?.description}
                                        </p>
                                      </div>

                                      {activityImage && (
                                        <div>
                                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            📸 Foto del Luogo
                                          </h4>
                                          <img
                                            src={activityImage}
                                            alt={selectedActivity?.title}
                                            className="w-full rounded-lg shadow-md"
                                          />
                                        </div>
                                      )}

                                      {activityDetail && (
                                        <div>
                                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber" />
                                            Dettagli e Curiosità
                                          </h4>
                                          <div className="prose prose-sm max-w-none text-muted-foreground">
                                            {activityDetail.split("\n").map((paragraph, i) => (
                                              <p key={i} className="mb-3 leading-relaxed">
                                                {paragraph}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {youtubeSearchUrl && (
                                        <div>
                                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            🎥 Video e Tour
                                          </h4>
                                          <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => window.open(youtubeSearchUrl, "_blank")}
                                          >
                                            Cerca video su YouTube
                                          </Button>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            Scopri tour virtuali e guide video di {selectedActivity?.title}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Experience;
