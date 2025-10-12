import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Archive, PlayCircle, FileEdit, Loader2 } from "lucide-react";

interface ItineraryStatusBadgeProps {
  status: string;
}

export const ItineraryStatusBadge = ({ status }: ItineraryStatusBadgeProps) => {
  const statusConfig = {
    draft: {
      label: "Bozza",
      icon: FileEdit,
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      animate: false
    },
    generating: {
      label: "Generazione...",
      icon: Loader2,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      animate: true
    },
    approved: {
      label: "Completo",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      animate: false
    },
    in_progress: {
      label: "In Corso",
      icon: PlayCircle,
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      animate: false
    },
    completed: {
      label: "Completato",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      animate: false
    },
    archived: {
      label: "Archiviato",
      icon: Archive,
      className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      animate: false
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge className={`flex items-center gap-1 ${config.className}`}>
      <Icon className={`w-3 h-3 ${config.animate ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
};
