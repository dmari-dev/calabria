import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";
import { ActivityStatusActions } from "@/components/ActivityStatusActions";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  onStatusChange: () => void;
}

export const ExperienceSection = ({
  itineraryId,
  destination,
  days,
  activityStatuses,
  getActivityStatus,
  onStatusChange,
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
    <Accordion type="single" collapsible className="mb-8">
      <AccordionItem value="experience" className="border rounded-lg shadow-soft bg-card">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent" />
            <div className="text-left">
              <h2 className="text-xl font-bold">Experience</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Esplora i dettagli approfonditi di ogni tappa
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="space-y-6">
            {days.map((day) => {
              // Ordina le attività: prima quelle "in_progress", poi le altre
              const sortedActivities = [...day.activities].map((activity, index) => ({
                activity,
                index,
                status: getActivityStatus(day.day, index)
              })).sort((a, b) => {
                if (a.status === "in_progress" && b.status !== "in_progress") return -1;
                if (a.status !== "in_progress" && b.status === "in_progress") return 1;
                return 0;
              });

              return (
                <div key={day.day} className="space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Badge variant="secondary">Giorno {day.day}</Badge>
                    <span className="text-sm">{day.title}</span>
                  </h3>
                  
                  {/* Timeline verticale stile metro */}
                  <div className="relative">
                    {/* Linea verticale */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />
                    
                    {/* Tappe */}
                    <div className="space-y-0">
                      {sortedActivities.map(({ activity, index, status }, idx) => {
                        const isInProgress = status === "in_progress";
                        const isCompleted = status === "completed";
                        
                        return (
                          <div key={index} className="relative flex items-start gap-4 pb-6">
                            {/* Bullet point */}
                            <div className="relative z-10 flex-shrink-0">
                              <div className={cn(
                                "w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all",
                                isCompleted ? "bg-green-500 border-green-600 shadow-lg shadow-green-500/30" :
                                isInProgress ? "bg-primary border-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20" :
                                "bg-background border-muted"
                              )}>
                                {isCompleted && (
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {isInProgress && (
                                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                )}
                              </div>
                            </div>

                            {/* Card della tappa */}
                            <Card className="flex-1 hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  {/* Immagine miniatura */}
                                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                                    <img
                                      src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=200&q=80"
                                      alt={activity.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Contenuto */}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs text-muted-foreground font-medium">
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
                                    </div>

                                    {/* CTA basata sullo stato */}
                                    <div className="flex gap-2">
                                      {isInProgress ? (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() =>
                                                loadActivityDetail(
                                                  activity.title,
                                                  activity.description,
                                                  destination
                                                )
                                              }
                                            >
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Scopri dettagli
                                            </Button>
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
                                                        <Sparkles className="w-4 h-4 text-accent" />
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
                                      ) : (
                                        <>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Lock className="w-3 h-3" />
                                            <span>Inizia per sbloccare</span>
                                          </div>
                                          <ActivityStatusActions
                                            itineraryId={itineraryId}
                                            dayNumber={day.day}
                                            activityIndex={index}
                                            currentStatus={status}
                                            onStatusChange={onStatusChange}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
