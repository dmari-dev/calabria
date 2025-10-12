import { Badge } from "@/components/ui/badge";
import { Clock, Play, CheckCircle } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: "pending" | "in_progress" | "completed";
}

export const ActivityStatusBadge = ({ status }: ActivityStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: "In Attesa",
      icon: Clock,
      className: "bg-muted text-muted-foreground",
      animate: false
    },
    in_progress: {
      label: "In Corso",
      icon: Play,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      animate: true
    },
    completed: {
      label: "Concluso",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      animate: false
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`flex items-center gap-1 ${config.className}`}>
      <Icon className={`w-3 h-3 ${config.animate ? 'animate-pulse' : ''}`} />
      {config.label}
    </Badge>
  );
};
