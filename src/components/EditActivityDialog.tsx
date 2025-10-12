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
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  tips?: string;
}

interface EditActivityDialogProps {
  itineraryId: string;
  dayNumber: number;
  activityIndex: number;
  activity: Activity;
  onActivityUpdated: () => void;
}

export const EditActivityDialog = ({
  itineraryId,
  dayNumber,
  activityIndex,
  activity,
  onActivityUpdated,
}: EditActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description,
    time: activity.time,
    duration: activity.duration,
    tips: activity.tips || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Fetch current itinerary
      const { data: itinerary, error: fetchError } = await supabase
        .from("itineraries")
        .select("ai_content")
        .eq("id", itineraryId)
        .single();

      if (fetchError) throw fetchError;

      // Update the specific activity in the ai_content
      const aiContent = itinerary.ai_content as any;
      const dayIndex = aiContent.days.findIndex((d: any) => d.day === dayNumber);
      
      if (dayIndex !== -1) {
        aiContent.days[dayIndex].activities[activityIndex] = {
          ...aiContent.days[dayIndex].activities[activityIndex],
          title: formData.title,
          description: formData.description,
          time: formData.time,
          duration: formData.duration,
          tips: formData.tips || undefined,
        };

        // Save back to database
        const { error: updateError } = await supabase
          .from("itineraries")
          .update({ ai_content: aiContent })
          .eq("id", itineraryId);

        if (updateError) throw updateError;

        toast.success("Tappa aggiornata con successo!");
        setOpen(false);
        onActivityUpdated();
      }
    } catch (error: any) {
      console.error("Error updating activity:", error);
      toast.error("Errore nell'aggiornamento della tappa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Edit className="w-4 h-4 mr-2" />
          Modifica tappa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifica Tappa</DialogTitle>
          <DialogDescription>
            Personalizza i dettagli di questa attività
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Orario</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                placeholder="es. 09:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durata</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="es. 2h"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tips">Consigli (opzionale)</Label>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) =>
                setFormData({ ...formData, tips: e.target.value })
              }
              rows={3}
              placeholder="Aggiungi consigli utili per questa tappa..."
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salva modifiche
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
