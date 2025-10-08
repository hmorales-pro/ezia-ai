"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  Loader2,
  Lightbulb,
  Package,
  Users,
  RefreshCw,
  Zap
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EziaChatModal, useEziaChatModal } from "@/components/chat/ezia-chat-modal";
import { toast } from "sonner";
import { DynamicContentCalendar, DynamicAgentStatus } from "@/components/utils/dynamic-loader";
import { EditBusinessModal } from "@/components/modals/edit-business-modal";
import { DeleteBusinessModal } from "@/components/modals/delete-business-modal";
import { MarketAnalysisDisplay } from "@/components/business/market-analysis-display";
import { MarketingStrategyDisplay } from "@/components/business/marketing-strategy-display";
import { AnalysisSkeleton } from "@/components/business/analysis-skeleton";

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
  market_analysis?: any;
  marketing_strategy?: any;
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
  const { openChat, closeChat, ChatComponent, isOpen } = useEziaChatModal();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPollingActive, setIsPollingActive] = useState(false);

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  // Gérer les actions et les tabs
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
    
    const action = searchParams.get("action");
    if (action === "market_analysis" && !tab) {
      setActiveTab("market");
    } else if (action === "marketing_strategy" && !tab) {
      setActiveTab("marketing");
    }
  }, [searchParams]);

  // Gérer l'ouverture du chat quand business est chargé
  useEffect(() => {
    const action = searchParams.get("action");
    if (action && business) {
      const chatModeMap: Record<string, any> = {
        'market_analysis': 'analysis',
        'marketing_strategy': 'strategy',
        'website_creation': 'website',
        'content_creation': 'content',
        'general': 'general'
      };
      
      openChat({
        businessId,
        businessName: business.name,
        mode: chatModeMap[action] || 'general',
        onActionComplete: (result) => {
          fetchBusiness();
        }
      });
    }
  }, [business?.name, searchParams]); // Utiliser business.name au lieu de business entier

  // Auto-refresh si des analyses sont en cours
  useEffect(() => {
    // Nettoyer l'interval précédent s'il existe
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    
    if (!business?.agents_status) {
      setIsPollingActive(false);
      return;
    }
    
    const hasActiveAnalysis = Object.values(business.agents_status).some(
      status => status === 'pending' || status === 'in_progress'
    );
    
    // Ne démarrer le polling que s'il y a des analyses actives ET qu'il n'est pas déjà actif
    if (hasActiveAnalysis && !isPollingActive) {
      console.log('[Auto-refresh] Démarrage du polling pour les analyses');
      setIsPollingActive(true);
      
      pollingInterval.current = setInterval(async () => {
        try {
          // Fetch silencieusement sans recharger la page
          const response = await api.get(`/api/me/business/${businessId}/simple`);
          
          if (!response.data || !response.data.business) {
            console.error('[Auto-refresh] Données invalides reçues');
            return;
          }
          
          const updatedBusiness = response.data.business;
          
          // Vérifier si les analyses sont terminées
          const stillActive = Object.values(updatedBusiness.agents_status || {}).some(
            (status: any) => status === 'pending' || status === 'in_progress'
          );
          
          // Si toutes les analyses sont terminées, arrêter le polling
          if (!stillActive) {
            console.log('[Auto-refresh] Toutes les analyses sont terminées');
            setBusiness(updatedBusiness);
            setIsPollingActive(false);
            
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
              pollingInterval.current = null;
            }
            
            // Notification de fin
            import('sonner').then(({ toast }) => {
              toast.success('Toutes les analyses sont terminées !', {
                description: 'Les résultats sont maintenant disponibles.'
              });
            });
          } else if (JSON.stringify(updatedBusiness.agents_status) !== JSON.stringify(business.agents_status)) {
            // Mettre à jour seulement si le statut a changé
            console.log('[Auto-refresh] Statut des agents mis à jour');
            setBusiness(updatedBusiness);
          }
        } catch (error) {
          console.error('[Auto-refresh] Erreur:', error);
        }
      }, 5000);
    } else if (!hasActiveAnalysis && isPollingActive) {
      // Si plus d'analyses actives mais le polling est encore actif, l'arrêter
      console.log('[Auto-refresh] Arrêt du polling - plus d\'analyses actives');
      setIsPollingActive(false);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [businessId, isPollingActive]); // Dépend de isPollingActive pour éviter les re-créations

  const handleDeepen = async (section: string, analysisType: string) => {
    // Toast de début avec animation
    const loadingToastId = toast.loading(
      `🔍 Approfondissement en cours...`,
      {
        description: `Analyse détaillée de la section ${section}`,
        duration: Infinity
      }
    );

    try {
      const response = await api.post(`/api/me/business/${businessId}/deepen-section`, {
        section,
        analysisType
      });

      if (response.data.success) {
        toast.success(
          '✅ Section approfondie avec succès !',
          {
            id: loadingToastId,
            description: `La section a été enrichie avec plus de détails`,
            duration: 5000
          }
        );

        // Rafraîchir les données
        await fetchBusiness();
      }
    } catch (error: any) {
      console.error('Erreur approfondissement:', error);
      toast.error(
        '❌ Erreur lors de l\'approfondissement',
        {
          id: loadingToastId,
          description: error.response?.data?.details || 'Impossible d\'approfondir cette section pour le moment',
          duration: 5000
        }
      );
    }
  };

  const fetchBusiness = async () => {
    try {
      if (!business) {
        setLoading(true);
        setLoadingMessage("Récupération des informations du business...");
      }
      const response = await api.get(`/api/me/business/${businessId}/simple`);
      
      if (!response.data || !response.data.business) {
        throw new Error("Format de réponse invalide");
      }
      
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
      <div className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">{business.name}</h1>
                <p className="text-sm text-[#666666]">{business.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600"
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
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="market">Analyse de marché</TabsTrigger>
            <TabsTrigger value="marketing">Stratégie marketing</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier & Contenu</TabsTrigger>
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
                      <h3 className="font-medium text-[#444444]">Industrie</h3>
                      <p className="mt-1 text-[#666666]">{business.industry}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#444444]">Créé le</h3>
                      <p className="mt-1 text-[#666666]">
                        {format(new Date(business._createdAt), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
                      onClick={() => {
                        openChat({
                          businessId,
                          businessName: business.name,
                          mode: 'onboarding',
                          initialContext: 'L\'utilisateur souhaite enrichir ses données business',
                          onActionComplete: (result) => {
                            fetchBusiness();
                          }
                        });
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enrichir mes données business
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Actions rapides</h3>
              {(business.market_analysis || business.marketing_strategy) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Voulez-vous vraiment régénérer toutes les analyses ? Les analyses existantes seront conservées et enrichies."
                    );
                    if (!confirmed) return;

                    toast.loading("Régénération de toutes les analyses en cours...", {
                      id: "regenerate-all",
                      description: "Cela peut prendre 30-60 secondes"
                    });

                    try {
                      // Lancer analyse de marché
                      openChat({
                        businessId,
                        businessName: business.name,
                        mode: 'analysis',
                        initialContext: 'L\'utilisateur souhaite régénérer l\'analyse de marché complète',
                        onActionComplete: async (result) => {
                          // Lancer stratégie marketing
                          openChat({
                            businessId,
                            businessName: business.name,
                            mode: 'strategy',
                            initialContext: 'L\'utilisateur souhaite régénérer la stratégie marketing complète',
                            onActionComplete: (result) => {
                              fetchBusiness();
                              toast.success("Toutes les analyses ont été régénérées !", {
                                id: "regenerate-all",
                                description: "Vos analyses sont maintenant à jour"
                              });
                            }
                          });
                        }
                      });
                    } catch (error) {
                      toast.error("Erreur lors de la régénération", { id: "regenerate-all" });
                    }
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tout régénérer
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
                onClick={() => {
                  openChat({
                    businessId,
                    businessName: business.name,
                    mode: 'analysis',
                    initialContext: 'L\'utilisateur souhaite une analyse de marché',
                    onActionComplete: (result) => {
                      fetchBusiness();
                      setActiveTab("market");
                    }
                  });
                }}
              >
                <CardContent className="p-6">
                  <Target className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Analyse de marché</h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Comprenez votre marché et vos clients
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                onClick={() => {
                  openChat({
                    businessId,
                    businessName: business.name,
                    mode: 'strategy',
                    initialContext: 'L\'utilisateur souhaite développer une stratégie marketing',
                    onActionComplete: (result) => {
                      fetchBusiness();
                      setActiveTab("marketing");
                    }
                  });
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

              <Card
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                onClick={() => setActiveTab("calendar")}
              >
                <CardContent className="p-6">
                  <Calendar className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Calendrier de contenu</h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Planifiez et générez votre contenu
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            {business.market_analysis ? (
              <MarketAnalysisDisplay 
                analysis={business.market_analysis} 
                businessId={businessId}
                onDeepen={handleDeepen}
              />
            ) : (
              <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-blue-600" />
                    Analyse de marché
                  </CardTitle>
                  <CardDescription>
                    Comprenez votre marché cible et identifiez les opportunités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <Target className="relative w-16 h-16 text-blue-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Découvrez votre marché
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Obtenez une analyse complète de votre marché avec PESTEL, Porter, SWOT et recommandations stratégiques.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
                      onClick={() => {
                        openChat({
                          businessId,
                          businessName: business.name,
                          mode: 'analysis',
                          initialContext: 'L\'utilisateur souhaite une analyse de marché',
                          onActionComplete: (result) => {
                            fetchBusiness();
                            setActiveTab("market");
                          }
                        });
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Lancer l'analyse IA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="marketing" className="space-y-4">
            {business.marketing_strategy ? (
              <MarketingStrategyDisplay strategy={business.marketing_strategy} />
            ) : (
              <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    Stratégie marketing
                  </CardTitle>
                  <CardDescription>
                    Votre plan marketing pour atteindre vos objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <TrendingUp className="relative w-16 h-16 text-purple-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Créez votre stratégie de croissance
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Définissez votre positionnement, vos segments cibles, votre mix marketing et votre roadmap d'implémentation.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                      onClick={() => {
                        openChat({
                          businessId,
                          businessName: business.name,
                          mode: 'strategy',
                          initialContext: 'L\'utilisateur souhaite développer une stratégie marketing',
                          onActionComplete: (result) => {
                            fetchBusiness();
                            setActiveTab("marketing");
                          }
                        });
                      }}
                    >
                      <Zap className="w-5 h-5" />
                      Créer ma stratégie IA
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
          
        </Tabs>
      </div>
      
      {/* Nouveau système de chat unifié */}
      {business && (
        <>
          <ChatComponent />

          {!isOpen && (
            <Button
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              onClick={() => {
                openChat({
                  businessId,
                  businessName: business.name,
                  mode: 'general',
                  onActionComplete: (result) => {
                    fetchBusiness();
                  }
                });
              }}
            >
              <Sparkles className="w-6 h-6" />
            </Button>
          )}
        </>
      )}

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
      
    </div>
  );
}

export default BusinessDetailPage;