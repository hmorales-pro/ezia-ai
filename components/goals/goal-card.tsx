import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  MoreVertical,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Edit2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Goal {
  goal_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  status: string;
  progress: number;
  milestones?: Array<{
    title: string;
    achieved_at: string;
  }>;
  updates?: Array<{
    date: string;
    note: string;
    progress: number;
  }>;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
}

const categoryConfig = {
  revenue: { label: "Revenus", color: "text-green-500", bgColor: "bg-green-500/10" },
  growth: { label: "Croissance", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  product: { label: "Produit", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  marketing: { label: "Marketing", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  operations: { label: "Opérations", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  other: { label: "Autre", color: "text-gray-500", bgColor: "bg-gray-500/10" }
};

const statusConfig = {
  active: { label: "En cours", icon: TrendingUp, color: "text-blue-500" },
  completed: { label: "Complété", icon: CheckCircle, color: "text-green-500" },
  paused: { label: "En pause", icon: PauseCircle, color: "text-yellow-500" },
  cancelled: { label: "Annulé", icon: XCircle, color: "text-red-500" }
};

export function GoalCard({ goal, onUpdate, onEdit }: GoalCardProps) {
  const category = categoryConfig[goal.category as keyof typeof categoryConfig] || categoryConfig.other;
  const status = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig.active;
  const StatusIcon = status.icon;

  const daysRemaining = Math.ceil(
    (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = daysRemaining < 0 && goal.status === 'active';
  const isUrgent = daysRemaining <= 7 && daysRemaining >= 0 && goal.status === 'active';

  return (
    <Card className="bg-white border-[#E0E0E0] hover:shadow-lg transition-all shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-[#C837F4]" />
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", category.bgColor, category.color)}
              >
                {category.label}
              </Badge>
            </div>
            <p className="text-sm text-[#666666] line-clamp-2">{goal.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(goal.goal_id)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Mettre à jour la progression
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#666666]">Progression</span>
            <span className="text-sm font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <StatusIcon className={cn("w-3 h-3", status.color)} />
              <span className={status.color}>{status.label}</span>
            </div>
            <div className="flex items-center gap-1 text-[#666666]">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(goal.target_date), "d MMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
          
          {goal.status === 'active' && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue ? "text-red-500" : isUrgent ? "text-orange-500" : "text-[#666666]"
            )}>
              <Clock className="w-3 h-3" />
              <span>
                {isOverdue 
                  ? `En retard de ${Math.abs(daysRemaining)} jours`
                  : `${daysRemaining} jours restants`
                }
              </span>
            </div>
          )}
        </div>

        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
            <p className="text-xs text-[#666666] mb-2">
              {goal.milestones.length} jalon{goal.milestones.length > 1 ? 's' : ''} atteint{goal.milestones.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}