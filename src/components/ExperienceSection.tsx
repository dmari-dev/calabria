import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
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

interface ExperienceSectionProps {
  itineraryId: string;
  destination: string;
  days: DayPlan[];
  activityStatuses: Record<string, "pending" | "in_progress" | "completed">;
  getActivityStatus: (dayNumber: number, activityIndex: number) => "pending" | "in_progress" | "completed";
}

export const ExperienceSection = ({
  itineraryId,
  destination,
  days,
  activityStatuses,
  getActivityStatus,
}: ExperienceSectionProps) => {
  const [selectedActivity, setSelectedActivity] = useState<{
    title: string;
    description: string;
    destination: string;
  } | null>(null);
  const [activityDetail, setActivityDetail] = useState<string>("");
  const [activityImage, setActivityImage] = useState<string>("");
  const [youtubeSearchUrl, setYoutubeSearchUrl] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  return (
    <Card className="shadow-elevated mb-8">
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber" />
            Experience
          </h2>
          <p className="text-muted-foreground">
            Esplora i dettagli approfonditi di ogni tappa del tuo viaggio
          </p>
        </div>

        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.day} className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Badge variant="secondary">Giorno {day.day}</Badge>
                <span>{day.title}</span>
              </h3>
              <div className="grid gap-3">
                {day.activities.map((activity, index) => {
                  const status = getActivityStatus(day.day, index);
                  return (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <Card
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() =>
                            loadActivityDetail(
                              activity.title,
                              activity.description,
                              destination
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
  );
};
