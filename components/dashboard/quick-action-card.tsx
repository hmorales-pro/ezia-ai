import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  iconColor?: string;
  badge?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  iconColor = "text-violet-500",
  badge
}: QuickActionCardProps) {
  return (
    <Card 
      className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 cursor-pointer transition-all group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          {badge && (
            <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          {description}
        </p>
      </div>
    </Card>
  );
}