import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Globe, Calendar, Target, Sparkles } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  agent: string;
  summary: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  market_analysis: Target,
  marketing_strategy: TrendingUp,
  website_creation: Globe,
  content_calendar: Calendar,
  general: MessageSquare,
  branding: Sparkles
};

const activityColors = {
  market_analysis: "text-[#C837F4]",
  marketing_strategy: "text-[#B028F2]",
  website_creation: "text-[#9B21D5]",
  content_calendar: "text-[#C837F4]",
  general: "text-[#666666]",
  branding: "text-[#B028F2]"
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-white backdrop-blur-sm border border-[#E0E0E0] shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-[#666666] text-center py-8">
            Aucune activité récente
          </p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || MessageSquare;
              const color = activityColors[activity.type as keyof typeof activityColors] || "text-zinc-500";
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={`mt-1 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{activity.agent}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#666666] line-clamp-2">
                      {activity.summary}
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      {format(new Date(activity.timestamp), "d MMM à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}