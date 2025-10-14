import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings, Share2, Check, X, Loader2, CalendarIcon, Briefcase, MapPin, Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    travel_style: "moderate",
    cultural_interests: []
  });
  const [profileData, setProfileData] = useState({
    display_name: "",
    first_name: "",
    last_name: "",
    birth_date: null as Date | null,
    phone: "",
    address: "",
    city: "",
    country: "",
    profession: "",
    company: "",
    bio: "",
    avatar_url: ""
  });
  const [receivedShares, setReceivedShares] = useState<Share[]>([]);
  const [processingShares, setProcessingShares] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setProfileData({
          display_name: profile.display_name || "",
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          country: profile.country || "",
          profession: profile.profession || "",
          company: profile.company || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || ""
        });
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
          created_at
        `)
        .eq("shared_with_email", user?.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Load itinerary details separately for each share
      const sharesWithItineraries = await Promise.all(
        (data || []).map(async (share) => {
          const { data: itinerary } = await supabase
            .from("itineraries")
            .select("title, destination")
            .eq("id", share.itinerary_id)
            .single();
          
          return {
            ...share,
            itineraries: itinerary || { title: "Itinerario", destination: "N/A" }
          };
        })
      );
      
      setReceivedShares(sharesWithItineraries);
    } catch (error: any) {
      console.error("Error loading shares:", error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: profileData.display_name,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          birth_date: profileData.birth_date?.toISOString().split('T')[0],
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          profession: profileData.profession,
          company: profileData.company,
          bio: profileData.bio
        })
        .eq("user_id", user?.id);

      if (profileError) throw profileError;

      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user?.id,
          travel_style: preferences.travel_style,
          cultural_interests: preferences.cultural_interests
        }, {
          onConflict: 'user_id'
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Seleziona un'immagine valida");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'immagine deve essere inferiore a 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Delete old avatar if exists
      if (profileData.display_name) {
        const oldPath = `${user.id}/avatar`;
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Foto profilo aggiornata con successo");
      
      // Reload profile to get updated data
      loadProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Errore durante il caricamento della foto");
    } finally {
      setUploadingAvatar(false);
    }
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={profileData.avatar_url} alt={profileData.display_name || "User"} />
              <AvatarFallback className="bg-gradient-hero text-white text-2xl">
                {profileData.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
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

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personali
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Professionali
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferenze
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Informazioni Anagrafiche</CardTitle>
                <CardDescription>Gestisci i tuoi dati personali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      placeholder="Mario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Cognome</Label>
                    <Input
                      id="lastName"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome Visualizzato</Label>
                  <Input
                    id="displayName"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    placeholder="Il nome che vedranno gli altri"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data di Nascita</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profileData.birth_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profileData.birth_date ? (
                            format(profileData.birth_date, "PPP", { locale: it })
                          ) : (
                            <span>Seleziona data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profileData.birth_date || undefined}
                          onSelect={(date) => setProfileData({ ...profileData, birth_date: date || null })}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base">Indirizzo</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Via e Numero Civico</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="Via Roma, 123"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Città</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="Milano"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Paese</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        placeholder="Italia"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Informazioni Professionali</CardTitle>
                <CardDescription>Condividi la tua esperienza lavorativa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Professione</Label>
                  <Input
                    id="profession"
                    value={profileData.profession}
                    onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                    placeholder="Es. Architetto, Insegnante, Manager..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Azienda</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    placeholder="Nome dell'azienda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    rows={6}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Racconta qualcosa di te, delle tue passioni per i viaggi culturali..."
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Massimo 500 caratteri
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
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
          </TabsContent>
        </Tabs>

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
