"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Globe, 
  Shield,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  Zap,
  Info
} from "lucide-react";
import { SourcesDisplay } from "./sources-display";

interface MarketAnalysisDisplayProps {
  analysis: any;
}

export function MarketAnalysisDisplay({ analysis }: MarketAnalysisDisplayProps) {
  if (!analysis) return null;

  // Helper to check if an object has any non-empty values
  const hasData = (obj: any): boolean => {
    if (!obj) return false;
    if (Array.isArray(obj)) return obj.length > 0;
    if (typeof obj === 'string') return obj.trim().length > 0;
    if (typeof obj === 'object') {
      return Object.values(obj).some((value) => hasData(value));
    }
    return Boolean(obj);
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary - Only show if we have data */}
      {analysis.executive_summary && (
        (analysis.executive_summary.key_findings?.length > 0 ||
         analysis.executive_summary.market_opportunity ||
         analysis.executive_summary.growth_forecast ||
         analysis.executive_summary.strategic_positioning) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#6D3FC8]" />
                Résumé Exécutif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.executive_summary.key_findings?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Points clés</h4>
                  <ul className="space-y-2">
                    {analysis.executive_summary.key_findings.map((finding: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#6D3FC8] mt-1">•</span>
                        <span className="text-sm text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {(analysis.executive_summary.market_opportunity || analysis.executive_summary.growth_forecast) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.executive_summary.market_opportunity && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-[#6D3FC8] mb-1">Opportunité de marché</h5>
                      <p className="text-sm">{analysis.executive_summary.market_opportunity}</p>
                    </div>
                  )}
                  {analysis.executive_summary.growth_forecast && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-700 mb-1">Prévision de croissance</h5>
                      <p className="text-sm">{analysis.executive_summary.growth_forecast}</p>
                    </div>
                  )}
                </div>
              )}

              {analysis.executive_summary.strategic_positioning && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-1">Positionnement stratégique</h5>
                  <p className="text-sm">{analysis.executive_summary.strategic_positioning}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          {hasData(analysis.target_audience) && <TabsTrigger value="audience">Public cible</TabsTrigger>}
          <TabsTrigger value="pestel">PESTEL</TabsTrigger>
          <TabsTrigger value="porter">5 Forces</TabsTrigger>
          <TabsTrigger value="swot">SWOT</TabsTrigger>
          <TabsTrigger value="strategy">Stratégie</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Market Overview */}
          {hasData(analysis.market_overview) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Vue d'ensemble du marché
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysis.market_overview?.market_size || analysis.market_overview?.growth_rate || analysis.market_overview?.market_maturity) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.market_overview.market_size && (
                      <div>
                        <p className="text-sm text-gray-500">Taille du marché</p>
                        <p className="font-semibold">{analysis.market_overview.market_size}</p>
                      </div>
                    )}
                    {analysis.market_overview.growth_rate && (
                      <div>
                        <p className="text-sm text-gray-500">Taux de croissance</p>
                        <p className="font-semibold">{analysis.market_overview.growth_rate}</p>
                      </div>
                    )}
                    {analysis.market_overview.market_maturity && (
                      <div>
                        <p className="text-sm text-gray-500">Maturité</p>
                        <p className="font-semibold">{analysis.market_overview.market_maturity}</p>
                      </div>
                    )}
                  </div>
                )}

              {analysis.market_overview?.key_players && (
                <div>
                  <h4 className="font-medium mb-2">Acteurs principaux</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.market_overview.key_players.map((player: string, idx: number) => (
                      <Badge key={idx} variant="outline">{player}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.market_overview?.market_segments && (
                <div>
                  <h4 className="font-medium mb-3">Segments de marché</h4>
                  <div className="space-y-3">
                    {analysis.market_overview.market_segments.map((segment: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{segment.name}</h5>
                          <Badge className="bg-green-100 text-green-700">+{segment.growth}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Taille: {segment.size}</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.characteristics?.map((char: string, charIdx: number) => (
                            <Badge key={charIdx} variant="secondary" className="text-xs">{char}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Trends Analysis - Only show if we have data */}
          {analysis.trends_analysis && (
            (analysis.trends_analysis.current_trends?.length > 0 ||
             analysis.trends_analysis.emerging_trends?.length > 0 ||
             analysis.trends_analysis.declining_trends?.length > 0 ||
             analysis.trends_analysis.future_projections?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Analyse des tendances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.trends_analysis.current_trends?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Tendances actuelles</h4>
                        <ul className="space-y-1">
                          {analysis.trends_analysis.current_trends.map((trend: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-1">
                              <TrendingUp className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {trend}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.trends_analysis.emerging_trends?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">Tendances émergentes</h4>
                        <ul className="space-y-1">
                          {analysis.trends_analysis.emerging_trends.map((trend: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-1">
                              <Zap className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              {trend}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.trends_analysis.declining_trends?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-gray-700">Tendances déclinantes</h4>
                        <ul className="space-y-1">
                          {analysis.trends_analysis.declining_trends.map((trend: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                              {trend}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {analysis.trends_analysis.future_projections?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Projections futures</h4>
                      <div className="space-y-2">
                        {analysis.trends_analysis.future_projections.map((proj: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{proj.year}</span>
                              <span className="ml-2 text-sm">{proj.projection}</span>
                            </div>
                            <Badge className={getLevelColor(proj.confidence)}>
                              Confiance {proj.confidence === 'high' ? 'élevée' : proj.confidence === 'medium' ? 'moyenne' : 'faible'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
          
          {/* Show message if no data available */}
          {!hasData(analysis.market_overview) && !hasData(analysis.trends_analysis) && (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">Aucune donnée de marché disponible</p>
                <p className="text-sm text-gray-400">Les analyses détaillées seront disponibles après génération</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          {hasData(analysis.target_audience) ? (
            <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Public cible
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysis.target_audience?.primary || analysis.target_audience?.secondary) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.target_audience.primary && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-[#6D3FC8] mb-2">Cible principale</h4>
                        <p className="text-sm">{analysis.target_audience.primary}</p>
                      </div>
                    )}
                    {analysis.target_audience.secondary && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">Cible secondaire</h4>
                        <p className="text-sm">{analysis.target_audience.secondary}</p>
                      </div>
                    )}
                  </div>
                )}

              {analysis.target_audience?.demographics && (
                <div>
                  <h4 className="font-medium mb-3">Données démographiques</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(analysis.target_audience.demographics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                        <p className="font-medium text-sm">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.target_audience?.psychographics && (
                  <div>
                    <h4 className="font-medium mb-2">Psychographie</h4>
                    <ul className="space-y-1">
                      {analysis.target_audience.psychographics.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-[#6D3FC8]">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.target_audience?.pain_points && (
                  <div>
                    <h4 className="font-medium mb-2">Points de douleur</h4>
                    <ul className="space-y-1">
                      {analysis.target_audience.pain_points.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {analysis.target_audience?.buying_behavior && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-1">Comportement d'achat</h4>
                  <p className="text-sm">{analysis.target_audience.buying_behavior}</p>
                </div>
              )}
            </CardContent>
          </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Public cible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune donnée sur le public cible disponible</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pestel" className="space-y-4">
          {analysis.pestel_analysis && Object.keys(analysis.pestel_analysis).length > 0 ? (
            <>
            <Card>
              <CardHeader>
                <CardTitle>Analyse PESTEL</CardTitle>
                <CardDescription>Facteurs macro-environnementaux affectant le marché</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.pestel_analysis).map(([category, data]) => {
                    // Gérer les deux formats : array simple ou objet avec factors/impact/risk_level
                    const factors = Array.isArray(data) ? data : (data as any).factors || [];
                    const impact = !Array.isArray(data) ? (data as any).impact : null;
                    const riskLevel = !Array.isArray(data) ? (data as any).risk_level : null;
                    
                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-medium capitalize mb-3 flex items-center gap-2">
                          {category === 'political' && <Shield className="w-4 h-4 text-blue-600" />}
                          {category === 'economic' && <BarChart3 className="w-4 h-4 text-green-600" />}
                          {category === 'social' && <Users className="w-4 h-4 text-purple-600" />}
                          {category === 'technological' && <Zap className="w-4 h-4 text-orange-600" />}
                          {category === 'environmental' && <Globe className="w-4 h-4 text-emerald-600" />}
                          {category === 'legal' && <Shield className="w-4 h-4 text-red-600" />}
                          {category === 'political' ? 'Politique' :
                           category === 'economic' ? 'Économique' :
                           category === 'social' ? 'Social' :
                           category === 'technological' ? 'Technologique' :
                           category === 'environmental' ? 'Environnemental' :
                           category === 'legal' ? 'Légal' : category}
                          {riskLevel && (
                            <Badge className={`ml-auto ${getLevelColor(riskLevel)}`}>
                              {riskLevel === 'high' ? 'Risque élevé' : riskLevel === 'medium' ? 'Risque moyen' : 'Risque faible'}
                            </Badge>
                          )}
                        </h4>
                        {factors.length > 0 && (
                          <ul className="space-y-2">
                            {factors.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {impact && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-600">Impact:</p>
                            <p className="text-sm text-gray-700">{impact}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Analyse PESTEL</CardTitle>
                <CardDescription>Facteurs macro-environnementaux affectant le marché</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">Analyse PESTEL non disponible</p>
                  <p className="text-sm text-gray-400">Cette analyse approfondie sera disponible prochainement</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="porter" className="space-y-4">
          {analysis.porter_five_forces && Object.keys(analysis.porter_five_forces).length > 0 ? (
            <>
            <Card>
              <CardHeader>
                <CardTitle>Analyse des 5 Forces de Porter</CardTitle>
                <CardDescription>Évaluation de l'intensité concurrentielle et de l'attractivité du marché</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.porter_five_forces).map(([force, data]: [string, any]) => (
                  <div key={force} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">
                        {force === 'threat_of_new_entrants' ? 'Menace de nouveaux entrants' :
                         force === 'bargaining_power_suppliers' || force === 'bargaining_power_of_suppliers' ? 'Pouvoir de négociation des fournisseurs' :
                         force === 'bargaining_power_buyers' || force === 'bargaining_power_of_buyers' ? 'Pouvoir de négociation des clients' :
                         force === 'threat_of_substitutes' ? 'Menace des produits de substitution' :
                         force === 'competitive_rivalry' ? 'Intensité concurrentielle' : force}
                      </h4>
                      <Badge className={getLevelColor(data.level)}>
                        {data.level === 'high' ? 'Élevé' : data.level === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                    </div>
                    
                    {/* Gérer différents formats de données */}
                    {data.factors && data.factors.length > 0 && (
                      <ul className="space-y-1">
                        {data.factors.map((factor: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {data.barriers && data.barriers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Barrières:</p>
                        <ul className="space-y-1">
                          {data.barriers.map((barrier: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {barrier}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {data.key_suppliers && data.key_suppliers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Fournisseurs clés:</p>
                        <ul className="space-y-1">
                          {data.key_suppliers.map((supplier: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {supplier}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {data.substitutes && data.substitutes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Substituts:</p>
                        <ul className="space-y-1">
                          {data.substitutes.map((substitute: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {substitute}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {data.main_competitors && data.main_competitors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Concurrents principaux:</p>
                        <ul className="space-y-1">
                          {data.main_competitors.map((competitor: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {competitor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {data.analysis && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-700">{data.analysis}</p>
                      </div>
                    )}
                    
                    {data.buyer_concentration && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600"><span className="font-medium">Concentration:</span> {data.buyer_concentration}</p>
                      </div>
                    )}
                    
                    {(!data.factors || data.factors.length === 0) && 
                     (!data.barriers || data.barriers.length === 0) &&
                     (!data.analysis) && (
                      <p className="text-sm text-gray-500 italic">Analyse détaillée disponible prochainement</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Analyse des 5 Forces de Porter</CardTitle>
                <CardDescription>Évaluation de l'intensité concurrentielle et de l'attractivité du marché</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">Analyse des 5 Forces non disponible</p>
                  <p className="text-sm text-gray-400">Cette analyse approfondie sera disponible prochainement</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="swot" className="space-y-4">
          {/* Action buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse SWOT</CardTitle>
              <CardDescription>Forces, Faiblesses, Opportunités et Menaces</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.swot_analysis && (
                (analysis.swot_analysis.strengths?.length > 0 ||
                 analysis.swot_analysis.weaknesses?.length > 0 ||
                 analysis.swot_analysis.opportunities?.length > 0 ||
                 analysis.swot_analysis.threats?.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.swot_analysis.strengths?.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Forces
                        </h4>
                        <ul className="space-y-2">
                          {analysis.swot_analysis.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">+</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.swot_analysis.weaknesses?.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Faiblesses
                        </h4>
                        <ul className="space-y-2">
                          {analysis.swot_analysis.weaknesses.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">-</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.swot_analysis.opportunities?.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Opportunités
                        </h4>
                        <ul className="space-y-2">
                          {analysis.swot_analysis.opportunities.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">↗</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.swot_analysis.threats?.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Menaces
                        </h4>
                        <ul className="space-y-2">
                          {analysis.swot_analysis.threats.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-yellow-600 mt-0.5">!</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune donnée SWOT disponible</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          
          {/* Strategic Recommendations */}
          {hasData(analysis.strategic_recommendations) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommandations stratégiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis.strategic_recommendations?.immediate_actions?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Actions immédiates</h4>
                  <div className="space-y-3">
                    {analysis.strategic_recommendations.immediate_actions.map((action: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium flex-1">{action.action}</h5>
                          <span className="text-sm text-gray-500 ml-4">{action.timeline}</span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Impact:</span>
                            <div className="flex gap-1">
                              {[1,2,3].map(i => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-2 rounded-full ${
                                    i <= (action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1) 
                                      ? getImpactColor(action.impact) 
                                      : 'bg-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Effort:</span>
                            <div className="flex gap-1">
                              {[1,2,3].map(i => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-2 rounded-full ${
                                    i <= (action.effort === 'high' ? 3 : action.effort === 'medium' ? 2 : 1) 
                                      ? 'bg-gray-600' 
                                      : 'bg-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.strategic_recommendations?.medium_term_strategies && (
                <div>
                  <h4 className="font-medium mb-3">Stratégies à moyen terme</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.strategic_recommendations.medium_term_strategies.map((strategy: string, idx: number) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">→</span>
                        <span className="text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.strategic_recommendations?.long_term_vision && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-[#6D3FC8] mb-2">Vision à long terme</h4>
                  <p className="text-sm">{analysis.strategic_recommendations.long_term_vision}</p>
                </div>
              )}

              {analysis.strategic_recommendations?.risk_mitigation && (
                <div>
                  <h4 className="font-medium mb-3">Atténuation des risques</h4>
                  <div className="space-y-3">
                    {analysis.strategic_recommendations.risk_mitigation.map((item: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-red-700">{item.risk}</h5>
                          <Badge className={getLevelColor(item.priority)}>
                            Priorité {item.priority === 'high' ? 'haute' : item.priority === 'medium' ? 'moyenne' : 'faible'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Stratégie:</span> {item.mitigation_strategy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommandations stratégiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune recommandation stratégique disponible</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitive Benchmark */}
          {hasData(analysis.competitive_benchmark) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Benchmark concurrentiel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.competitive_benchmark.key_success_factors && (
                  <div>
                    <h4 className="font-medium mb-2">Facteurs clés de succès</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.competitive_benchmark.key_success_factors.map((factor: string, idx: number) => (
                        <Badge key={idx} variant="outline">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.competitive_benchmark.competitive_positioning && (
                  <div>
                    <h4 className="font-medium mb-3">Positionnement concurrentiel</h4>
                    <div className="space-y-3">
                      {analysis.competitive_benchmark.competitive_positioning.map((pos: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{pos.factor}</span>
                            <span className="text-xs text-gray-500">
                              Notre position: {pos.our_position}/10
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={pos.our_position * 10} className="h-2" />
                            <div 
                              className="absolute top-0 h-2 w-0.5 bg-gray-400"
                              style={{ left: `${pos.industry_average * 10}%` }}
                              title={`Moyenne industrie: ${pos.industry_average}/10`}
                            />
                            <div 
                              className="absolute top-0 h-2 w-0.5 bg-yellow-500"
                              style={{ left: `${pos.leader_position * 10}%` }}
                              title={`Leader: ${pos.leader_position}/10`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-4 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-gray-400" />
                        Moyenne industrie
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-yellow-500" />
                        Leader
                      </span>
                    </div>
                  </div>
                )}

                {analysis.competitive_benchmark.differentiation_opportunities && (
                  <div>
                    <h4 className="font-medium mb-2">Opportunités de différenciation</h4>
                    <ul className="space-y-2">
                      {analysis.competitive_benchmark.differentiation_opportunities.map((opp: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Sources de l'analyse */}
      {analysis.sources && (
        <div className="mt-8">
          <SourcesDisplay sources={analysis.sources} analysisType="market" />
        </div>
      )}
    </div>
  );
}