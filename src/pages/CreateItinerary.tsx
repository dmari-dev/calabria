import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Sparkles, Calendar as CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";

const CreateItinerary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    participantsCount: "2",
    participantsType: "",
    specificInterests: "",
    travelPace: "moderate",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination || !formData.startDate || !formData.endDate) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);

    try {
      // Create itinerary in database
      const { data, error } = await supabase
        .from("itineraries")
        .insert({
          user_id: user?.id,
          title: `Viaggio a ${formData.destination}`,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          participants_count: parseInt(formData.participantsCount),
          participants_type: formData.participantsType,
          specific_interests: formData.specificInterests,
          travel_pace: formData.travelPace,
          status: "generating",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Generazione itinerario in corso...");
      navigate(`/itinerary/${data.id}`);

      // Genera l'itinerario con AI in background
      supabase.functions.invoke("generate-itinerary", {
        body: { itineraryId: data.id },
      }).then(({ error: genError }) => {
        if (genError) {
          console.error("Error generating itinerary:", genError);
        }
      });

    } catch (error: any) {
      toast.error(error.message || "Errore nella creazione dell'itinerario");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero mb-4 shadow-elevated">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Crea il Tuo Itinerario</h1>
          <p className="text-muted-foreground text-lg">
            L'AI creerà un viaggio culturale personalizzato per te
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-elevated border-border/50 mb-6">
            <CardHeader>
              <CardTitle>Dettagli del Viaggio</CardTitle>
              <CardDescription>
                Fornisci le informazioni base per il tuo itinerario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="destination">Destinazione *</Label>
                <Input
                  id="destination"
                  placeholder="es. Roma, Firenze, Venezia..."
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inizio *</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="startDate"
                      type="date"
                      className="pl-10"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fine *</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="endDate"
                      type="date"
                      className="pl-10"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participantsCount">Numero Partecipanti</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="participantsCount"
                      type="number"
                      min="1"
                      className="pl-10"
                      value={formData.participantsCount}
                      onChange={(e) => setFormData({ ...formData, participantsCount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participantsType">Tipo Gruppo</Label>
                  <Input
                    id="participantsType"
                    placeholder="es. Coppia, Famiglia, Amici..."
                    value={formData.participantsType}
                    onChange={(e) => setFormData({ ...formData, participantsType: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelPace">Ritmo del Viaggio</Label>
                <Select
                  value={formData.travelPace}
                  onValueChange={(value) => setFormData({ ...formData, travelPace: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Rilassato - Poche attività, molto tempo libero</SelectItem>
                    <SelectItem value="moderate">Moderato - Bilanciamento tra attività e relax</SelectItem>
                    <SelectItem value="intensive">Intenso - Massimizza le esperienze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specificInterests">Interessi Specifici</Label>
                <Textarea
                  id="specificInterests"
                  placeholder="es. Vorrei concentrarmi sulla street art e trovare ristoranti vegani, oppure visitare musei meno conosciuti..."
                  rows={4}
                  value={formData.specificInterests}
                  onChange={(e) => setFormData({ ...formData, specificInterests: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Descrivi liberamente cosa ti piacerebbe fare durante il viaggio
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-hero hover:opacity-90 transition-opacity text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Creazione in corso...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Genera Itinerario con AI
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CreateItinerary;
