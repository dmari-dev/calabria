import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Palette, History, Music, UtensilsCrossed, Camera, Mountain, Landmark } from "lucide-react";

const culturalInterests = [
  { id: "renaissance-art", label: "Arte Rinascimentale", icon: Palette },
  { id: "roman-history", label: "Storia Romana", icon: History },
  { id: "archaeology", label: "Archeologia", icon: Landmark },
  { id: "music", label: "Musica", icon: Music },
  { id: "food-wine", label: "Cibo e Vino", icon: UtensilsCrossed },
  { id: "photography", label: "Fotografia", icon: Camera },
  { id: "nature", label: "Natura", icon: Mountain },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("moderate");
  const [loading, setLoading] = useState(false);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedInterests.length === 0) {
      toast.error("Seleziona almeno un interesse culturale");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user?.id,
          cultural_interests: selectedInterests,
          travel_style: travelStyle,
        });

      if (error) throw error;

      toast.success("Preferenze salvate con successo!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Errore durante il salvataggio delle preferenze");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Benvenuto!</h1>
          <p className="text-muted-foreground text-lg">
            Parlaci dei tuoi interessi per creare itinerari su misura per te
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-elevated border-border/50 mb-6">
            <CardHeader>
              <CardTitle>I Tuoi Interessi Culturali</CardTitle>
              <CardDescription>
                Seleziona gli ambiti che ti appassionano di più (puoi sceglierne più di uno)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {culturalInterests.map((interest) => {
                  const Icon = interest.icon;
                  return (
                    <div
                      key={interest.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedInterests.includes(interest.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <Checkbox
                        id={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                      />
                      <Icon className="w-5 h-5 text-primary" />
                      <Label
                        htmlFor={interest.id}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {interest.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-border/50 mb-6">
            <CardHeader>
              <CardTitle>Stile di Viaggio</CardTitle>
              <CardDescription>
                Come preferisci viaggiare?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={travelStyle} onValueChange={(value) => setTravelStyle(value)}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="relaxed" id="relaxed" />
                  <Label htmlFor="relaxed" className="flex-1 cursor-pointer">
                    <div className="font-medium">Rilassato</div>
                    <div className="text-sm text-muted-foreground">Poche attività, molto tempo libero</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors mt-3">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                    <div className="font-medium">Moderato</div>
                    <div className="text-sm text-muted-foreground">Bilanciamento tra attività e relax</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors mt-3">
                  <RadioGroupItem value="intensive" id="intensive" />
                  <Label htmlFor="intensive" className="flex-1 cursor-pointer">
                    <div className="font-medium">Intenso</div>
                    <div className="text-sm text-muted-foreground">Massimizza le esperienze, ritmo sostenuto</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-hero hover:opacity-90 transition-opacity text-lg"
            disabled={loading}
          >
            {loading ? "Salvataggio..." : "Inizia a Creare Itinerari"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
