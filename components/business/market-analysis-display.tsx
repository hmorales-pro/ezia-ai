"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Target, AlertTriangle, Lightbulb, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { IMarketAnalysis } from "@/models/MarketAnalysis";

interface MarketAnalysisDisplayProps {
  businessId: string;
  autoStart?: boolean; // Déclenche auto la génération si pas d'analyse
  onAnalysisComplete?: () => void; // Callback quand l'analyse est terminée
}

export function MarketAnalysisDisplay({ businessId, autoStart = false, onAnalysisComplete }: MarketAnalysisDisplayProps) {
  const [analysis, setAnalysis] = useState<IMarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [businessId]);

  // Auto-start si activé et pas encore lancé
  useEffect(() => {
    if (autoStart && !analysis && !loading && !generating && !autoStarted) {
      console.log('[MarketAnalysis] Auto-start détecté');
      setAutoStarted(true);
      generateAnalysis(false);
    }
  }, [autoStart, analysis, loading, generating, autoStarted]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/me/business/${businessId}/market-analysis`);
      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Erreur chargement analyse:", error);
      toast.error("Erreur lors du chargement de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async (forceRefresh = false) => {
    try {
      setGenerating(true);
      toast.info("Génération de l'analyse de marché en cours...");

      const response = await fetch(`/api/me/business/${businessId}/market-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success(`Analyse générée ! MOI: ${data.moi}/100`);

        // Notifier que l'analyse est terminée (pour lancer la stratégie marketing)
        if (onAnalysisComplete) {
          console.log('[MarketAnalysis] Analyse terminée, notification du parent');
          onAnalysisComplete();
        }
      } else {
        toast.error(data.error || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      toast.error("Erreur lors de la génération de l'analyse");
    } finally {
      setGenerating(false);
    }
  };

  const downloadMarkdown = () => {
    if (!analysis?.reports?.markdown) {
      toast.error("Aucun rapport disponible");
      return;
    }

    const blob = new Blob([analysis.reports.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-analysis-${analysis.business_name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport téléchargé");
  };

  const exportToPDF = () => {
    if (!analysis) {
      toast.error("Aucune analyse disponible");
      return;
    }

    // Ouvrir la boîte de dialogue d'impression du navigateur
    // L'utilisateur peut ensuite choisir "Enregistrer au format PDF"
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analyse de Marché
          </CardTitle>
          <CardDescription>
            Générez une analyse de marché complète avec stratégie Ocean Blue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aucune analyse de marché n'a encore été générée pour ce business.
            Cliquez ci-dessous pour lancer une analyse automatique.
          </p>
          <Button
            onClick={() => generateAnalysis(false)}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Générer l'analyse de marché
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { scoring, market_overview, competition, opportunities, threats, ocean_blue_strategy } = analysis;

  return (
    <div className="space-y-6">
      {/* Header avec MOI et actions */}
      <Card className="border-2 border-[#6D3FC8]/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#6D3FC8]" />
                Analyse de Marché
              </CardTitle>
              <CardDescription className="mt-2">
                {analysis.business_name} • {analysis.industry}
              </CardDescription>
            </div>
            <div className="flex gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadMarkdown}
                disabled={!analysis.reports?.markdown}
                className="no-print"
              >
                <Download className="w-4 h-4 mr-2" />
                Export MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="no-print"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAnalysis(true)}
                disabled={generating}
                className="no-print"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Rafraîchir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* MOI Score */}
          <div className="bg-gradient-to-br from-[#6D3FC8]/10 to-[#8B5CF6]/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Market Opportunity Index
                </h3>
                <p className="text-5xl font-bold text-[#6D3FC8]">
                  {scoring.market_opportunity_index}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </p>
              </div>
              <Badge
                variant={
                  scoring.confidence_level === "high"
                    ? "default"
                    : scoring.confidence_level === "medium"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm px-3 py-1"
              >
                Confiance: {scoring.confidence_level === "high" ? "🟢 Élevée" : scoring.confidence_level === "medium" ? "🟡 Moyenne" : "🔴 Faible"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {scoring.scoring_rationale}
            </p>
          </div>

          {/* Scoring détaillé */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoringCard
              title="Attractivité Marché"
              score={scoring.market_attractiveness}
              icon={<TrendingUp className="w-4 h-4" />}
              type="positive"
            />
            <ScoringCard
              title="Intensité Concurrence"
              score={scoring.competitive_intensity}
              icon={<Users className="w-4 h-4" />}
              type="negative"
            />
            <ScoringCard
              title="Difficulté Entrée"
              score={scoring.entry_difficulty}
              icon={<AlertTriangle className="w-4 h-4" />}
              type="negative"
            />
            <ScoringCard
              title="Potentiel Croissance"
              score={scoring.growth_potential}
              icon={<TrendingUp className="w-4 h-4" />}
              type="positive"
            />
            <ScoringCard
              title="Demande Client"
              score={scoring.customer_demand}
              icon={<Users className="w-4 h-4" />}
              type="positive"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vue d'ensemble du marché */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Vue d'ensemble du marché
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Taille du marché</h4>
              <p className="text-lg font-semibold">{market_overview.market_size}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Taux de croissance</h4>
              <p className="text-lg font-semibold">{market_overview.growth_rate}</p>
            </div>
          </div>

          {market_overview.trends && market_overview.trends.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Tendances clés</h4>
              <div className="flex flex-wrap gap-2">
                {market_overview.trends.map((trend, idx) => (
                  <Badge key={idx} variant="secondary">
                    {trend}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {market_overview.segments && market_overview.segments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Segments de marché</h4>
              <div className="space-y-3">
                {market_overview.segments.map((segment, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <h5 className="font-semibold mb-1">{segment.name}</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Taille: {segment.size}</div>
                      <div>Croissance: {segment.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stratégie Ocean Blue */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Stratégie Océan Bleu
          </CardTitle>
          <CardDescription>{ocean_blue_strategy.value_proposition}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Explication de la stratégie Ocean Blue */}
          <div className="mb-6 p-4 bg-white/80 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              Qu&apos;est-ce que la Stratégie Océan Bleu ?
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              La <strong>Stratégie Océan Bleu</strong> (Blue Ocean Strategy) est un cadre stratégique qui vise à créer un nouvel espace de marché inexploité plutôt que de se battre dans un marché saturé (océan rouge).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-red-700">Éliminer</strong> : Quels facteurs que le secteur considère comme acquis doivent être éliminés ?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-orange-700">Réduire</strong> : Quels facteurs doivent être réduits bien en-dessous des standards du secteur ?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-green-700">Augmenter</strong> : Quels facteurs doivent être augmentés bien au-dessus des standards du secteur ?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                <div>
                  <strong className="text-blue-700">Créer</strong> : Quels facteurs qui n&apos;ont jamais été offerts doivent être créés ?
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OceanBlueSection
              title="Éliminer"
              items={ocean_blue_strategy.eliminate}
              color="red"
            />
            <OceanBlueSection
              title="Réduire"
              items={ocean_blue_strategy.reduce}
              color="orange"
            />
            <OceanBlueSection
              title="Augmenter"
              items={ocean_blue_strategy.increase}
              color="green"
            />
            <OceanBlueSection
              title="Créer"
              items={ocean_blue_strategy.create}
              color="blue"
            />
          </div>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Marché cible</h4>
            <p className="text-sm text-blue-800">{ocean_blue_strategy.target_market}</p>
          </div>
        </CardContent>
      </Card>

      {/* Opportunités et Menaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              Opportunités ({opportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{opp.title}</h4>
                  <Badge
                    variant={
                      opp.potential_impact === "high"
                        ? "default"
                        : opp.potential_impact === "medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {opp.potential_impact === "high" ? "🔥 Élevé" : opp.potential_impact === "medium" ? "⚡ Moyen" : "💡 Faible"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{opp.description}</p>
                <div className="text-xs text-muted-foreground">
                  Délai: {opp.timeframe}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Menaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Menaces ({threats.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {threats.map((threat, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{threat.title}</h4>
                  <div className="flex gap-1">
                    <Badge
                      variant={
                        threat.severity === "high"
                          ? "destructive"
                          : threat.severity === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {threat.severity === "high" ? "🔴" : threat.severity === "medium" ? "🟡" : "🟢"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{threat.description}</p>
                {threat.mitigation && threat.mitigation.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Mitigation:</strong> {threat.mitigation.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Concurrence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Analyse Concurrentielle
          </CardTitle>
          <CardDescription>{competition.competitive_landscape}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competition.main_competitors.map((competitor, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold">{competitor.name}</h4>
                  <Badge variant="outline" className="mt-1">
                    {competitor.position}
                  </Badge>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-green-600 mb-1">Forces</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {competitor.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-red-600 mb-1">Faiblesses</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {competitor.weaknesses.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métadonnées - Masqué à l'impression */}
      <Card className="border-dashed no-print">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Informations sur l&apos;analyse
          </CardTitle>
          <CardDescription>
            Cette analyse de marché a été générée automatiquement par notre IA et sera mise à jour régulièrement pour rester pertinente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                Date de génération
              </div>
              <div className="text-lg font-semibold">
                {new Date(analysis.meta.generated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Il y a {Math.max(0, Math.round((Date.now() - new Date(analysis.meta.generated_at).getTime()) / (1000 * 60 * 60 * 24)))} jour(s)
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                </svg>
                Prochaine mise à jour
              </div>
              <div className="text-lg font-semibold">
                {new Date(analysis.meta.next_refresh_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Dans {Math.max(0, Math.round((new Date(analysis.meta.next_refresh_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} jour(s)
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Fréquence de mise à jour
              </div>
              <div className="text-lg font-semibold">
                {analysis.meta.refresh_frequency === 'monthly' ? 'Mensuelle' : analysis.meta.refresh_frequency === 'quarterly' ? 'Trimestrielle' : 'Hebdomadaire'}
              </div>
              <p className="text-xs text-muted-foreground">
                Actualisations automatiques
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-server">
                  <rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect>
                  <rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect>
                  <line x1="6" x2="6.01" y1="6" y2="6"></line>
                  <line x1="6" x2="6.01" y1="18" y2="18"></line>
                </svg>
                Infrastructure IA
              </div>
              <div className="text-lg font-semibold">
                {(analysis.meta as any).ai_model || 'DeepSeek V3'}
              </div>
              <p className="text-xs text-muted-foreground">
                Hébergé par Hugging Face 🇫🇷
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoringCard({
  title,
  score,
  icon,
  type,
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
  type: "positive" | "negative";
}) {
  const getColor = () => {
    if (type === "positive") {
      if (score >= 70) return "text-green-600 bg-green-50 border-green-200";
      if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-red-600 bg-red-50 border-red-200";
    } else {
      if (score >= 70) return "text-red-600 bg-red-50 border-red-200";
      if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      <p className="text-2xl font-bold">{score}/100</p>
    </div>
  );
}

function OceanBlueSection({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "red" | "orange" | "green" | "blue";
}) {
  const colorClasses = {
    red: "bg-red-50 border-red-200 text-red-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    green: "bg-green-50 border-green-200 text-green-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
