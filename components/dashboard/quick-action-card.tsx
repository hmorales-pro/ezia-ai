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
  iconColor = "text-[#C837F4]",
  badge
}: QuickActionCardProps) {
  return (
    <Card 
      className="p-6 bg-white backdrop-blur-sm border border-[#E0E0E0] hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden shadow-md"
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C837F4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C837F4] to-[#B028F2] flex items-center justify-center shadow-md">
            <Icon className="w-8 h-8 text-white" />
          </div>
          {badge && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#C837F4]/20 text-[#C837F4] border border-[#C837F4]/30">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#1E1E1E] group-hover:text-[#C837F4] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#666666]">
          {description}
        </p>
      </div>
    </Card>
  );
}