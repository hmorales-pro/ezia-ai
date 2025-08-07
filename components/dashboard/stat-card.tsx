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
  iconColor = "text-[#6D3FC8]",
  trend = "neutral"
}: StatCardProps) {
  return (
    <Card className="bg-white backdrop-blur-sm border border-[#E0E0E0] hover:shadow-lg transition-all shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D3FC8]/20 to-[#5A35A5]/20 flex items-center justify-center">
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
        <p className="text-sm text-[#666666] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#1E1E1E]">{value}</p>
      </CardContent>
    </Card>
  );
}