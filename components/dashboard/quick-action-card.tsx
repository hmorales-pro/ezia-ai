import { Card } from "@/components/ui/card";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void | Promise<void>;
  iconColor?: string;
  badge?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  iconColor = "text-[#6D3FC8]",
  badge
}: QuickActionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      // Le loading sera arrêté par la navigation
      // ou après un délai si l'action ne navigue pas
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return (
    <Card 
      className={cn(
        "p-6 bg-white backdrop-blur-sm border border-[#E0E0E0] hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden shadow-md",
        loading && "cursor-wait opacity-90"
      )}
      onClick={handleClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6D3FC8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] flex items-center justify-center shadow-md">
            {loading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Icon className="w-8 h-8 text-white" />
            )}
          </div>
          {badge && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#6D3FC8]/20 text-[#6D3FC8] border border-[#6D3FC8]/30">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#666666]">
          {description}
        </p>
        {loading && (
          <p className="text-xs text-[#6D3FC8] mt-2 animate-pulse">
            Chargement en cours...
          </p>
        )}
      </div>
    </Card>
  );
}