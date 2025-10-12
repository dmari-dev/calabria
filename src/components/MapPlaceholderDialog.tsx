import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navigation, Map as MapIcon } from "lucide-react";

interface MapPlaceholderDialogProps {
  activityTitle: string;
  type: "directions" | "map";
}

export const MapPlaceholderDialog = ({
  activityTitle,
  type,
}: MapPlaceholderDialogProps) => {
  const [open, setOpen] = useState(false);

  const isDirections = type === "directions";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1"
        onClick={() => setOpen(true)}
      >
        {isDirections ? (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            Indicazioni
          </>
        ) : (
          <>
            <MapIcon className="w-4 h-4 mr-2" />
            Mappa
          </>
        )}
      </Button>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isDirections ? "Indicazioni per" : "Mappa di"} {activityTitle}
          </DialogTitle>
          <DialogDescription>
            {isDirections 
              ? "Visualizza il percorso per raggiungere questa destinazione"
              : "Esplora l'area circostante la destinazione"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Mappa Placeholder */}
          <div className="w-full h-[400px] bg-muted rounded-lg relative overflow-hidden border-2 border-border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  {isDirections ? (
                    <Navigation className="w-8 h-8 text-primary" />
                  ) : (
                    <MapIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {isDirections ? "Percorso verso destinazione" : "Area della destinazione"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activityTitle}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Grid pattern per simulare una mappa */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Marker simulato */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Informazioni esempio */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2">
              <span>📍</span>
              Informazioni {isDirections ? "Percorso" : "Posizione"}
            </h4>
            {isDirections ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distanza:</span>
                  <span className="font-medium">2.3 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo stimato:</span>
                  <span className="font-medium">8 minuti a piedi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mezzo consigliato:</span>
                  <span className="font-medium">🚶 A piedi</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indirizzo:</span>
                  <span className="font-medium">Via Esempio, 123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zona:</span>
                  <span className="font-medium">Centro Storico</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accesso:</span>
                  <span className="font-medium">Pubblico</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ℹ️ Questa è una visualizzazione placeholder. Le informazioni reali saranno disponibili durante il viaggio.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
