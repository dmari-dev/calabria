import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ShareItineraryDialogProps {
  itineraryId: string;
  itineraryTitle: string;
}

export const ShareItineraryDialog = ({
  itineraryId,
  itineraryTitle,
}: ShareItineraryDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast.error("Inserisci un'email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email non valida");
      return;
    }

    if (email === user?.email) {
      toast.error("Non puoi condividere con te stesso");
      return;
    }

    setLoading(true);
    try {
      // Check if already shared
      const { data: existing } = await supabase
        .from("itinerary_shares")
        .select("id")
        .eq("itinerary_id", itineraryId)
        .eq("shared_with_email", email)
        .maybeSingle();

      if (existing) {
        toast.error("Itinerario già condiviso con questo utente");
        setLoading(false);
        return;
      }

      // Create share
      const { error } = await supabase.from("itinerary_shares").insert({
        itinerary_id: itineraryId,
        owner_id: user?.id,
        shared_with_email: email,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Invito inviato con successo");
      setEmail("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Errore nell'invio dell'invito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Condividi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Condividi Itinerario</DialogTitle>
          <DialogDescription>
            Invita un amico a visualizzare "{itineraryTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email dell'amico</Label>
            <Input
              id="email"
              type="email"
              placeholder="amico@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Verrà inviato un invito a questa email
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleShare} disabled={loading}>
            {loading ? "Invio..." : "Invia Invito"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
