"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  Users,
  Globe,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Zap
} from "lucide-react";
import { useState } from "react";

interface ModernAnalysisDisplayProps {
  analysis: any;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Fonction utilitaire pour gérer les valeurs qui peuvent être objets ou strings
const getValue = (value: any): string => {
  if (!value) return "N/A";
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return value.value || value.details || JSON.stringify(value);
  }
  return String(value);
};

export function ModernAnalysisDisplay({ analysis, onRefresh, isLoading }: ModernAnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pestel' | 'swot' | 'target'>('overview');

  if (!analysis) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Analyse de marché non disponible</h3>
              <p className="text-sm text-muted-foreground">
                Lancez une analyse pour obtenir des insights détaillés
              </p>
            </div>
            {onRefresh && (
              <Button onClick={onRefresh} className="mt-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer l'analyse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taille du marché</p>
                <p className="text-2xl font-bold mt-1">
                  {getValue(analysis.market_overview?.market_size)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Croissance</p>
                <p className="text-2xl font-bold mt-1">
                  {getValue(analysis.market_overview?.growth_rate)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturité</p>
                <p className="text-2xl font-bold mt-1">
                  {getValue(analysis.market_overview?.market_maturity)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concurrents</p>
                <p className="text-2xl font-bold mt-1">
                  {analysis.market_overview?.key_players?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analyse détaillée</CardTitle>
              <CardDescription>Insights et recommandations stratégiques</CardDescription>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 border-b mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('target')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'target'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Audience
            </button>
            <button
              onClick={() => setActiveTab('pestel')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'pestel'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldAlert className="w-4 h-4 inline mr-2" />
              PESTEL
            </button>
            <button
              onClick={() => setActiveTab('swot')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'swot'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              SWOT
            </button>
          </div>

          {/* Content des tabs */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              {analysis.executive_summary && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Résumé exécutif</h3>
                  <div className="grid gap-4">
                    {analysis.executive_summary.key_findings && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium mb-2 text-blue-900">Découvertes clés</h4>
                        <ul className="space-y-2">
                          {analysis.executive_summary.key_findings.map((finding: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{getValue(finding)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Segments de marché */}
              {analysis.market_overview?.market_segments && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Segments de marché</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.market_overview.market_segments.map((segment: any, idx: number) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">{getValue(segment.name)}</h4>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              +{getValue(segment.growth)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Taille: {getValue(segment.size)}
                          </p>
                          {segment.characteristics && (
                            <div className="flex flex-wrap gap-1">
                              {segment.characteristics.map((char: any, charIdx: number) => (
                                <Badge key={charIdx} variant="outline" className="text-xs">
                                  {getValue(char)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Concurrents principaux */}
              {analysis.market_overview?.key_players && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Concurrents principaux</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.market_overview.key_players.map((player: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1.5">
                        {getValue(player)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'target' && analysis.target_audience && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audience principale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{getValue(analysis.target_audience.primary)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audience secondaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{getValue(analysis.target_audience.secondary)}</p>
                  </CardContent>
                </Card>
              </div>

              {analysis.target_audience.demographics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Démographie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Âge</p>
                        <p className="font-medium">{getValue(analysis.target_audience.demographics.age)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenu</p>
                        <p className="font-medium">{getValue(analysis.target_audience.demographics.income)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium">{getValue(analysis.target_audience.demographics.location)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.target_audience.pain_points && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Points de douleur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.target_audience.pain_points.map((point: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                          <span>{getValue(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'pestel' && analysis.pestel_analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.pestel_analysis).map(([category, data]: [string, any]) => {
                const factors = Array.isArray(data) ? data : (data.factors || []);
                const impact = !Array.isArray(data) ? getValue(data.impact) : null;
                const riskLevel = !Array.isArray(data) ? data.risk_level : null;

                const getRiskColor = (level: string) => {
                  if (!level) return 'gray';
                  if (level.toLowerCase() === 'high') return 'red';
                  if (level.toLowerCase() === 'medium') return 'yellow';
                  return 'green';
                };

                const color = getRiskColor(riskLevel);

                return (
                  <Card key={category}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base capitalize">
                          {category.replace(/_/g, ' ')}
                        </CardTitle>
                        {riskLevel && (
                          <Badge
                            variant="outline"
                            className={`
                              ${color === 'red' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                              ${color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                              ${color === 'green' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            `}
                          >
                            {riskLevel}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-3">
                        {factors.map((factor: any, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{getValue(factor)}</span>
                          </li>
                        ))}
                      </ul>
                      {impact && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                          <strong>Impact:</strong> {impact}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'swot' && analysis.swot_analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {analysis.swot_analysis.strengths && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-base text-green-900">Forces</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.swot_analysis.strengths.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{getValue(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {analysis.swot_analysis.weaknesses && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="text-base text-red-900">Faiblesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.swot_analysis.weaknesses.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{getValue(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Opportunities */}
              {analysis.swot_analysis.opportunities && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-900">Opportunités</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.swot_analysis.opportunities.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                          <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{getValue(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Threats */}
              {analysis.swot_analysis.threats && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="text-base text-orange-900">Menaces</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.swot_analysis.threats.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{getValue(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations stratégiques */}
      {analysis.strategic_recommendations && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Recommandations stratégiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.strategic_recommendations.map((rec: any, idx: number) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                  </div>
                  <span className="text-sm">{getValue(rec)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
