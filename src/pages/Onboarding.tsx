import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleTravelStyleChange = (value: string) => {
    if (value !== travelStyle) {
      setTravelStyle(value);
    }
  };

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="py-12 px-4">
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
              <div role="radiogroup" aria-label="Stile di viaggio" className="space-y-3">
                {[
                  { value: "relaxed", title: "Rilassato", desc: "Poche attività, molto tempo libero" },
                  { value: "moderate", title: "Moderato", desc: "Bilanciamento tra attività e relax" },
                  { value: "intensive", title: "Intenso", desc: "Massimizza le esperienze, ritmo sostenuto" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={travelStyle === opt.value}
                    onClick={() => handleTravelStyleChange(opt.value)}
                    className={`w-full text-left flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                      travelStyle === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 rounded-full border ${
                        travelStyle === opt.value ? "bg-primary border-primary" : "border-primary"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1">
                      <div className="font-medium">{opt.title}</div>
                      <div className="text-sm text-muted-foreground">{opt.desc}</div>
                    </span>
                  </button>
                ))}
              </div>
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
    </div>
  );
};

export default Onboarding;
