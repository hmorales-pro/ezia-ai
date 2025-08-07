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
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className={cn("w-8 h-8", iconColor)} />
          {change !== undefined && (
            <span className={cn(
              "text-sm font-medium",
              trend === "up" ? "text-green-500" : 
              trend === "down" ? "text-red-500" : 
              "text-zinc-400"
            )}>
              {trend === "up" ? "+" : ""}{change}%
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}