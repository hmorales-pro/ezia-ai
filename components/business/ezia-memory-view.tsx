"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Target, 
  AlertCircle,
  Search,
  RefreshCw,
  ChevronRight,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  Lightbulb
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface EziaMemoryViewProps {
  businessId: string;
  businessName: string;
}

export function EziaMemoryView({ businessId, businessName }: EziaMemoryViewProps) {
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadMemory();
  }, [businessId]);

  const loadMemory = async () => {
    setLoading(true);
    try {
      console.log("[EziaMemory] Loading memory for businessId:", businessId);
      const response = await api.get(`/api/me/business/${businessId}/memory`);
      console.log("[EziaMemory] Response:", response.data);
      
      if (response.data.success) {
        setMemory(response.data.memory);
      }
    } catch (error) {
      console.error("Error loading memory:", error);
      toast.error("Impossible de charger la mémoire d'Ezia");
    } finally {
      setLoading(false);
    }
  };

  const searchMemory = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await api.post(`/api/me/business/${businessId}/ezia-memory/search`, {
        query: searchQuery,
        type: "all"
      });
      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Error searching memory:", error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  if (!memory || !memory.performance_metrics) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune donnée en mémoire</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Complétion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memory.performance_metrics.completion_score}%</div>
            <Progress value={memory.performance_metrics.completion_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memory.performance_metrics.engagement_score}%</div>
            <p className="text-xs text-muted-foreground">
              {memory.interaction_history.total_interactions} interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Contenu</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memory.performance_metrics.content_production_rate}</div>
            <p className="text-xs text-muted-foreground">
              {memory.content_calendar.total_posts} posts créés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profondeur Analyse</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memory.performance_metrics.analysis_depth}</div>
            <p className="text-xs text-muted-foreground">
              {memory.recommendations.data_gaps.length} données manquantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher dans la mémoire</CardTitle>
          <CardDescription>
            Trouvez rapidement des informations spécifiques dans toutes les données collectées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher des offres, interactions, analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMemory()}
            />
            <Button onClick={searchMemory} disabled={searching}>
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Résultats ({searchResults.length})</h4>
              {searchResults.slice(0, 5).map((result, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{result.type}</Badge>
                    <span className="text-sm text-gray-600">
                      Pertinence: {result.relevance}%
                    </span>
                  </div>
                  <p className="text-sm">{result.summary || result.name || result.title}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs avec différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="context">Contexte</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nom</p>
                  <p className="text-sm text-gray-600">{memory.business_profile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Industrie</p>
                  <p className="text-sm text-gray-600">{memory.business_profile.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Stade</p>
                  <Badge>{memory.business_profile.stage}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Dernière mise à jour</p>
                  <p className="text-sm text-gray-600">
                    {new Date(memory.business_profile.last_updated).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Données Collectées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memory.collected_insights.offerings?.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#6D3FC8]" />
                      <span className="font-medium">Offres</span>
                    </div>
                    <Badge>{memory.collected_insights.offerings.length} définie(s)</Badge>
                  </div>
                )}
                
                {memory.collected_insights.customer_insights?.ideal_customer_profile && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6D3FC8]" />
                      <span className="font-medium">Profil client</span>
                    </div>
                    <Badge variant="secondary">Défini</Badge>
                  </div>
                )}
                
                {memory.analysis_results.personas?.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6D3FC8]" />
                      <span className="font-medium">Personas</span>
                    </div>
                    <Badge>{memory.analysis_results.personas.length} créé(s)</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points d'Apprentissage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memory.learning_points.map((point: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {memory.analysis_results.swot_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analyse SWOT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Forces</h4>
                    <ul className="text-sm space-y-1">
                      {memory.analysis_results.swot_analysis.strengths.map((s: string, idx: number) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Faiblesses</h4>
                    <ul className="text-sm space-y-1">
                      {memory.analysis_results.swot_analysis.weaknesses.map((w: string, idx: number) => (
                        <li key={idx}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Opportunités</h4>
                    <ul className="text-sm space-y-1">
                      {memory.analysis_results.swot_analysis.opportunities.map((o: string, idx: number) => (
                        <li key={idx}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Menaces</h4>
                    <ul className="text-sm space-y-1">
                      {memory.analysis_results.swot_analysis.threats.map((t: string, idx: number) => (
                        <li key={idx}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Interactions</CardTitle>
              <CardDescription>
                {memory.interaction_history.total_interactions} interactions totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memory.interaction_history.recent_interactions.map((interaction: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-[#6D3FC8] pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{interaction.agent}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(interaction.timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm">{interaction.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé des Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Par Agent</h4>
                  {Object.entries(memory.interaction_history.interaction_summary.by_agent).map(([agent, count]: [string, any]) => (
                    <div key={agent} className="flex justify-between text-sm">
                      <span>{agent}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Par Type</h4>
                  {Object.entries(memory.interaction_history.interaction_summary.by_type).map(([type, count]: [string, any]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions Immédiates</CardTitle>
              <CardDescription>
                Actions prioritaires à entreprendre cette semaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memory.recommendations.immediate_actions.map((action: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                    <ChevronRight className="w-4 h-4 text-[#6D3FC8] mt-0.5" />
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Données Manquantes</CardTitle>
              <CardDescription>
                Informations à collecter pour une analyse complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {memory.recommendations.data_gaps.map((gap: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {gap}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opportunités de Croissance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memory.recommendations.growth_opportunities.map((opp: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm">{opp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contexte de Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Dernier résumé</h4>
                <p className="text-sm text-gray-600">
                  {memory.conversation_context.last_conversation_summary}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Sujets clés discutés</h4>
                <div className="flex flex-wrap gap-2">
                  {memory.conversation_context.key_topics_discussed.map((topic: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Questions non résolues</h4>
                <div className="space-y-1">
                  {memory.conversation_context.unresolved_questions.map((question: string, idx: number) => (
                    <p key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-[#6D3FC8]">?</span>
                      {question}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métriques Business</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Projection de revenus</p>
                  <p className="text-lg font-semibold text-[#6D3FC8]">
                    {memory.analysis_results.business_plan_metrics.revenue_projection}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Nombre d'offres</p>
                  <p className="text-lg font-semibold">
                    {memory.analysis_results.business_plan_metrics.offerings_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Prix moyen</p>
                  <p className="text-lg font-semibold">
                    €{memory.analysis_results.business_plan_metrics.average_price}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Analyse des marges</p>
                  <p className="text-sm">
                    {memory.analysis_results.business_plan_metrics.margin_analysis}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bouton de rafraîchissement */}
      <div className="flex justify-end">
        <Button onClick={loadMemory} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Rafraîchir la mémoire
        </Button>
      </div>
    </div>
  );
}