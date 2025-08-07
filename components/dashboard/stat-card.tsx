import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-violet-500",
  trend = "neutral"
}: StatCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center">
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          {change !== undefined && (
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              trend === "up" ? "text-green-400 bg-green-400/10" : 
              trend === "down" ? "text-red-400 bg-red-400/10" : 
              "text-gray-400 bg-gray-400/10"
            )}>
              {trend === "up" ? "+" : ""}{change}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}