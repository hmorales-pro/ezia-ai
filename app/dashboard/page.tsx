"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Globe,
  Sparkles,
  ArrowRight,
  Loader2,
  Target,
  Calendar,
  BarChart3,
  Users,
  FileText,
  Zap,
  ChevronRight,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { LoginModal } from "@/components/login-modal";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Business {
  _id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  website_url?: string;
  _createdAt: string;
  completion_score?: number;
  ezia_interactions?: Array<{
    timestamp: string;
    agent: string;
    interaction_type: string;
    summary: string;
  }>;
  metrics?: {
    website_visitors?: number;
    conversion_rate?: number;
    monthly_growth?: number;
    task_completion?: number;
  };
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  useEffect(() => {
    if (!userLoading && user) {
      fetchBusinesses();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get("/api/me/business");
      if (response.data.ok) {
        setBusinesses(response.data.businesses);
        // Sélectionner automatiquement le premier business
        if (response.data.businesses.length > 0) {
          setSelectedBusiness(response.data.businesses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    router.push("/business/new");
  };

  const handleBusinessClick = (businessId: string) => {
    router.push(`/business/${businessId}`);
  };

  // Calculer les statistiques globales
  const globalStats = {
    totalBusinesses: businesses.length,
    activeWebsites: businesses.filter(b => b.website_url).length,
    avgCompletionScore: businesses.length > 0 
      ? Math.round(businesses.reduce((acc, b) => acc + (b.completion_score || 0), 0) / businesses.length)
      : 0,
    totalInteractions: businesses.reduce((acc, b) => acc + (b.ezia_interactions?.length || 0), 0)
  };

  // Récupérer toutes les activités récentes
  const allActivities = businesses.flatMap(b => 
    (b.ezia_interactions || []).map(interaction => ({
      id: `${b.business_id}-${interaction.timestamp}`,
      type: interaction.interaction_type,
      agent: interaction.agent,
      summary: `${b.name}: ${interaction.summary}`,
      timestamp: interaction.timestamp
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] overflow-y-auto">
      {/* Header amélioré */}
      <header className="border-b border-[#E0E0E0] backdrop-blur-xl bg-white/90 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Ezia</h1>
                <p className="text-xs text-[#666666]">Tableau de bord</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.fullname || user.name}</p>
                    <p className="text-xs text-[#666666]">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/pricing")}
                    className="text-[#666666] hover:text-[#1E1E1E] border-[#E0E0E0] hover:bg-gray-50"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Abonnement
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/projects")}
                    className="text-[#666666] hover:text-[#1E1E1E] border-[#E0E0E0] hover:bg-gray-50"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Projets Web
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowLoginModal(true)} 
                  className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  Se connecter
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Business actifs"
              value={globalStats.totalBusinesses}
              icon={Building2}
              iconColor="text-violet-500"
            />
            <StatCard
              title="Sites web créés"
              value={globalStats.activeWebsites}
              change={globalStats.totalBusinesses > 0 ? Math.round((globalStats.activeWebsites / globalStats.totalBusinesses) * 100) : 0}
              trend="up"
              icon={Globe}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Score moyen"
              value={`${globalStats.avgCompletionScore}%`}
              icon={TrendingUp}
              iconColor="text-green-500"
            />
            <StatCard
              title="Interactions Agence"
              value={globalStats.totalInteractions}
              icon={MessageSquare}
              iconColor="text-orange-500"
            />
          </div>

          {/* Sélecteur de business et actions rapides */}
          {businesses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Actions rapides</h2>
                <select
                  className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-2 text-sm shadow-sm"
                  value={selectedBusiness?.business_id || ""}
                  onChange={(e) => {
                    const business = businesses.find(b => b.business_id === e.target.value);
                    setSelectedBusiness(business || null);
                  }}
                >
                  {businesses.map(business => (
                    <option key={business.business_id} value={business.business_id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Créer un site web"
                  description="Lancez votre présence en ligne"
                  icon={Globe}
                  onClick={() => {
                    if (selectedBusiness) {
                      const prompt = encodeURIComponent(`Crée un site web moderne pour ${selectedBusiness.name}. ${selectedBusiness.description}`);
                      router.push(`/projects/new?prompt=${prompt}&businessId=${selectedBusiness.business_id}`);
                    }
                  }}
                  iconColor="text-purple-500"
                  badge="DeepSite"
                />
                <QuickActionCard
                  title="Analyse de marché"
                  description="Comprenez votre environnement"
                  icon={Target}
                  onClick={() => selectedBusiness && router.push(`/business/${selectedBusiness.business_id}?action=market_analysis`)}
                  iconColor="text-blue-500"
                />
                <QuickActionCard
                  title="Stratégie marketing"
                  description="Développez votre croissance"
                  icon={TrendingUp}
                  onClick={() => selectedBusiness && router.push(`/business/${selectedBusiness.business_id}?action=marketing_strategy`)}
                  iconColor="text-green-500"
                />
                <QuickActionCard
                  title="Calendrier contenu"
                  description="Planifiez vos publications"
                  icon={Calendar}
                  onClick={() => selectedBusiness && router.push(`/business/${selectedBusiness.business_id}?action=content_calendar`)}
                  iconColor="text-orange-500"
                />
              </div>
            </div>
          )}

          {/* Dashboard principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des business */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Vos Business</h2>
                <Button
                  onClick={handleCreateBusiness}
                  size="sm"
                  className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau
                </Button>
              </div>

              {businesses.length === 0 ? (
                <Card className="p-12 text-center bg-white backdrop-blur-sm border border-[#E0E0E0] shadow-lg">
                  <Building2 className="w-16 h-16 text-[#666666] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Commencez votre aventure entrepreneuriale
                  </h3>
                  <p className="text-[#666666] mb-6 max-w-md mx-auto">
                    Créez votre premier business et laissez notre équipe d'agents IA vous accompagner dans chaque étape.
                  </p>
                  <Button 
                    onClick={handleCreateBusiness} 
                    className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer mon premier business
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <Card
                      key={business.business_id}
                      className="bg-white backdrop-blur-sm border border-[#E0E0E0] hover:shadow-lg cursor-pointer transition-all group shadow-md"
                      onClick={() => handleBusinessClick(business.business_id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="w-6 h-6 text-[#6D3FC8]" />
                              <h3 className="text-lg font-semibold group-hover:text-[#6D3FC8] transition-colors">
                                {business.name}
                              </h3>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                business.stage === 'idea' ? 'bg-blue-500/20 text-blue-400' :
                                business.stage === 'startup' ? 'bg-green-500/20 text-green-400' :
                                business.stage === 'growth' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-purple-500/20 text-purple-400'
                              )}>
                                {business.stage}
                              </span>
                            </div>
                            <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                              {business.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[#666666]">
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {business.industry}
                              </span>
                              {business.website_url && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Site actif
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {business.ezia_interactions?.length || 0} interactions
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#6D3FC8]">
                              {business.completion_score || 0}%
                            </div>
                            <p className="text-xs text-[#666666]">Complété</p>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="mt-4">
                          <Progress value={business.completion_score || 0} className="h-1" />
                        </div>

                        {/* Actions rapides */}
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const prompt = encodeURIComponent(`Crée un site web moderne pour ${business.name}. ${business.description}`);
                              router.push(`/projects/new?prompt=${prompt}&businessId=${business.business_id}`);
                            }}
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            Site web
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/business/${business.business_id}?action=market_analysis`);
                            }}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Analyse
                          </Button>
                          <ChevronRight className="w-4 h-4 ml-auto text-[#666666] group-hover:text-[#6D3FC8] transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Activité récente */}
              <ActivityFeed activities={allActivities} />

              {/* Progression des tâches */}
              {selectedBusiness && (
                <ProgressChart
                  title="Progression du business"
                  items={[
                    { label: "Présence en ligne", value: selectedBusiness.website_url ? 100 : 0, color: "#8b5cf6" },
                    { label: "Analyse de marché", value: selectedBusiness.ezia_interactions?.some(i => i.interaction_type === "market_analysis") ? 100 : 0, color: "#3b82f6" },
                    { label: "Stratégie marketing", value: selectedBusiness.ezia_interactions?.some(i => i.interaction_type === "marketing_strategy") ? 100 : 0, color: "#10b981" },
                    { label: "Contenu planifié", value: selectedBusiness.ezia_interactions?.some(i => i.interaction_type === "content_calendar") ? 100 : 0, color: "#f59e0b" }
                  ]}
                />
              )}

              {/* Actions suggérées */}
              <Card className="bg-white border-[#E0E0E0] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Actions suggérées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedBusiness && !selectedBusiness.website_url && (
                    <button
                      className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-[#E0E0E0] transition-all group hover:shadow-md"
                      onClick={() => {
                        const prompt = encodeURIComponent(`Crée un site web moderne pour ${selectedBusiness.name}. ${selectedBusiness.description}`);
                        router.push(`/projects/new?prompt=${prompt}&businessId=${selectedBusiness.business_id}`);
                      }}
                    >
                      <p className="text-sm font-medium group-hover:text-[#6D3FC8] transition-colors">
                        Créer votre site web
                      </p>
                      <p className="text-xs text-[#666666] mt-1">
                        Établissez votre présence en ligne
                      </p>
                    </button>
                  )}
                  <button
                    className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-[#E0E0E0] transition-all group hover:shadow-md"
                    onClick={() => selectedBusiness && router.push(`/business/${selectedBusiness.business_id}?action=competitor_analysis`)}
                  >
                    <p className="text-sm font-medium group-hover:text-[#6D3FC8] transition-colors">
                      Analyser la concurrence
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      Identifiez vos avantages compétitifs
                    </p>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Hero Section pour les non-connectés */
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6D3FC8]/10 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1E1E1E] to-[#666666] bg-clip-text text-transparent">
                Votre agence digitale IA
              </h2>
              <p className="text-xl text-[#666666] mb-12">
                Ezia met à votre disposition une équipe complète d'experts IA pour développer 
                votre présence en ligne et faire croître votre business.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleCreateBusiness}
                  className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Commencer gratuitement
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowLoginModal(true)}
                >
                  Se connecter
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 bg-white border-[#E0E0E0] backdrop-blur-sm shadow-lg">
                <Target className="w-12 h-12 text-[#6D3FC8] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Analyse de marché</h3>
                <p className="text-[#666666]">
                  Notre agent analyste étudie votre marché, identifie les opportunités et positionne votre offre.
                </p>
              </Card>
              
              <Card className="p-8 bg-white border-[#E0E0E0] backdrop-blur-sm shadow-lg">
                <Globe className="w-12 h-12 text-[#6D3FC8] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Présence en ligne</h3>
                <p className="text-[#666666]">
                  Nos agents créent votre site web, gèrent vos réseaux sociaux et optimisent votre visibilité.
                </p>
              </Card>
              
              <Card className="p-8 bg-white border-[#E0E0E0] backdrop-blur-sm shadow-lg">
                <MessageSquare className="w-12 h-12 text-[#6D3FC8] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Accompagnement continu</h3>
                <p className="text-[#666666]">
                  Une équipe complète d'agents IA travaille 24/7 pour faire évoluer votre business.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}

      <LoginModal open={showLoginModal} onClose={setShowLoginModal} />
    </div>
  );
}