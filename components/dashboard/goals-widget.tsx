import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Goal {
  goal_id?: string;
  title: string;
  description?: string;
  target_date: string;
  status: string;
  progress?: number;
  category?: string;
}

interface GoalsWidgetProps {
  businessId: string;
  businessName: string;
  goals?: Goal[];
}

export function GoalsWidget({ businessId, businessName, goals = [] }: GoalsWidgetProps) {
  // Filtrer les objectifs actifs
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
    : 0;

  return (
    <Card className="bg-white border-[#E0E0E0] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-[#C837F4]" />
          Objectifs
        </CardTitle>
        <Link href={`/business/${businessId}/goals`}>
          <Button variant="ghost" size="sm">
            Voir tout
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-[#666666] mx-auto mb-3" />
            <p className="text-sm text-[#666666] mb-3">
              Aucun objectif défini
            </p>
            <Link href={`/business/${businessId}/goals`}>
              <Button size="sm" variant="outline">
                Créer un objectif
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#E0E0E0]">
              <div className="text-center">
                <p className="text-xs text-[#666666]">Total</p>
                <p className="text-lg font-bold">{goals.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#666666]">Complétés</p>
                <p className="text-lg font-bold text-[#B028F2]">{completedCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#666666]">Progression</p>
                <p className="text-lg font-bold">{avgProgress}%</p>
              </div>
            </div>

            {/* Liste des objectifs actifs */}
            <div className="space-y-3">
              {activeGoals.map((goal, index) => (
                <div key={goal.goal_id || index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-[#666666]" />
                        <span className="text-xs text-[#666666]">
                          {format(new Date(goal.target_date), "d MMM", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {goal.progress || 0}%
                    </Badge>
                  </div>
                  <Progress value={goal.progress || 0} className="h-1.5" />
                </div>
              ))}
            </div>

            {goals.length > 3 && (
              <p className="text-xs text-[#666666] text-center pt-2">
                +{goals.length - 3} autres objectifs
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}