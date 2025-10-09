"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Megaphone,
  Calendar,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

interface ModernStrategyDisplayProps {
  strategy: any;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Fonction utilitaire pour gérer les valeurs
const getValue = (value: any): string => {
  if (!value) return "N/A";
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return value.value || value.details || JSON.stringify(value);
  }
  return String(value);
};

export function ModernStrategyDisplay({ strategy, onRefresh, isLoading }: ModernStrategyDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'content' | 'roadmap'>('overview');

  if (!strategy) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto">
              <Megaphone className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Stratégie marketing non disponible</h3>
              <p className="text-sm text-muted-foreground">
                Générez une stratégie pour définir votre plan d'action
              </p>
            </div>
            {onRefresh && (
              <Button onClick={onRefresh} className="mt-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer la stratégie
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget estimé</p>
                <p className="text-2xl font-bold mt-1">
                  {getValue(strategy.budget_allocation?.total_budget || strategy.total_budget)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canaux marketing</p>
                <p className="text-2xl font-bold mt-1">
                  {strategy.marketing_channels?.length || strategy.channels?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Segments ciblés</p>
                <p className="text-2xl font-bold mt-1">
                  {strategy.target_segments?.length || strategy.segments?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions planifiées</p>
                <p className="text-2xl font-bold mt-1">
                  {strategy.action_plan?.length || strategy.quarterly_plan?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
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
              <CardTitle>Stratégie marketing</CardTitle>
              <CardDescription>Plan d'action et recommandations</CardDescription>
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
              <Target className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'channels'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Megaphone className="w-4 h-4 inline mr-2" />
              Canaux
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'content'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Contenu
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'roadmap'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Roadmap
            </button>
          </div>

          {/* Content des tabs */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Positionnement */}
              {strategy.positioning && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Positionnement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{getValue(strategy.positioning)}</p>
                  </CardContent>
                </Card>
              )}

              {/* Value Proposition */}
              {strategy.value_proposition && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">Proposition de valeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{getValue(strategy.value_proposition)}</p>
                  </CardContent>
                </Card>
              )}

              {/* Target Segments */}
              {(strategy.target_segments || strategy.segments) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Segments cibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(strategy.target_segments || strategy.segments).map((segment: any, idx: number) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">{getValue(segment.name || segment)}</h4>
                          {segment.characteristics && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              {(strategy.marketing_channels || strategy.channels || []).map((channel: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{getValue(channel.name || channel.channel || channel)}</CardTitle>
                      {channel.priority && (
                        <Badge variant={channel.priority === 'high' ? 'default' : 'secondary'}>
                          {getValue(channel.priority)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {channel.description && (
                      <p className="text-sm text-muted-foreground">{getValue(channel.description)}</p>
                    )}
                    {channel.tactics && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tactiques:</p>
                        <ul className="space-y-1">
                          {channel.tactics.map((tactic: any, tacticIdx: number) => (
                            <li key={tacticIdx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{getValue(tactic)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {channel.budget && (
                      <div className="pt-3 border-t">
                        <p className="text-sm"><strong>Budget:</strong> {getValue(channel.budget)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {strategy.content_strategy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Stratégie de contenu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strategy.content_strategy.themes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Thèmes principaux:</p>
                        <div className="flex flex-wrap gap-2">
                          {strategy.content_strategy.themes.map((theme: any, idx: number) => (
                            <Badge key={idx} variant="secondary">{getValue(theme)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {strategy.content_strategy.content_types && (
                      <div>
                        <p className="text-sm font-medium mb-2">Types de contenu:</p>
                        <ul className="space-y-1">
                          {strategy.content_strategy.content_types.map((type: any, idx: number) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                              {getValue(type)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              {(strategy.action_plan || strategy.quarterly_plan || []).map((action: any, idx: number) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{getValue(action.title || action.action || action.objective || action)}</h4>
                      {action.timeline && (
                        <Badge variant="outline">{getValue(action.timeline)}</Badge>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-sm text-muted-foreground mb-3">{getValue(action.description)}</p>
                    )}
                    {action.kpis && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-1">KPIs:</p>
                        <div className="flex flex-wrap gap-1">
                          {action.kpis.map((kpi: any, kpiIdx: number) => (
                            <Badge key={kpiIdx} variant="secondary" className="text-xs">
                              {getValue(kpi)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques de succès */}
      {strategy.success_metrics && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Métriques de succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy.success_metrics.map((metric: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded-lg border">
                  <p className="font-medium mb-1">{getValue(metric.name || metric.metric || metric)}</p>
                  {metric.target && (
                    <p className="text-sm text-muted-foreground">Cible: {getValue(metric.target)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
