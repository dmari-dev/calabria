import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Play, CheckCircle, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityStatusActionsProps {
  itineraryId: string;
  dayNumber: number;
  activityIndex: number;
  currentStatus: "pending" | "in_progress" | "completed";
  onStatusChange: () => void;
}

export const ActivityStatusActions = ({
  itineraryId,
  dayNumber,
  activityIndex,
  currentStatus,
  onStatusChange,
}: ActivityStatusActionsProps) => {
  const handleStatusChange = async (newStatus: "pending" | "in_progress" | "completed") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if status record exists
      const { data: existing } = await supabase
        .from("activity_statuses")
        .select("id")
        .eq("itinerary_id", itineraryId)
        .eq("day_number", dayNumber)
        .eq("activity_index", activityIndex)
        .maybeSingle();

      if (existing) {
        // Update existing status
        const { error } = await supabase
          .from("activity_statuses")
          .update({ status: newStatus })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new status record
        const { error } = await supabase
          .from("activity_statuses")
          .insert({
            itinerary_id: itineraryId,
            user_id: user.id,
            day_number: dayNumber,
            activity_index: activityIndex,
            status: newStatus,
          });

        if (error) throw error;
      }

      // Show notification based on status
      const statusMessages = {
        pending: "Attività riportata in attesa",
        in_progress: "🎯 Sei sul posto! Buon divertimento!",
        completed: "✅ Tappa conclusa! Ottimo lavoro!",
      };

      toast.success(statusMessages[newStatus]);
      onStatusChange();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dello stato");
      console.error(error);
    }
  };

  const statusOptions = [
    { value: "pending" as const, label: "In Attesa", icon: Clock },
    { value: "in_progress" as const, label: "In Corso", icon: Play },
    { value: "completed" as const, label: "Concluso", icon: CheckCircle },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={currentStatus === option.value}
            >
              <Icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
