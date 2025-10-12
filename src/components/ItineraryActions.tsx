import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, CheckCircle, PlayCircle, Archive, Trash2, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ItineraryActionsProps {
  itineraryId: string;
  currentStatus: string;
  onUpdate: () => void;
}

export const ItineraryActions = ({ itineraryId, currentStatus, onUpdate }: ItineraryActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'archived') {
        updateData.archived_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("itineraries")
        .update(updateData)
        .eq("id", itineraryId);

      if (error) throw error;

      toast.success(`Stato aggiornato a: ${getStatusLabel(newStatus)}`);
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dello stato");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("itineraries")
        .delete()
        .eq("id", itineraryId);

      if (error) throw error;

      toast.success("Itinerario eliminato con successo");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione dell'itinerario");
      console.error(error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReactivate = async () => {
    if (!startDate || !endDate) {
      toast.error("Seleziona le nuove date per l'itinerario");
      return;
    }

    if (endDate < startDate) {
      toast.error("La data di fine deve essere successiva alla data di inizio");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("itineraries")
        .update({
          status: 'approved',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          archived_at: null
        })
        .eq("id", itineraryId);

      if (error) throw error;

      toast.success("Itinerario riattivato con successo");
      onUpdate();
      setShowReactivateDialog(false);
    } catch (error: any) {
      toast.error("Errore nella riattivazione dell'itinerario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Bozza",
      approved: "Completo",
      in_progress: "In Corso",
      completed: "Completato",
      archived: "Archiviato"
    };
    return labels[status] || status;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading || currentStatus === 'generating'}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus === 'draft' && (
            <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approva Itinerario
            </DropdownMenuItem>
          )}
          
          {currentStatus === 'approved' && (
            <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Inizia Viaggio
            </DropdownMenuItem>
          )}
          
          {currentStatus === 'in_progress' && (
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completa Viaggio
            </DropdownMenuItem>
          )}
          
          {(currentStatus === 'completed' || currentStatus === 'approved') && (
            <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
              <Archive className="w-4 h-4 mr-2" />
              Archivia
            </DropdownMenuItem>
          )}
          
          {currentStatus === 'archived' && (
            <DropdownMenuItem onClick={() => setShowReactivateDialog(true)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Riattiva con Nuove Date
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'itinerario verrà eliminato definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Riattiva Itinerario</DialogTitle>
            <DialogDescription>
              Seleziona le nuove date per riattivare questo itinerario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data Inizio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: it }) : <span>Seleziona data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fine</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: it }) : <span>Seleziona data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleReactivate} disabled={loading || !startDate || !endDate}>
              {loading ? "Riattivazione..." : "Riattiva"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
