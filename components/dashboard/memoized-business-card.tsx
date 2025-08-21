import React from 'react';
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Globe, 
  TrendingUp, 
  Target,
  ChevronRight,
  BarChart3,
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Business {
  _id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  website_url?: string;
  _createdAt: string;
  completion_score?: number;
  metrics?: {
    website_visitors?: number;
    conversion_rate?: number;
    monthly_growth?: number;
    task_completion?: number;
  };
  agents_status?: {
    market_analysis: 'pending' | 'in_progress' | 'completed' | 'failed';
    competitor_analysis: 'pending' | 'in_progress' | 'completed' | 'failed';
    marketing_strategy: 'pending' | 'in_progress' | 'completed' | 'failed';
    website_prompt: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
  website_prompt?: {
    prompt: string;
    key_features: string[];
    design_style: string;
    target_impression: string;
  };
  ezia_interactions?: Array<{
    timestamp: string;
    agent: string;
    interaction_type: string;
    summary: string;
  }>;
}

interface BusinessCardProps {
  business: Business;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate?: (businessId: string) => void;
  onCreateWebsite?: (business: Business) => void;
  onAnalyze?: (business: Business) => void;
}

// Memoized individual metric display
const MetricDisplay = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  className?: string;
}) => (
  <div className="flex items-center gap-2">
    <Icon className={cn("w-4 h-4", className)} />
    <span className="text-sm">
      <span className="text-[#666666]">{label}:</span>{" "}
      <span className="font-medium text-[#1E1E1E]">{value}</span>
    </span>
  </div>
));
MetricDisplay.displayName = 'MetricDisplay';

// Memoized agent status display
const AgentStatusBadge = React.memo(({ 
  status 
}: { 
  status: 'pending' | 'in_progress' | 'completed' | 'failed' 
}) => {
  const statusConfig = {
    pending: { label: "En attente", className: "bg-gray-100 text-gray-700" },
    in_progress: { label: "En cours", className: "bg-blue-100 text-blue-700" },
    completed: { label: "Terminé", className: "bg-green-100 text-green-700" },
    failed: { label: "Échoué", className: "bg-red-100 text-red-700" }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge variant="secondary" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
});
AgentStatusBadge.displayName = 'AgentStatusBadge';

// Main memoized business card
export const MemoizedBusinessCard = React.memo<BusinessCardProps>(({ 
  business, 
  isSelected, 
  onSelect,
  onNavigate,
  onCreateWebsite,
  onAnalyze
}) => {
  const completionScore = business.completion_score || 0;
  const hasWebsite = !!business.website_url;
  const createdDate = format(new Date(business._createdAt), "d MMM yyyy", { locale: fr });

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected 
          ? "ring-2 ring-[#6D3FC8] shadow-lg scale-[1.02]" 
          : "hover:shadow-md hover:scale-[1.01]"
      )}
      onClick={() => {
        onSelect();
        if (onNavigate) {
          onNavigate(business.business_id);
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#6D3FC8]" />
            </div>
            <div>
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <p className="text-sm text-[#666666] mt-1">{business.industry}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {business.stage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#666666] line-clamp-2">
          {business.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666666]">Progression</span>
            <span className="font-medium">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <MetricDisplay 
            icon={Globe} 
            label="Site web" 
            value={hasWebsite ? "Actif" : "Non créé"}
            className={hasWebsite ? "text-green-600" : "text-gray-400"}
          />
          <MetricDisplay 
            icon={Activity} 
            label="Interactions" 
            value={business.ezia_interactions?.length || 0}
            className="text-[#6D3FC8]"
          />
        </div>

        {business.metrics && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <MetricDisplay 
              icon={TrendingUp} 
              label="Croissance" 
              value={`+${business.metrics.monthly_growth || 0}%`}
              className="text-green-600"
            />
            <MetricDisplay 
              icon={Target} 
              label="Conversion" 
              value={`${business.metrics.conversion_rate || 0}%`}
              className="text-blue-600"
            />
          </div>
        )}

        {/* Agent status indicator */}
        {business.agents_status && (
          <div className="mt-3 space-y-2">
            {Object.values(business.agents_status).some(status => status === 'pending' || status === 'in_progress') && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Analyses en cours...
                  </span>
                </div>
                <div className="space-y-1">
                  {business.agents_status.market_analysis === 'in_progress' && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Agent Marché : Analyse du marché en cours
                    </div>
                  )}
                  {business.agents_status.competitor_analysis === 'in_progress' && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      Agent Concurrence : Étude des concurrents
                    </div>
                  )}
                  {business.agents_status.marketing_strategy === 'in_progress' && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Agent Marketing : Stratégie en préparation
                    </div>
                  )}
                  {business.agents_status.website_prompt === 'in_progress' && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      Agent Web : Conception du site
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Temps estimé : 10-15 secondes
                </div>
              </div>
            )}
            
            {Object.values(business.agents_status).every(status => status === 'completed') && (
              <div className="p-2 bg-green-50 rounded-lg flex items-center gap-2 border border-green-200">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-green-700 font-medium">
                  Toutes les analyses sont terminées !
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              if (onCreateWebsite) {
                onCreateWebsite(business);
              }
            }}
          >
            <Globe className="w-3 h-3 mr-1" />
            {business.website_url ? 'Gérer la présence' : 'Développer'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              if (onAnalyze) {
                onAnalyze(business);
              }
            }}
          >
            <Target className="w-3 h-3 mr-1" />
            Analyse
          </Button>
          <Link href={`/business/${business.business_id}`} onClick={(e) => e.stopPropagation()} className="ml-auto">
            <Button size="sm" variant="ghost" className="h-8 px-2">
              Voir
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimization
  return (
    prevProps.business._id === nextProps.business._id &&
    prevProps.business.completion_score === nextProps.business.completion_score &&
    prevProps.business.website_url === nextProps.business.website_url &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.business.agents_status) === JSON.stringify(nextProps.business.agents_status) &&
    JSON.stringify(prevProps.business.metrics) === JSON.stringify(nextProps.business.metrics)
  );
});

MemoizedBusinessCard.displayName = 'MemoizedBusinessCard';