"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trophy
} from "lucide-react";

interface MarketingStrategyDisplayProps {
  strategy: any;
}

export function MarketingStrategyDisplay({ strategy }: MarketingStrategyDisplayProps) {
  if (!strategy) return null;
  
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
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 h-auto p-1">
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
                        <h4 className="font-semibold text-lg">{segment.name}</h4>
                        <p className="text-sm text-gray-600">{segment.description}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        {segment.size}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Caractéristiques</h5>
                        <ul className="space-y-1">
                          {segment.characteristics?.map((char: string, charIdx: number) => (
                            <li key={charIdx} className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="text-gray-400">•</span>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 text-sm">Points de douleur</h5>
                        <ul className="space-y-1">
                          {segment.pain_points?.map((pain: string, painIdx: number) => (
                            <li key={painIdx} className="text-sm text-red-600 flex items-center gap-1">
                              <span>•</span>
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">Canaux préférés: </span>
                          <span className="text-sm text-gray-600">
                            {Array.isArray(segment.preferred_channels) 
                              ? segment.preferred_channels.map((channel: any) => 
                                  typeof channel === 'string' ? channel : channel.name || channel.channel || JSON.stringify(channel)
                                ).join(", ")
                              : segment.preferred_channels
                            }
                          </span>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          Budget: {segment.budget}
                        </Badge>
                      </div>
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
                    {strategy.marketing_mix?.product?.core_offerings?.map((offer: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-1">
                        <span className="text-[#6D3FC8]">→</span>
                        {typeof offer === 'string' ? offer : offer.name || offer.offering || JSON.stringify(offer)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-1">Caractéristiques uniques</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.product?.unique_features?.map((feature: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {typeof feature === 'string' ? feature : feature.name || feature.feature || JSON.stringify(feature)}
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
                    {strategy.marketing_mix?.price?.tactics?.map((tactic: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        {typeof tactic === 'string' ? tactic : tactic.name || tactic.tactic || JSON.stringify(tactic)}
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
                    {strategy.marketing_mix?.place?.distribution_channels?.map((channel: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-1">
                        <Map className="w-3 h-3 text-blue-600" />
                        {typeof channel === 'string' ? channel : channel.name || channel.channel || JSON.stringify(channel)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Présence en ligne</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.place?.online_presence?.map((presence: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {typeof presence === 'string' ? presence : presence.name || presence.platform || JSON.stringify(presence)}
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
                    {strategy.marketing_mix?.promotion?.key_messages?.slice(0, 3).map((msg: any, idx: number) => (
                      <li key={idx} className="text-sm italic">
                        "{typeof msg === 'string' ? msg : msg.message || msg.content || JSON.stringify(msg)}"
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Tactiques promotionnelles</h5>
                  <div className="flex flex-wrap gap-1">
                    {strategy.marketing_mix?.promotion?.promotional_tactics?.map((tactic: any, idx: number) => (
                      <Badge key={idx} className="text-xs bg-purple-100 text-purple-700">
                        {typeof tactic === 'string' ? tactic : tactic.name || tactic.tactic || JSON.stringify(tactic)}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Points de contact</h5>
                          <ul className="space-y-1">
                            {data.touchpoints?.map((point: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {point}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Types de contenu</h5>
                          <ul className="space-y-1">
                            {data.content_types?.map((type: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {type}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Canaux</h5>
                          <div className="flex flex-wrap gap-1">
                            {data.channels?.map((channel: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Channel Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Stratégie par canal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategy.channel_strategy?.map((channel: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{channel.channel}</h4>
                      <Badge className={getPriorityColor(channel.priority)}>
                        Priorité {channel.priority === 'high' ? 'haute' : channel.priority === 'medium' ? 'moyenne' : 'faible'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Objectifs</h5>
                        <ul className="space-y-1">
                          {channel.objectives?.map((obj: string, objIdx: number) => (
                            <li key={objIdx} className="text-sm text-gray-600">• {obj}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">KPIs</h5>
                        <ul className="space-y-1">
                          {channel.kpis?.map((kpi: string, kpiIdx: number) => (
                            <li key={kpiIdx} className="text-sm text-gray-600">• {kpi}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Budget allocation</span>
                        <div className="flex items-center gap-2">
                          <Progress value={channel.budget_allocation} className="w-24 h-2" />
                          <span className="text-sm font-semibold">{channel.budget_allocation}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                        <h4 className="font-semibold text-lg">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {campaign.budget_estimate}
                      </Badge>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-[#6D3FC8] italic">
                        "{campaign.key_message}"
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Cible:</span>
                        <p className="text-gray-600">{campaign.target_segment}</p>
                      </div>
                      <div>
                        <span className="font-medium">Durée:</span>
                        <p className="text-gray-600">{campaign.duration}</p>
                      </div>
                      <div>
                        <span className="font-medium">Canaux:</span>
                        <p className="text-gray-600">{campaign.channels?.join(", ")}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-sm font-medium">Résultats attendus:</span>
                      <p className="text-sm text-green-700">{campaign.expected_results}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Stratégie de contenu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Calendrier éditorial</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Fréquence: {strategy.content_strategy?.content_calendar?.frequency}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(strategy.content_strategy?.content_calendar?.themes_by_month || {}).map(([month, themes]: [string, any]) => (
                    <div key={month} className="border rounded-lg p-3">
                      <h5 className="font-medium text-sm mb-2">{month}</h5>
                      <ul className="space-y-1">
                        {themes.map((theme: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">• {theme}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Types de contenu</h4>
                <div className="space-y-3">
                  {strategy.content_strategy?.content_types?.map((content: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{content.type}</span>
                        <p className="text-xs text-gray-600">{content.frequency}</p>
                      </div>
                      <div className="flex gap-1">
                        {content.distribution?.map((dist: string, distIdx: number) => (
                          <Badge key={distIdx} variant="outline" className="text-xs">
                            {dist}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                          <div>
                            <h4 className="font-semibold">{phase.phase}</h4>
                            <p className="text-sm text-gray-600">{phase.duration}</p>
                          </div>
                          <Badge variant="outline">{phase.budget}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <h5 className="text-sm font-medium mb-1">Objectifs</h5>
                            <ul className="space-y-1">
                              {phase.objectives?.map((obj: string, objIdx: number) => (
                                <li key={objIdx} className="text-sm text-gray-600">• {obj}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-1">Critères de succès</h5>
                            <ul className="space-y-1">
                              {phase.success_criteria?.map((criteria: string, critIdx: number) => (
                                <li key={critIdx} className="text-sm text-green-600">✓ {criteria}</li>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Allocation budgétaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Budget total annuel</p>
                <p className="text-2xl font-bold text-[#6D3FC8]">
                  {strategy.budget_allocation?.total_budget}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Par canal</h5>
                  {Object.entries(strategy.budget_allocation?.by_channel || {}).map(([channel, percent]: [string, any]) => (
                    <div key={channel} className="flex justify-between items-center mb-2">
                      <span className="text-sm">{channel}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percent} className="w-20 h-2" />
                        <span className="text-sm font-semibold w-10">{percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Par objectif</h5>
                  {Object.entries(strategy.budget_allocation?.by_objective || {}).map(([objective, percent]: [string, any]) => (
                    <div key={objective} className="flex justify-between items-center mb-2">
                      <span className="text-sm">{objective}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percent} className="w-20 h-2" />
                        <span className="text-sm font-semibold w-10">{percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Par trimestre</h5>
                  {Object.entries(strategy.budget_allocation?.by_quarter || {}).map(([quarter, percent]: [string, any]) => (
                    <div key={quarter} className="flex justify-between items-center mb-2">
                      <span className="text-sm">{quarter}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={percent} className="w-20 h-2" />
                        <span className="text-sm font-semibold w-10">{percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Mitigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gestion des risques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategy.risk_mitigation?.map((risk: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-red-700">{risk.risk}</h5>
                      <div className="flex gap-2">
                        <Badge className={risk.probability === 'high' ? 'bg-red-100 text-red-700' : risk.probability === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                          P: {risk.probability === 'high' ? 'Élevée' : risk.probability === 'medium' ? 'Moyenne' : 'Faible'}
                        </Badge>
                        <Badge className={risk.impact === 'high' ? 'bg-red-100 text-red-700' : risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                          I: {risk.impact === 'high' ? 'Élevé' : risk.impact === 'medium' ? 'Moyen' : 'Faible'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Stratégie d'atténuation:</span> {risk.mitigation_strategy}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}