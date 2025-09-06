"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeepenButtonProps {
  section: string;
  businessId: string;
  analysisType: 'market' | 'competitor' | 'marketing';
  onDeepen: (section: string, analysisType: string) => Promise<void>;
  disabled?: boolean;
}

export function DeepenButton({ 
  section, 
  businessId, 
  analysisType, 
  onDeepen,
  disabled = false 
}: DeepenButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onDeepen(section, analysisType);
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionLabel = () => {
    const labels: Record<string, string> = {
      // Market analysis sections
      'overview': 'Vue d\'ensemble',
      'target_audience': 'Public cible',
      'pestel': 'Analyse PESTEL',
      'porter': 'Analyse Porter',
      'swot': 'Analyse SWOT',
      'strategy': 'Recommandations stratégiques',
      
      // Marketing strategy sections
      'positioning': 'Positionnement de marque',
      'segments': 'Segments cibles',
      'mix': 'Mix Marketing',
      'journey': 'Parcours client',
      'campaigns': 'Campagnes',
      'roadmap': 'Roadmap',
      
      // Competitor analysis sections
      'competitors': 'Analyse des concurrents',
      'competitive_advantages': 'Avantages concurrentiels',
      'benchmark': 'Benchmark',
      'opportunities': 'Opportunités'
    };
    
    return labels[section] || section;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="ml-2 text-xs text-gray-500 hover:text-[#6D3FC8] transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Approfondissement...
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Approfondir
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Cliquez pour obtenir une analyse plus détaillée de {getSectionLabel()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}