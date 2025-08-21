"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AgentStatusProps {
  business: any;
  onRefresh?: () => void;
}

const agentConfigs = {
  market_analysis: {
    icon: Target,
    label: "Analyse de marché",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10"
  },
  competitor_analysis: {
    icon: BarChart3,
    label: "Analyse concurrentielle",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10"
  },
  marketing_strategy: {
    icon: TrendingUp,
    label: "Stratégie marketing",
    color: "text-green-600",
    bgColor: "bg-green-600/10"
  },
  website_prompt: {
    icon: Globe,
    label: "Prompt site web",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10"
  }
};

export function AgentStatus({ business, onRefresh }: AgentStatusProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [allAnalysesComplete, setAllAnalysesComplete] = useState(false);
  const [rerunningAnalysis, setRerunningAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si toutes les analyses sont terminées
    const statuses = business.agents_status || {};
    const allComplete = Object.values(statuses).every(status => status === 'completed');
    setAllAnalysesComplete(allComplete);
  }, [business.agents_status]);

  const handleGenerateWebsite = async () => {
    setIsGenerating(true);
    try {
      // Rediriger vers l'éditeur avec le prompt généré
      const prompt = encodeURIComponent(business.website_prompt?.prompt || "");
      router.push(`/sites/new?businessId=${business.business_id}&businessName=${encodeURIComponent(business.name)}&prompt=${prompt}`);
    } catch (error: any) {
      console.error("Erreur génération site:", error);
      toast.error("Erreur lors de la génération du site web");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Terminé</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En cours</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const calculateProgress = () => {
    const statuses = Object.values(business.agents_status || {});
    const completed = statuses.filter(s => s === 'completed').length;
    return (completed / statuses.length) * 100;
  };

  const handleRerunAnalysis = async (analysisType: string) => {
    setRerunningAnalysis(analysisType);
    try {
      // Appeler l'API pour relancer l'analyse
      await api.post(`/api/me/business/${business.business_id}/rerun-analysis`, {
        analysisType
      });
      
      toast.success(`Analyse ${agentConfigs[analysisType as keyof typeof agentConfigs]?.label} relancée`);
      
      // Polling pour vérifier le statut
      let attempts = 0;
      const maxAttempts = 15; // 30 secondes max
      
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const response = await api.get(`/api/me/business/${business.business_id}/rerun-analysis`);
          const { agents_status } = response.data;
          
          if (agents_status[analysisType] === 'completed' || attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setRerunningAnalysis(null);
            // Actualiser les données
            if (onRefresh) {
              onRefresh();
            } else {
              window.location.reload();
            }
          } else if (agents_status[analysisType] === 'error') {
            clearInterval(pollInterval);
            setRerunningAnalysis(null);
            toast.error("Erreur lors de l'analyse");
          }
        } catch (error) {
          console.error("Erreur lors du polling:", error);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setRerunningAnalysis(null);
          }
        }
      }, 2000); // Vérifier toutes les 2 secondes
      
    } catch (error) {
      console.error("Erreur lors de la relance de l'analyse:", error);
      toast.error("Erreur lors de la relance de l'analyse");
      setRerunningAnalysis(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analyses automatiques</span>
          {allAnalysesComplete && (
            <Badge variant="success" className="ml-2">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Toutes les analyses terminées
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression globale</span>
            <span className="font-medium">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        <div className="grid gap-3">
          {Object.entries(business.agents_status || {}).map(([agent, status]) => {
            const config = agentConfigs[agent as keyof typeof agentConfigs];
            if (!config) return null;
            
            const Icon = config.icon;
            
            return (
              <div
                key={agent}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{config.label}</p>
                    {status === 'completed' && business[agent] && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Données disponibles
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status as string)}
                  {getStatusBadge(status as string)}
                  {(status === 'completed' || status === 'failed') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRerunAnalysis(agent)}
                      disabled={rerunningAnalysis === agent}
                      title="Relancer l'analyse"
                    >
                      {rerunningAnalysis === agent ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allAnalysesComplete && business.website_prompt?.prompt && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleGenerateWebsite}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Créer le site web avec les recommandations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Le site sera créé en utilisant le prompt optimisé par nos agents
            </p>
          </div>
        )}

        {!allAnalysesComplete && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                Les agents analysent votre business en arrière-plan...
              </span>
            </div>
            {Object.values(business.agents_status || {}).some(
              (status: any) => status === 'in_progress'
            ) && (
              <p className="text-xs text-center text-muted-foreground mt-1">
                Mise à jour automatique activée
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}