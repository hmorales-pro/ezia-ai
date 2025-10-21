"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Globe, 
  Target, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  ArrowLeft,
  Edit,
  Trash2,
  BarChart3,
  Sparkles,
  Loader2,
  Lightbulb,
  Package,
  Users,
  Brain
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DynamicEziaChat, DynamicContentCalendar, DynamicSocialMediaSettings, DynamicAgentStatus } from "@/components/utils/dynamic-loader";
import { EditBusinessModal } from "@/components/modals/edit-business-modal";
import { DeleteBusinessModal } from "@/components/modals/delete-business-modal";
import { MarketAnalysisDisplay } from "@/components/business/market-analysis-display";
import { MarketingStrategyDisplay } from "@/components/business/marketing-strategy-display";
import { EziaNaturalChat } from "@/components/business/ezia-natural-chat";
import { EziaMemoryView } from "@/components/business/ezia-memory-view";
import { WebsiteSection } from "@/components/business/website-section";

interface Business {
  _id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  website_url?: string;
  hasWebsite?: 'yes' | 'no';
  wantsWebsite?: 'yes' | 'no' | 'later';
  existingWebsiteUrl?: string;
  websiteGeneratedAt?: string;
  social_media?: Record<string, string>;
  market_analysis?: {
    target_audience: string;
    value_proposition: string;
    competitors?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  marketing_strategy?: {
    positioning: string;
    key_messages: string[];
    channels: string[];
  };
  ezia_interactions?: Array<{
    timestamp: string;
    agent: string;
    interaction_type: string;
    summary: string;
    content?: string;
    recommendations?: string[];
    status?: string;
  }>;
  goals?: Array<{
    title: string;
    description: string;
    target_date: string;
    status: string;
    progress?: number;
  }>;
  _createdAt: string;
  _updatedAt?: string;
  completion_score?: number;
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
  // Nouvelles données enrichies
  business_model?: any;
  offerings?: any[];
  financial_info?: any;
  customer_insights?: any;
  resources?: any;
}

function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = params.businessId as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Chargement des données...");
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAction, setChatAction] = useState<string>("general");
  const [activeTab, setActiveTab] = useState<string>("market");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOnboardingChat, setShowOnboardingChat] = useState(false);

  useEffect(() => {
    fetchBusiness();
    
    const action = searchParams.get("action");
    if (action) {
      setChatAction(action);
      setChatOpen(true);
    }
    
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
    
    if (action === "market_analysis" && !tab) {
      setActiveTab("market");
    } else if (action === "marketing_strategy" && !tab) {
      setActiveTab("marketing");
    }
  }, [businessId, searchParams]);

  // Auto-refresh si des analyses sont en cours
  useEffect(() => {
    if (!business?.agents_status) return;
    
    const hasActiveAnalysis = Object.values(business.agents_status).some(
      status => status === 'pending' || status === 'in_progress'
    );
    
    if (hasActiveAnalysis) {
      console.log('[Auto-refresh] Analyses en cours détectées');
      const interval = setInterval(async () => {
        try {
          // Fetch silencieusement sans recharger la page
          const response = await api.get(`/api/me/business/${businessId}/simple`);
          const updatedBusiness = response.data.business;
          
          // Vérifier si les analyses sont terminées
          const stillActive = Object.values(updatedBusiness.agents_status || {}).some(
            (status: any) => status === 'pending' || status === 'in_progress'
          );
          
          // Mettre à jour seulement si nécessaire
          if (JSON.stringify(updatedBusiness.agents_status) !== JSON.stringify(business.agents_status)) {
            console.log('[Auto-refresh] Statut des agents mis à jour');
            setBusiness(updatedBusiness);
            
            // Vérifier si une analyse vient de se terminer
            if (!stillActive && hasActiveAnalysis) {
              // Importer toast dynamiquement pour éviter les problèmes SSR
              import('sonner').then(({ toast }) => {
                toast.success('Toutes les analyses sont terminées !', {
                  description: 'Les résultats sont maintenant disponibles.'
                });
              });
            }
          }
          
          // Si toutes les analyses sont terminées, arrêter le polling
          if (!stillActive) {
            console.log('[Auto-refresh] Toutes les analyses sont terminées');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('[Auto-refresh] Erreur:', error);
        }
      }, 5000); // Toutes les 5 secondes au lieu de 3
      
      return () => clearInterval(interval);
    }
  }, [business?.agents_status, businessId]);

  const fetchBusiness = async () => {
    try {
      if (!business) {
        setLoading(true);
        setLoadingMessage("Récupération des informations du business...");
      }
      const response = await api.get(`/api/me/business/${businessId}/simple`);
      
      if (!business) {
        setLoadingMessage("Préparation de l'interface...");
      }
      
      setBusiness(response.data.business);
      
      // Vérifier si des analyses sont en cours
      const hasActiveAnalysis = response.data.business.agents_status && 
        Object.values(response.data.business.agents_status).some(
          (status: any) => status === 'pending' || status === 'in_progress'
        );
      
      if (hasActiveAnalysis) {
        setLoadingMessage("Nos agents analysent votre business...");
      }
    } catch (err) {
      console.error("Error fetching business:", err);
      setError("Impossible de charger les données du business");
    } finally {
      // Petit délai pour afficher le dernier message
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage("");
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-[#6D3FC8]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E1E1E] mt-4 mb-2">
              {loadingMessage}
            </h3>
            <p className="text-sm text-[#666666] text-center">
              Veuillez patienter quelques instants
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>{error || "Business introuvable"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <div className="bg-white shadow-sm border-b border-[#E0E0E0] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="no-print">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">{business.name}</h1>
                <p className="text-sm text-[#666666]">{business.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="no-print"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 no-print"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-gray-200 shadow-sm no-print">
            {/* <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger> */}
            <TabsTrigger value="market">Marché</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier de contenu</TabsTrigger>
            {/* <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="memory">
              <Brain className="w-4 h-4 mr-1" />
              Mémoire
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-[#444444]">Description</h3>
                      <p className="mt-1 text-[#666666]">{business.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#444444]">Créé le</h3>
                      <p className="mt-1 text-[#666666]">
                        {format(new Date(business._createdAt), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Section Site Web */}
                <WebsiteSection business={business} onRefresh={fetchBusiness} />
              </div>
              
              <div>
                <DynamicAgentStatus business={business} onRefresh={fetchBusiness} />
              </div>
            </div>

            {/* Carte d'incitation à enrichir les données */}
            {(!business.offerings || business.offerings.length === 0) && (
              <Card className="mb-6 border-[#6D3FC8] border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#6D3FC8]" />
                    Optimisez votre présence en ligne
                  </CardTitle>
                  <CardDescription>
                    Plus j'en sais sur votre business, mieux je peux vous aider à créer du contenu pertinent et des stratégies efficaces.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Produits & Services</p>
                        <p className="text-sm text-gray-600">Décrivez vos offres, prix, et marges pour des recommandations personnalisées</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Clients cibles</p>
                        <p className="text-sm text-gray-600">Identifiez précisément qui vous servez pour un contenu ultra-ciblé</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Objectifs financiers</p>
                        <p className="text-sm text-gray-600">Définissez vos cibles pour un plan d'action concret</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
                      onClick={() => setShowOnboardingChat(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enrichir mes données business
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {business.hasWebsite !== 'yes' && (
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                  onClick={() => {
                    const prompt = business.website_prompt?.prompt || `Crée un site web moderne et professionnel pour ${business.name}.`;
                    const encodedPrompt = encodeURIComponent(prompt);
                    router.push(`/projects/new?prompt=${encodedPrompt}&businessId=${businessId}`);
                  }}
                >
                  <CardContent className="p-6">
                    <Building2 className="w-8 h-8 text-[#6D3FC8] mb-2" />
                    <h3 className="font-medium">Créer un site web</h3>
                    <p className="text-sm text-[#666666] mt-1">
                      Lancez votre présence en ligne avec DeepSite
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("market_analysis");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <Target className="w-8 h-8 text-[#6D3FC8] mb-2" />
                  <h3 className="font-medium">Analyse de marché</h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Comprenez votre marché et vos clients
                  </p>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("marketing_strategy");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Stratégie marketing</h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Développez votre stratégie de croissance
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            <MarketAnalysisDisplay businessId={params.businessId} />
          </TabsContent>
          
          <TabsContent value="marketing" className="space-y-4">
            {business.marketing_strategy ? (
              <MarketingStrategyDisplay strategy={business.marketing_strategy} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Stratégie marketing</CardTitle>
                  <CardDescription>
                    Votre plan marketing pour atteindre vos objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune stratégie marketing définie</p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setChatAction("marketing_strategy");
                        setChatOpen(true);
                      }}
                    >
                      Créer la stratégie
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <DynamicContentCalendar 
              businessId={businessId} 
              businessName={business.name}
              businessIndustry={business.industry}
              businessDescription={business.description}
              marketAnalysis={business.market_analysis}
              marketingStrategy={business.marketing_strategy}
              competitorAnalysis={business.competitor_analysis}
            />
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <DynamicSocialMediaSettings businessId={businessId} />
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs</CardTitle>
                <CardDescription>
                  Suivez vos objectifs et votre progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                {business.goals && business.goals.length > 0 ? (
                  <div className="space-y-4">
                    {business.goals.map((goal, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{goal.title}</h3>
                          <Badge 
                            variant={goal.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        {goal.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Échéance: {format(new Date(goal.target_date), "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucun objectif défini</p>
                    <Button className="mt-4">
                      Définir des objectifs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique des interactions</CardTitle>
                <CardDescription>
                  Toutes les interactions avec l'équipe Ezia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {business.ezia_interactions && business.ezia_interactions.length > 0 ? (
                  <div className="space-y-4">
                    {business.ezia_interactions.map((interaction, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{interaction.agent}</Badge>
                            <span className="text-sm text-gray-600">{interaction.interaction_type}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(interaction.timestamp), "d MMM yyyy HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm">{interaction.summary}</p>
                        {interaction.recommendations && interaction.recommendations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Recommandations:</p>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                              {interaction.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune interaction enregistrée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="memory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#6D3FC8]" />
                  Mémoire d'Ezia
                </CardTitle>
                <CardDescription>
                  Toutes les données, analyses et apprentissages collectés pour {business.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EziaMemoryView businessId={businessId} businessName={business.name} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle>Ezia - {chatAction}</DialogTitle>
          <DialogDescription>
            Discussion avec l'équipe Ezia pour {business.name}
          </DialogDescription>
          <DynamicEziaChat
            businessId={businessId}
            businessName={business.name}
            actionType={chatAction}
            onActionComplete={(result) => {
              fetchBusiness();
              setChatOpen(false);
            }}
            onClose={() => setChatOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          setChatAction("general");
          setChatOpen(true);
        }}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* Edit Modal */}
      {showEditModal && (
        <EditBusinessModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          business={business}
          onSuccess={fetchBusiness}
        />
      )}
      
      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteBusinessModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          business={business}
        />
      )}
      
      {/* Onboarding Chat Dialog */}
      <Dialog open={showOnboardingChat} onOpenChange={setShowOnboardingChat}>
        <DialogContent className="sm:max-w-4xl h-[85vh] p-0 gap-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Discussion avec Ezia</DialogTitle>
          <div className="h-full flex flex-col overflow-hidden rounded-2xl">
            <EziaNaturalChat
              businessId={businessId}
              businessData={business}
              onDataCollected={(data) => {
                fetchBusiness();
                setShowOnboardingChat(false);
              }}
              onClose={() => setShowOnboardingChat(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BusinessDetailPage;