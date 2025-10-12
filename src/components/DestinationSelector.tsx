import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DestinationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  nearbyDestinations?: string[];
  onNearbyChange?: (destinations: string[]) => void;
}

// Mock database di città italiane con città vicine
const cityDatabase: Record<string, string[]> = {
  roma: ["Tivoli", "Frascati", "Ostia"],
  milano: ["Monza", "Bergamo", "Como"],
  firenze: ["Fiesole", "Prato", "Pistoia"],
  venezia: ["Murano", "Burano", "Treviso"],
  napoli: ["Pompei", "Sorrento", "Ercolano"],
  torino: ["Moncalieri", "Rivoli", "Venaria Reale"],
  bologna: ["Modena", "Ferrara", "Imola"],
  verona: ["Vicenza", "Mantova", "Brescia"],
  genova: ["Portofino", "Santa Margherita", "Rapallo"],
  palermo: ["Monreale", "Cefalù", "Bagheria"],
  bari: ["Polignano a Mare", "Alberobello", "Monopoli"],
  catania: ["Taormina", "Siracusa", "Acireale"],
};

const findNearbyDestinations = (city: string): string[] => {
  const normalized = city.toLowerCase().trim();
  return cityDatabase[normalized] || [];
};

export const DestinationSelector = ({ 
  value, 
  onChange, 
  nearbyDestinations = [], 
  onNearbyChange 
}: DestinationSelectorProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<string[]>(nearbyDestinations);

  useEffect(() => {
    if (value.length >= 3) {
      const nearby = findNearbyDestinations(value);
      setSuggestions(nearby);
      setShowSuggestions(nearby.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleAddNearby = (destination: string) => {
    if (!selectedNearby.includes(destination)) {
      const updated = [...selectedNearby, destination];
      setSelectedNearby(updated);
      onNearbyChange?.(updated);
    }
  };

  const handleRemoveNearby = (destination: string) => {
    const updated = selectedNearby.filter(d => d !== destination);
    setSelectedNearby(updated);
    onNearbyChange?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destinazione Principale *</Label>
        <Input
          id="destination"
          placeholder="es. Roma, Firenze, Venezia..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="p-4 bg-accent/30 border-primary/20">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">
                Destinazioni Vicine (raggio 25km)
              </h4>
              <p className="text-xs text-muted-foreground">
                Aggiungi città o paesi vicini al tuo itinerario
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {suggestions.map((destination) => {
              const isSelected = selectedNearby.includes(destination);
              return (
                <Button
                  key={destination}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => 
                    isSelected 
                      ? handleRemoveNearby(destination) 
                      : handleAddNearby(destination)
                  }
                  className="text-xs"
                >
                  {isSelected ? (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      {destination}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      {destination}
                    </>
                  )}
                </Button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-3 italic">
            💡 L'AI includerà queste destinazioni nell'itinerario
          </p>
        </Card>
      )}

      {selectedNearby.length > 0 && !showSuggestions && (
        <div className="space-y-2">
          <Label className="text-sm">Destinazioni Aggiuntive Selezionate</Label>
          <div className="flex flex-wrap gap-2">
            {selectedNearby.map((destination) => (
              <Badge 
                key={destination} 
                variant="secondary" 
                className="pl-2 pr-1 py-1"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {destination}
                <button
                  type="button"
                  onClick={() => handleRemoveNearby(destination)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
