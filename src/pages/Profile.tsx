import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, Settings, Users as UsersIcon, Save, Mail } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  itinerary?: {
    title: string;
    destination: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({
    travel_style: "moderate",
    cultural_interests: [],
  });
  const [receivedShares, setReceivedShares] = useState<Share[]>([]);
  const [sentShares, setSentShares] = useState<Share[]>([]);

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
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profile) {
        setDisplayName(profile.display_name || "");
      }

      // Load preferences
      const { data: prefs, error: prefsError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (prefsError && prefsError.code !== "PGRST116") throw prefsError;

      if (prefs) {
        setPreferences({
          travel_style: prefs.travel_style || "moderate",
          cultural_interests: prefs.cultural_interests || [],
        });
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  const loadShares = async () => {
    try {
      // Load received shares
      const { data: received, error: receivedError } = await supabase
        .from("itinerary_shares")
        .select(`
          *,
          itineraries:itinerary_id (title, destination)
        `)
        .eq("shared_with_email", user?.email)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedShares(received || []);

      // Load sent shares
      const { data: sent, error: sentError } = await supabase
        .from("itinerary_shares")
        .select(`
          *,
          itineraries:itinerary_id (title, destination)
        `)
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;
      setSentShares(sent || []);
    } catch (error: any) {
      console.error("Error loading shares:", error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user?.id);

      if (profileError) throw profileError;

      // Update or insert preferences
      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user?.id,
          travel_style: preferences.travel_style,
          cultural_interests: preferences.cultural_interests,
        });

      if (prefsError) throw prefsError;

      toast.success("Profilo aggiornato con successo");
    } catch (error: any) {
      toast.error("Errore nel salvataggio del profilo");
    } finally {
      setSaving(false);
    }
  };

  const handleShareResponse = async (shareId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("itinerary_shares")
        .update({ 
          status,
          shared_with_user_id: status === "accepted" ? user?.id : null
        })
        .eq("id", shareId);

      if (error) throw error;

      toast.success(status === "accepted" ? "Invito accettato" : "Invito rifiutato");
      loadShares();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dell'invito");
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from("itinerary_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      toast.success("Condivisione rimossa");
      loadShares();
    } catch (error: any) {
      toast.error("Errore nella rimozione della condivisione");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profilo</h1>
          <p className="text-muted-foreground">
            Gestisci le tue informazioni e preferenze
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </TabsTrigger>
            <TabsTrigger value="shares">
              <UsersIcon className="w-4 h-4 mr-2" />
              Condivisioni
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informazioni Personali
                </CardTitle>
                <CardDescription>
                  Aggiorna le tue informazioni di base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email non può essere modificata
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome visualizzato</Label>
                  <Input
                    id="displayName"
                    placeholder="Il tuo nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferenze di Viaggio</CardTitle>
                <CardDescription>
                  Personalizza le tue preferenze per itinerari futuri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Stile di Viaggio Preferito</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "relaxed", label: "Rilassato" },
                      { value: "moderate", label: "Moderato" },
                      { value: "intensive", label: "Intenso" },
                    ].map((style) => (
                      <Button
                        key={style.value}
                        variant={preferences.travel_style === style.value ? "default" : "outline"}
                        onClick={() =>
                          setPreferences({ ...preferences, travel_style: style.value })
                        }
                        className="w-full"
                      >
                        {style.label}
                      </Button>
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
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </TabsContent>

          <TabsContent value="shares" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Inviti Ricevuti
                </CardTitle>
                <CardDescription>
                  Itinerari condivisi con te
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receivedShares.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nessun invito ricevuto
                  </p>
                ) : (
                  <div className="space-y-4">
                    {receivedShares.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {(share as any).itineraries?.title || "Itinerario"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {(share as any).itineraries?.destination || ""}
                          </p>
                          <Badge
                            variant={
                              share.status === "accepted"
                                ? "default"
                                : share.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                            className="mt-2"
                          >
                            {share.status === "accepted"
                              ? "Accettato"
                              : share.status === "pending"
                              ? "In Attesa"
                              : "Rifiutato"}
                          </Badge>
                        </div>
                        {share.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleShareResponse(share.id, "accepted")}
                            >
                              Accetta
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareResponse(share.id, "rejected")}
                            >
                              Rifiuta
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Condivisioni Inviate
                </CardTitle>
                <CardDescription>
                  Itinerari che hai condiviso con altri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentShares.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna condivisione inviata
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sentShares.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {(share as any).itineraries?.title || "Itinerario"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Condiviso con: {share.shared_with_email}
                          </p>
                          <Badge
                            variant={
                              share.status === "accepted"
                                ? "default"
                                : share.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                            className="mt-2"
                          >
                            {share.status === "accepted"
                              ? "Accettato"
                              : share.status === "pending"
                              ? "In Attesa"
                              : "Rifiutato"}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteShare(share.id)}
                        >
                          Rimuovi
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
