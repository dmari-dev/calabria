import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Loader2, Users, Route, BarChart3, UserCircle, Calendar,
  TrendingUp, MapPin, Activity, Eye
} from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { StatsCard } from "@/components/admin/StatsCard";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { ItineraryDetailsDialog } from "@/components/admin/ItineraryDetailsDialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  user_email: string;
  user_id: string;
  created_at: string;
  is_platform?: boolean;
  is_published?: boolean;
}

interface Analytics {
  totalUsers: number;
  newUsersThisMonth: number;
  totalItineraries: number;
  activeItineraries: number;
  completedItineraries: number;
  averageItineraryDuration: number;
  topDestinations: { destination: string; count: number }[];
  userGrowth: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [showItineraryDetails, setShowItineraryDetails] = useState(false);

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
        .select("user_id, display_name, avatar_url")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get auth users via Edge Function (secure)
      const { data: adminUsersRes, error: fnError } = await supabase.functions.invoke("list-admin-users");
      if (fnError) throw fnError;
      const authUsers = adminUsersRes?.users ?? [];

      const usersWithProfiles = authUsers.map((user: any) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        display_name: profilesData?.find(p => p.user_id === user.id)?.display_name || null,
        avatar_url: profilesData?.find(p => p.user_id === user.id)?.avatar_url || null,
      }));

      setUsers(usersWithProfiles);

      // Load all itineraries with user info
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from("itineraries")
        .select("*")
        .order("created_at", { ascending: false });

      if (itinerariesError) throw itinerariesError;

      // Load platform itineraries
      const { data: platformItinerariesData, error: platformError } = await supabase
        .from("platform_itineraries")
        .select("*")
        .order("created_at", { ascending: false });

      if (platformError) throw platformError;

      const itinerariesWithUsers = itinerariesData.map(itinerary => ({
        ...itinerary,
        user_email: usersWithProfiles.find(u => u.id === itinerary.user_id)?.email || "Sconosciuto",
        is_platform: false,
      }));

      const platformItinerariesWithUsers = (platformItinerariesData || []).map(itinerary => ({
        ...itinerary,
        user_email: usersWithProfiles.find(u => u.id === itinerary.created_by)?.email || "Admin",
        user_id: itinerary.created_by,
        status: itinerary.is_published ? "published" : "draft",
        is_platform: true,
      }));

      const allItineraries = [...itinerariesWithUsers, ...platformItinerariesWithUsers];
      setItineraries(allItineraries);

      // Calculate analytics
      calculateAnalytics(usersWithProfiles, itinerariesData);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei dati: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (users: User[], itineraries: any[]) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const lastMonth = startOfMonth(subDays(now, 30));

    // User metrics
    const totalUsers = users.length;
    const newUsersThisMonth = users.filter(
      u => new Date(u.created_at) >= monthStart
    ).length;
    const newUsersLastMonth = users.filter(
      u => new Date(u.created_at) >= lastMonth && new Date(u.created_at) < monthStart
    ).length;
    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100)
      : 100;

    // Itinerary metrics
    const totalItineraries = itineraries.length;
    const activeItineraries = itineraries.filter(i => i.status === "in_progress").length;
    const completedItineraries = itineraries.filter(i => i.status === "generated").length;

    // Calculate average duration
    const durations = itineraries.map(i => {
      const start = new Date(i.start_date);
      const end = new Date(i.end_date);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageItineraryDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Top destinations
    const destinationCounts = itineraries.reduce((acc, i) => {
      acc[i.destination] = (acc[i.destination] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDestinations = Object.entries(destinationCounts)
      .map(([destination, count]) => ({ destination, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setAnalytics({
      totalUsers,
      newUsersThisMonth,
      totalItineraries,
      activeItineraries,
      completedItineraries,
      averageItineraryDuration,
      topDestinations,
      userGrowth,
    });
  };

  const handleViewUser = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowUserDetails(true);
  };

  const handleViewItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    setShowItineraryDetails(true);
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
          <h1 className="text-4xl font-bold mb-2">Pannello Amministrazione</h1>
          <p className="text-muted-foreground">Gestione completa della piattaforma e analytics</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Utenti ({users.length})
            </TabsTrigger>
            <TabsTrigger value="itineraries">
              <Route className="w-4 h-4 mr-2" />
              Itinerari ({itineraries.length})
            </TabsTrigger>
            <TabsTrigger value="demographics">
              <UserCircle className="w-4 h-4 mr-2" />
              Anagrafica
            </TabsTrigger>
          </TabsList>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {analytics && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Utenti Totali"
                    value={analytics.totalUsers}
                    description="Utenti registrati"
                    icon={Users}
                    trend={{
                      value: `+${analytics.userGrowth.toFixed(1)}%`,
                      isPositive: analytics.userGrowth >= 0
                    }}
                  />
                  <StatsCard
                    title="Nuovi Utenti"
                    value={analytics.newUsersThisMonth}
                    description="Questo mese"
                    icon={TrendingUp}
                    iconColor="text-green-600"
                  />
                  <StatsCard
                    title="Itinerari Totali"
                    value={analytics.totalItineraries}
                    description="Itinerari creati"
                    icon={Route}
                    iconColor="text-blue-600"
                  />
                  <StatsCard
                    title="Itinerari Attivi"
                    value={analytics.activeItineraries}
                    description="In corso"
                    icon={Activity}
                    iconColor="text-orange-600"
                  />
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Destinations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Destinazioni Popolari
                      </CardTitle>
                      <CardDescription>Le 5 destinazioni più richieste</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.topDestinations.map((dest, index) => (
                          <div key={dest.destination} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {index + 1}
                              </div>
                              <span className="font-medium">{dest.destination}</span>
                            </div>
                            <Badge variant="secondary">{dest.count} itinerari</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Statistiche Rapide
                      </CardTitle>
                      <CardDescription>Metriche chiave della piattaforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-sm text-muted-foreground">Durata Media</span>
                          <span className="font-bold">{analytics.averageItineraryDuration} giorni</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-sm text-muted-foreground">Itinerari Completati</span>
                          <span className="font-bold">{analytics.completedItineraries}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-sm text-muted-foreground">Tasso Completamento</span>
                          <span className="font-bold">
                            {analytics.totalItineraries > 0 
                              ? ((analytics.completedItineraries / analytics.totalItineraries) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Media Itinerari/Utente</span>
                          <span className="font-bold">
                            {analytics.totalUsers > 0 
                              ? (analytics.totalItineraries / analytics.totalUsers).toFixed(1)
                              : 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Utenti Registrati</CardTitle>
                <CardDescription>Gestione completa degli utenti della piattaforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || user.email} />
                          <AvatarFallback className="bg-gradient-hero text-white">
                            {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name || "Nessun nome"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registrato: {format(new Date(user.created_at), "dd MMMM yyyy", { locale: it })}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewUser(user.id, user.email)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Dettagli
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ITINERARIES TAB */}
          <TabsContent value="itineraries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Itinerari Creati</CardTitle>
                <CardDescription>Tutti gli itinerari generati dagli utenti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{itinerary.title}</p>
                          {itinerary.is_platform && (
                            <Badge variant="outline" className="text-xs">Piattaforma</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {itinerary.destination}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(itinerary.start_date), "dd MMM", { locale: it })} - {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: it })}
                          </span>
                          <span>• Utente: {itinerary.user_email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={itinerary.status === "in_progress" ? "default" : itinerary.status === "published" ? "default" : "secondary"}>
                          {itinerary.status === "draft" ? "Bozza" :
                           itinerary.status === "generating" ? "Generazione..." :
                           itinerary.status === "in_progress" ? "In Corso" : 
                           itinerary.status === "published" ? "Pubblicato" : "Completato"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewItinerary(itinerary)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Dettagli
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEMOGRAPHICS TAB */}
          <TabsContent value="demographics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Utenti</CardTitle>
                  <CardDescription>Analisi demografica degli utenti registrati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Utenti con profilo completo</span>
                        <span className="text-sm text-muted-foreground">
                          {users.filter(u => u.display_name).length} / {users.length}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-hero h-2 rounded-full transition-all"
                          style={{ 
                            width: `${users.length > 0 ? (users.filter(u => u.display_name).length / users.length * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Utenti attivi (con itinerari)</span>
                        <span className="text-sm text-muted-foreground">
                          {new Set(itineraries.map(i => i.user_id)).size} / {users.length}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${users.length > 0 ? (new Set(itineraries.map(i => i.user_id)).size / users.length * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attività Recente</CardTitle>
                  <CardDescription>Ultimi utenti registrati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3 text-sm">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || user.email} />
                          <AvatarFallback className="bg-gradient-hero text-white text-xs">
                            {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.display_name || user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(user.created_at), "dd MMM yyyy, HH:mm", { locale: it })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <UserDetailsDialog
          userId={selectedUserId}
          userEmail={selectedUserEmail}
          open={showUserDetails}
          onOpenChange={setShowUserDetails}
        />

        <ItineraryDetailsDialog
          itinerary={selectedItinerary}
          open={showItineraryDetails}
          onOpenChange={setShowItineraryDetails}
        />
      </div>
    </div>
  );
};

export default Admin;
