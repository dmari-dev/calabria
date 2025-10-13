import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Loader2, User, Mail, Calendar, MapPin, Briefcase, Phone, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  company: string | null;
  bio: string | null;
  birth_date: string | null;
  avatar_url: string | null;
}

interface UserDetailsDialogProps {
  userId: string | null;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ 
  userId, 
  userEmail,
  open, 
  onOpenChange 
}: UserDetailsDialogProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [itineraryCount, setItineraryCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserDetails();
    }
  }, [open, userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load itinerary count
      const { count, error: countError } = await supabase
        .from("itineraries")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

      if (countError) throw countError;
      setItineraryCount(count || 0);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei dettagli utente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Utente</DialogTitle>
          <DialogDescription>Informazioni complete sul profilo utente</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || userEmail} />
                <AvatarFallback className="bg-gradient-hero text-white text-2xl">
                  {profile.display_name?.[0]?.toUpperCase() || userEmail[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  {profile.display_name || "Nome non disponibile"}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {userEmail}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{itineraryCount} itinerari</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Info */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Informazioni Personali
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {profile.first_name && (
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{profile.first_name}</p>
                  </div>
                )}
                {profile.last_name && (
                  <div>
                    <p className="text-muted-foreground">Cognome</p>
                    <p className="font-medium">{profile.last_name}</p>
                  </div>
                )}
                {profile.birth_date && (
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data di Nascita
                    </p>
                    <p className="font-medium">
                      {format(new Date(profile.birth_date), "dd MMMM yyyy", { locale: it })}
                    </p>
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefono
                    </p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Info */}
            {(profile.address || profile.city || profile.country) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Indirizzo
                  </h4>
                  <div className="text-sm space-y-2">
                    {profile.address && <p>{profile.address}</p>}
                    {(profile.city || profile.country) && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[profile.city, profile.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Professional Info */}
            {(profile.profession || profile.company) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Informazioni Professionali
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {profile.profession && (
                      <div>
                        <p className="text-muted-foreground">Professione</p>
                        <p className="font-medium">{profile.profession}</p>
                      </div>
                    )}
                    {profile.company && (
                      <div>
                        <p className="text-muted-foreground">Azienda</p>
                        <p className="font-medium">{profile.company}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Bio */}
            {profile.bio && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">Bio</h4>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nessun dato disponibile
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
