import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ShareItineraryDialogProps {
  itineraryId: string;
  itineraryTitle: string;
}

export const ShareItineraryDialog = ({ itineraryId, itineraryTitle }: ShareItineraryDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error("Inserisci un indirizzo email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }

    if (email === user?.email) {
      toast.error("Non puoi condividere l'itinerario con te stesso");
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("itinerary_shares")
        .select("id, status")
        .eq("itinerary_id", itineraryId)
        .eq("shared_with_email", email)
        .single();

      if (existing) {
        if (existing.status === "pending") {
          toast.error("Hai già inviato un invito a questo indirizzo email");
        } else if (existing.status === "accepted") {
          toast.error("Questo itinerario è già condiviso con questo utente");
        } else {
          toast.error("L'invito è stato precedentemente rifiutato");
        }
        return;
      }

      const { error } = await supabase
        .from("itinerary_shares")
        .insert({
          itinerary_id: itineraryId,
          owner_id: user?.id,
          shared_with_email: email,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Invito inviato con successo!");
      setEmail("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error sharing itinerary:", error);
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
      <DialogContent>
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
              placeholder="amico@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShare()}
            />
            <p className="text-xs text-muted-foreground">
              Il tuo amico riceverà un invito per visualizzare questo itinerario
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleShare}
            disabled={loading}
            className="bg-gradient-hero"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Invio...
              </>
            ) : (
              "Invia Invito"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
