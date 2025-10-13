import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Zap, Heart, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ItineraryDetailsDialogProps {
  itinerary: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItineraryDetailsDialog = ({ itinerary, open, onOpenChange }: ItineraryDetailsDialogProps) => {
  if (!itinerary) return null;

  const aiContent = itinerary.ai_content;
  const isPlatform = itinerary.is_platform;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{itinerary.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                {itinerary.destination}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {isPlatform && <Badge variant="outline">Piattaforma</Badge>}
              <Badge variant={itinerary.status === "in_progress" || itinerary.status === "published" ? "default" : "secondary"}>
                {itinerary.status === "draft" ? "Bozza" :
                 itinerary.status === "generating" ? "Generazione..." :
                 itinerary.status === "in_progress" ? "In Corso" : 
                 itinerary.status === "published" ? "Pubblicato" : "Completato"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Informazioni base */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {format(new Date(itinerary.start_date), "dd MMM yyyy", { locale: it })} - {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: it })}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Partecipanti</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {itinerary.participants_count} {itinerary.participants_type || 'persone'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ritmo di viaggio</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {itinerary.travel_pace === 'relaxed' ? 'Rilassato' : 
                     itinerary.travel_pace === 'moderate' ? 'Moderato' : 'Intenso'}
                  </span>
                </div>
              </div>

              {itinerary.specific_interests && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interessi</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">{itinerary.specific_interests}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Contenuto AI generato */}
            {aiContent && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Itinerario Generato</h3>
                
                {aiContent.overview && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Panoramica</h4>
                    <p className="text-sm">{aiContent.overview}</p>
                  </div>
                )}

                {aiContent.highlights && aiContent.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Punti Salienti</h4>
                    <ul className="space-y-1">
                      {aiContent.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiContent.days && aiContent.days.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Programma Giornaliero</h4>
                    {aiContent.days.map((day: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <h5 className="font-semibold">Giorno {day.day}: {day.title}</h5>
                        {day.activities && day.activities.length > 0 && (
                          <div className="space-y-2">
                            {day.activities.map((activity: any, actIndex: number) => (
                              <div key={actIndex} className="pl-4 border-l-2 border-primary/30">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                                  <span className="font-medium text-sm">{activity.title}</span>
                                  {activity.duration && (
                                    <span className="text-xs text-muted-foreground">({activity.duration})</span>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {aiContent.practical_info && (
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium">Informazioni Pratiche</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {aiContent.practical_info.best_time && (
                        <div>
                          <span className="font-medium">Periodo migliore:</span> {aiContent.practical_info.best_time}
                        </div>
                      )}
                      {aiContent.practical_info.getting_around && (
                        <div>
                          <span className="font-medium">Come spostarsi:</span> {aiContent.practical_info.getting_around}
                        </div>
                      )}
                      {aiContent.practical_info.budget_tips && (
                        <div>
                          <span className="font-medium">Budget:</span> {aiContent.practical_info.budget_tips}
                        </div>
                      )}
                      {aiContent.practical_info.local_cuisine && (
                        <div>
                          <span className="font-medium">Cucina locale:</span> {aiContent.practical_info.local_cuisine}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!aiContent && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nessun contenuto AI generato per questo itinerario</p>
              </div>
            )}

            <Separator />

            {/* Metadati */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: {itinerary.id}</p>
              <p>Creato: {format(new Date(itinerary.created_at), "dd MMMM yyyy, HH:mm", { locale: it })}</p>
              <p>Utente: {itinerary.user_email}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};