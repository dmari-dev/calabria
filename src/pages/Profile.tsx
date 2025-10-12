import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, Settings, Share2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface UserPreferences {
  travel_style: string;
  cultural_interests: string[];
}

interface Share {
  id: string;
  itinerary_id: string;
  shared_with_email: string;
  status: string;
  created_at: string;
  itineraries: {
    title: string;
    destination: string;
  };
}

const culturalOptions = [
  "Arte e Musei",
  "Architettura",
  "Storia",
  "Gastronomia",
  "Teatro e Spettacoli",
  "Musica",
  "Tradizioni Locali",
  "Letteratura"
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    travel_style: "moderate",
    cultural_interests: []
  });
  const [displayName, setDisplayName] = useState("");
  const [receivedShares, setReceivedShares] = useState<Share[]>([]);
  const [processingShares, setProcessingShares] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadProfile();
      loadShares();
    }
  }, [user, authLoading, navigate]);

  const loadProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || "");
      }

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (prefs) {
        setPreferences({
          travel_style: prefs.travel_style || "moderate",
          cultural_interests: prefs.cultural_interests || []
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadShares = async () => {
    try {
      const { data, error } = await supabase
        .from("itinerary_shares")
        .select(`
          id,
          itinerary_id,
          shared_with_email,
          status,
          created_at,
          itineraries (
            title,
            destination
          )
        `)
        .eq("shared_with_email", user?.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceivedShares(data || []);
    } catch (error: any) {
      console.error("Error loading shares:", error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user?.id);

      if (profileError) throw profileError;

      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user?.id,
          travel_style: preferences.travel_style,
          cultural_interests: preferences.cultural_interests
        });

      if (prefsError) throw prefsError;

      toast.success("Profilo aggiornato con successo");
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento del profilo");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleShareResponse = async (shareId: string, status: "accepted" | "rejected") => {
    setProcessingShares(prev => new Set(prev).add(shareId));
    try {
      const { error } = await supabase
        .from("itinerary_shares")
        .update({ 
          status,
          shared_with_user_id: user?.id 
        })
        .eq("id", shareId);

      if (error) throw error;

      toast.success(
        status === "accepted" 
          ? "Invito accettato! L'itinerario è ora visibile nella tua dashboard."
          : "Invito rifiutato"
      );
      
      loadShares();
    } catch (error: any) {
      toast.error("Errore nell'elaborazione dell'invito");
      console.error(error);
    } finally {
      setProcessingShares(prev => {
        const next = new Set(prev);
        next.delete(shareId);
        return next;
      });
    }
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      cultural_interests: prev.cultural_interests.includes(interest)
        ? prev.cultural_interests.filter(i => i !== interest)
        : [...prev.cultural_interests, interest]
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  const pendingShares = receivedShares.filter(s => s.status === "pending");

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Il Tuo Profilo</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {pendingShares.length > 0 && (
          <Card className="shadow-elevated border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Inviti in Sospeso
              </CardTitle>
              <CardDescription>
                Hai {pendingShares.length} {pendingShares.length === 1 ? "invito" : "inviti"} da gestire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingShares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{share.itineraries.title}</p>
                    <p className="text-sm text-muted-foreground">{share.itineraries.destination}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleShareResponse(share.id, "accepted")}
                      disabled={processingShares.has(share.id)}
                      className="bg-gradient-hero"
                    >
                      {processingShares.has(share.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareResponse(share.id, "rejected")}
                      disabled={processingShares.has(share.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome Visualizzato</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Preferenze di Viaggio</CardTitle>
            <CardDescription>
              Personalizza le tue preferenze per itinerari più adatti a te
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Ritmo di Viaggio</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "relaxed", label: "Rilassato", emoji: "🌅" },
                  { value: "moderate", label: "Moderato", emoji: "🚶" },
                  { value: "intensive", label: "Intenso", emoji: "🏃" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, travel_style: option.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.travel_style === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Interessi Culturali</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {culturalOptions.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={preferences.cultural_interests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <label
                      htmlFor={interest}
                      className="text-sm cursor-pointer select-none"
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvataggio...
            </>
          ) : (
            "Salva Modifiche"
          )}
        </Button>
      </main>
    </div>
  );
};

export default Profile;
