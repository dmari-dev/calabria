import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

interface ItinerarySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraries: Itinerary[];
}

export const ItinerarySelectionDialog = ({
  open,
  onOpenChange,
  itineraries,
}: ItinerarySelectionDialogProps) => {
  const navigate = useNavigate();

  const handleSelectItinerary = (itineraryId: string) => {
    onOpenChange(false);
    navigate(`/itinerary/${itineraryId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Seleziona un Itinerario</DialogTitle>
          <DialogDescription>
            Scegli quale itinerario vuoi esplorare nella modalità Experience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {itineraries.map((itinerary) => (
            <Card
              key={itinerary.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectItinerary(itinerary.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{itinerary.title}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {itinerary.destination}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(itinerary.start_date).toLocaleDateString("it-IT")} -{" "}
                        {new Date(itinerary.end_date).toLocaleDateString("it-IT")}
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-gradient-hero">
                    In Corso
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
