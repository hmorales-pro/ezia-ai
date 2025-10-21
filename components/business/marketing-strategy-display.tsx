"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Users,
  Megaphone,
  TrendingUp,
  Calendar,
  BarChart3,
  Lightbulb,
  DollarSign,
  Map,
  Shield,
  Sparkles,
  Heart,
  MessageSquare,
  Rocket,
  Eye,
  ShoppingCart,
  UserCheck,
  Trophy,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import type { IMarketingStrategy } from "@/models/MarketingStrategy";

interface MarketingStrategyDisplayProps {
  businessId: string;
}

export function MarketingStrategyDisplay({ businessId }: MarketingStrategyDisplayProps) {
  const [strategy, setStrategy] = useState<IMarketingStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStrategy();
  }, [businessId]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/me/business/${businessId}/marketing-strategy`);
      const data = await response.json();

      if (data.success && data.strategy) {
        setStrategy(data.strategy);
      }
    } catch (error) {
      console.error("Erreur chargement stratégie:", error);
      toast.error("Erreur lors du chargement de la stratégie");
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async (forceRefresh = false) => {
    try {
      setGenerating(true);
      toast.info("Génération de la stratégie marketing en cours...");

      const response = await fetch(`/api/me/business/${businessId}/marketing-strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await response.json();

      if (data.success) {
        setStrategy(data.strategy);
        toast.success("Stratégie marketing générée avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      toast.error("Erreur lors de la génération de la stratégie");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Stratégie Marketing
          </CardTitle>
          <CardDescription>
            Générez une stratégie marketing complète avec positionnement de marque, mix marketing et roadmap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aucune stratégie marketing n'a encore été générée pour ce business.
            Cliquez ci-dessous pour lancer une génération automatique.
          </p>
          <Button
            onClick={() => generateStrategy(false)}
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
                <Sparkles className="w-4 h-4 mr-2" />
                Générer la stratégie marketing
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Check if we have meaningful content
  const hasVisionMission = strategy.executive_summary?.vision || strategy.executive_summary?.mission;
  const hasPositioning = strategy.brand_positioning;
  const hasSegments = strategy.target_segments?.length > 0;
  const hasMarketingMix = strategy.marketing_mix;
  const hasCustomerJourney = strategy.customer_journey && Object.keys(strategy.customer_journey).length > 0;
  const hasCampaigns = strategy.campaign_ideas?.length > 0;
  const hasRoadmap = strategy.implementation_roadmap?.length > 0;

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getJourneyIcon = (stage: string) => {
    switch(stage) {
      case 'awareness': return Eye;
      case 'consideration': return MessageSquare;
      case 'decision': return ShoppingCart;
      case 'retention': return UserCheck;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {hasVisionMission ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
              Vision & Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategy.executive_summary?.vision && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-[#6D3FC8] mb-2">Vision</h4>
                <p className="text-sm">{strategy.executive_summary.vision}</p>
              </div>
            )}
            
            {strategy.executive_summary?.mission && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Mission</h4>
                <p className="text-sm">{strategy.executive_summary.mission}</p>
              </div>
            )}

            {strategy.executive_summary?.unique_value_proposition && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 mb-2">Proposition de valeur unique</h4>
                <p className="text-sm">{strategy.executive_summary.unique_value_proposition}</p>
              </div>
            )}

            {strategy.executive_summary?.target_roi && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-700 mb-2">ROI cible</h4>
                <p className="text-sm font-semibold">{strategy.executive_summary.target_roi}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
              Stratégie marketing en cours d'élaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              L'analyse complète de votre stratégie marketing est en cours. Les sections détaillées seront disponibles une fois l'analyse terminée.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={hasPositioning ? "positioning" : hasSegments ? "segments" : hasMarketingMix ? "mix" : hasCustomerJourney ? "journey" : hasCampaigns ? "campaigns" : hasRoadmap ? "roadmap" : "positioning"} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
          {hasPositioning && <TabsTrigger value="positioning">Positionnement</TabsTrigger>}
          {hasSegments && <TabsTrigger value="segments">Segments</TabsTrigger>}
          {hasMarketingMix && <TabsTrigger value="mix">Mix Marketing</TabsTrigger>}
          {hasCustomerJourney && <TabsTrigger value="journey">Parcours Client</TabsTrigger>}
          {hasCampaigns && <TabsTrigger value="campaigns">Campagnes</TabsTrigger>}
          {hasRoadmap && <TabsTrigger value="roadmap">Roadmap</TabsTrigger>}
        </TabsList>

        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Positionnement de marque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Essence de marque</h4>
                <p className="text-lg font-semibold text-[#6D3FC8]">
                  {strategy.brand_positioning?.brand_essence}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Promesse de marque</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-lg italic">
                  "{strategy.brand_positioning?.brand_promise}"
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Personnalité de marque</h4>
                <div className="flex flex-wrap gap-2">
                  {strategy.brand_positioning?.brand_personality?.map((trait: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Valeurs de marque</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {strategy.brand_positioning?.brand_values?.map((value: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Heart className="w-4 h-4 text-[#6D3FC8]" />
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Déclaration de positionnement</h4>
                <p className="text-sm bg-[#6D3FC8] text-white p-4 rounded-lg">
                  {strategy.brand_positioning?.positioning_statement}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Avantages compétitifs</h4>
                <ul className="space-y-2">
                  {strategy.brand_positioning?.competitive_advantages?.map((advantage: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Segments cibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.target_segments?.map((segment: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{segment.segment_name}</h4>
                        <p className="text-sm text-gray-600">{segment.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={segment.priority === 'high' ? 'bg-red-100 text-red-700' : segment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                          {segment.priority === 'high' ? 'Haute priorité' : segment.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {segment.size_estimate}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Démographie</h5>
                        <p className="text-sm text-gray-600">{segment.demographics}</p>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 text-sm">Psychographie</h5>
                        <p className="text-sm text-gray-600">{segment.psychographics}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <h5 className="font-medium mb-2 text-sm">Stratégie d'atteinte</h5>
                      <p className="text-sm text-gray-600">{segment.reach_strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mix" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Offres principales</h5>
                  <ul className="space-y-1">
                    {strategy.marketing_mix?.product?.core_offerings?.map((offer: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-1">
                        <span className="text-[#6D3FC8]">→</span>
                        {offer}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-1">Caractéristiques uniques</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.product?.unique_features?.map((feature: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm">Stratégie</h5>
                  <p className="text-sm font-semibold text-[#6D3FC8]">
                    {strategy.marketing_mix?.price?.strategy}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Positionnement</h5>
                  <p className="text-sm">{strategy.marketing_mix?.price?.positioning}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Tactiques</h5>
                  <ul className="space-y-1">
                    {strategy.marketing_mix?.price?.tactics?.map((tactic: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        {tactic}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Place */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Canaux de distribution</h5>
                  <ul className="space-y-1">
                    {strategy.marketing_mix?.place?.distribution_channels?.map((channel: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-1">
                        <Map className="w-3 h-3 text-blue-600" />
                        {channel}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Présence en ligne</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.place?.online_presence?.map((presence: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {presence}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promotion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Promotion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Messages clés</h5>
                  <ul className="space-y-1">
                    {strategy.marketing_mix?.promotion?.key_messages?.slice(0, 3).map((msg: string, idx: number) => (
                      <li key={idx} className="text-sm italic">
                        "{msg}"
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Tactiques promotionnelles</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.promotion?.promotional_tactics?.map((tactic: string, idx: number) => (
                      <Badge key={idx} className="text-xs bg-purple-100 text-purple-700">
                        {tactic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Parcours client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(strategy.customer_journey || {}).map(([stage, data]: [string, any]) => {
                  const Icon = getJourneyIcon(stage);
                  return (
                    <div key={stage} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-5 h-5 text-[#6D3FC8]" />
                        <h4 className="font-semibold capitalize">{stage}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Points de contact</h5>
                          <ul className="space-y-1">
                            {data.touchpoints?.map((point: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {point}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-1">Objectifs</h5>
                          <ul className="space-y-1">
                            {data.objectives?.map((objective: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {objective}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-1">KPIs</h5>
                          <div className="flex flex-wrap gap-1">
                            {data.kpis?.map((kpi: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {kpi}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-1">Actions</h5>
                          <ul className="space-y-1">
                            {data.actions?.map((action: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Idées de campagnes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.campaign_ideas?.map((campaign: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{campaign.title}</h4>
                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {campaign.budget_estimate}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Segment cible:</span>
                        <p className="text-gray-600">{campaign.target_segment}</p>
                      </div>
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p className="text-gray-600">{campaign.timeline}</p>
                      </div>
                      <div>
                        <span className="font-medium">Canaux:</span>
                        <p className="text-gray-600">{campaign.channels?.join(", ")}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm font-medium">ROI attendu:</span>
                          <p className="text-sm text-green-700">{campaign.expected_roi}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">KPIs:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.kpis?.map((kpi: string, kpiIdx: number) => (
                              <Badge key={kpiIdx} variant="secondary" className="text-xs">
                                {kpi}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Roadmap de mise en œuvre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.implementation_roadmap?.map((phase: any, idx: number) => (
                  <div key={idx} className="relative">
                    {idx < strategy.implementation_roadmap.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#6D3FC8] rounded-full flex items-center justify-center text-white font-semibold">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{phase.phase}</h4>
                              <Badge className={phase.priority === 'high' ? 'bg-red-100 text-red-700' : phase.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                                {phase.priority === 'high' ? 'Priorité haute' : phase.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{phase.timeline}</p>
                          </div>
                          <Badge variant="outline" className="font-semibold">{phase.budget}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <h5 className="text-sm font-medium mb-1">Actions</h5>
                            <ul className="space-y-1">
                              {phase.actions?.map((action: string, actionIdx: number) => (
                                <li key={actionIdx} className="text-sm text-gray-600">• {action}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-1">Métriques de succès</h5>
                            <ul className="space-y-1">
                              {phase.success_metrics?.map((metric: string, metricIdx: number) => (
                                <li key={metricIdx} className="text-sm text-green-600">✓ {metric}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-1">Dépendances</h5>
                            <ul className="space-y-1">
                              {phase.dependencies?.map((dep: string, depIdx: number) => (
                                <li key={depIdx} className="text-sm text-orange-600">→ {dep}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation */}
          {strategy.total_budget_estimate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Allocation budgétaire (Mix Marketing 4P)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Budget total estimé</p>
                  <p className="text-2xl font-bold text-[#6D3FC8]">
                    {strategy.total_budget_estimate}
                  </p>
                </div>

                {strategy.budget_allocation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Product (Produit)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={strategy.budget_allocation.product} className="w-20 h-2" />
                          <span className="text-sm font-semibold w-10">{strategy.budget_allocation.product}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Price (Prix)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={strategy.budget_allocation.price} className="w-20 h-2" />
                          <span className="text-sm font-semibold w-10">{strategy.budget_allocation.price}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Place (Distribution)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={strategy.budget_allocation.place} className="w-20 h-2" />
                          <span className="text-sm font-semibold w-10">{strategy.budget_allocation.place}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Promotion (Communication)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={strategy.budget_allocation.promotion} className="w-20 h-2" />
                          <span className="text-sm font-semibold w-10">{strategy.budget_allocation.promotion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}