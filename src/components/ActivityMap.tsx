import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface ActivityMapProps {
  title: string;
  location?: string;
}

// Mock service per simulare Google Maps
const getMockMapUrl = (location: string) => {
  // Genera un'immagine di mappa simulata basata sul nome della location
  const seed = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/800/400`;
};

const getMockPlaceImage = (location: string) => {
  // Genera un'immagine del luogo simulata
  const seed = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 1000;
  return `https://picsum.photos/seed/${seed}/400/300`;
};

const getMockDirections = (location: string) => {
  // Genera indicazioni simulate
  return {
    distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
    duration: `${Math.floor(Math.random() * 20 + 5)} min`,
    steps: [
      "Parti dalla posizione corrente",
      `Dirigiti verso ${location}`,
      "Svolta a destra dopo 200 metri",
      "Continua dritto per 500 metri",
      `Arrivo a destinazione: ${location}`
    ]
  };
};

export const ActivityMap = ({ title, location }: ActivityMapProps) => {
  const [imageError, setImageError] = useState(false);
  const locationName = location || title;
  const directions = getMockDirections(locationName);

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Immagine del luogo */}
        <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
          <div className="relative">
            {!imageError ? (
              <img
                src={getMockPlaceImage(locationName)}
                alt={locationName}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <MapPin className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {locationName}
              </p>
            </div>
          </div>
        </Card>

        {/* Mappa simulata */}
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={getMockMapUrl(locationName)}
              alt="Mappa"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2">
              <Button size="sm" variant="secondary" className="shadow-lg">
                <ExternalLink className="w-3 h-3 mr-1" />
                Apri Mappa
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Pulsante indicazioni */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Ottieni Indicazioni ({directions.distance}, ~{directions.duration})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Indicazioni per {locationName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Statistiche */}
            <div className="flex gap-4 p-4 bg-accent/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Distanza</p>
                <p className="text-xl font-bold">{directions.distance}</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-sm text-muted-foreground">Tempo stimato</p>
                <p className="text-xl font-bold">{directions.duration}</p>
              </div>
            </div>

            {/* Mappa grande */}
            <Card className="overflow-hidden">
              <img
                src={getMockMapUrl(locationName)}
                alt="Mappa dettagliata"
                className="w-full h-64 object-cover"
              />
            </Card>

            {/* Passaggi */}
            <div className="space-y-2">
              <h4 className="font-semibold">Passaggi:</h4>
              <ol className="space-y-3">
                {directions.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Note demo */}
            <div className="p-3 bg-amber/10 border border-amber/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Demo:</strong> Questa è una simulazione di Google Maps SDK. In produzione, verrebbero mostrate mappe e indicazioni reali.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
