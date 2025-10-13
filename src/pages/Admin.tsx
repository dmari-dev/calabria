import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Users, Route, Plus } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  created_at: string;
  display_name: string | null;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  user_email: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Platform itinerary form
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Accesso non autorizzato");
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users with profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get auth users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const usersWithProfiles = authUsers.map(user => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        display_name: profilesData?.find(p => p.user_id === user.id)?.display_name || null,
      }));

      setUsers(usersWithProfiles);

      // Load all itineraries with user info
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from("itineraries")
        .select(`
          id,
          title,
          destination,
          start_date,
          end_date,
          status,
          user_id
        `)
        .order("created_at", { ascending: false });

      if (itinerariesError) throw itinerariesError;

      const itinerariesWithUsers = itinerariesData.map(itinerary => ({
        ...itinerary,
        user_email: usersWithProfiles.find(u => u.id === itinerary.user_id)?.email || "Sconosciuto",
      }));

      setItineraries(itinerariesWithUsers);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei dati: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlatformItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { error } = await supabase
        .from("platform_itineraries")
        .insert({
          title,
          destination,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id,
          is_published: true,
          ai_content: {
            description,
          },
        });

      if (error) throw error;

      toast.success("Itinerario proposto creato con successo!");
      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    } catch (error: any) {
      toast.error("Errore nella creazione: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">Gestisci utenti, itinerari e contenuti della piattaforma</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Utenti
            </TabsTrigger>
            <TabsTrigger value="itineraries">
              <Route className="w-4 h-4 mr-2" />
              Itinerari Utenti
            </TabsTrigger>
            <TabsTrigger value="platform">
              <Plus className="w-4 h-4 mr-2" />
              Itinerari Proposti
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Utenti Registrati ({users.length})</CardTitle>
                <CardDescription>Tutti gli utenti della piattaforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.display_name || "Nessun nome"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registrato: {format(new Date(user.created_at), "dd MMMM yyyy", { locale: it })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itineraries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Itinerari Creati ({itineraries.length})</CardTitle>
                <CardDescription>Tutti gli itinerari generati dagli utenti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{itinerary.title}</p>
                        <p className="text-sm text-muted-foreground">{itinerary.destination}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(itinerary.start_date), "dd MMM", { locale: it })} - {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: it })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Utente: {itinerary.user_email}</p>
                      </div>
                      <Badge variant={itinerary.status === "in_progress" ? "default" : "secondary"}>
                        {itinerary.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Crea Itinerario Proposto</CardTitle>
                <CardDescription>
                  Gli itinerari proposti appariranno nella sezione "For You" per tutti gli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlatformItinerary} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titolo</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="es. Weekend a Firenze"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destinazione</Label>
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="es. Firenze, Toscana"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Data Inizio</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">Data Fine</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrivi l'itinerario proposto..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-hero hover:opacity-90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Creazione in corso...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 w-4 h-4" />
                        Crea Itinerario Proposto
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
