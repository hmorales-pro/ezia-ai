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
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EziaChatV2 } from "@/components/ezia-chat-v2";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface Business {
  _id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  website_url?: string;
  social_media: Record<string, string>;
  market_analysis: {
    target_audience: string;
    value_proposition: string;
    competitors?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  marketing_strategy: {
    positioning: string;
    key_messages: string[];
    channels: string[];
  };
  ezia_interactions: Array<{
    timestamp: string;
    agent: string;
    interaction_type: string;
    summary: string;
    content?: string;
    recommendations?: string[];
  }>;
  goals: Array<{
    title: string;
    description: string;
    target_date: string;
    status: string;
    progress?: number;
  }>;
  _createdAt: string;
  _updatedAt: string;
}

// Component for displaying individual interactions
function InteractionCard({ interaction }: { interaction: Business['ezia_interactions'][0] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'market_analysis':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'marketing_strategy':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'competitor_analysis':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      case 'content_calendar':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'branding':
        return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'social_media':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
  };
  
  const getInteractionLabel = (type: string) => {
    const labels: Record<string, string> = {
      market_analysis: "Analyse de marché",
      marketing_strategy: "Stratégie marketing",
      competitor_analysis: "Analyse concurrentielle",
      content_calendar: "Calendrier de contenu",
      branding: "Identité de marque",
      social_media: "Réseaux sociaux"
    };
    return labels[type] || type;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getInteractionIcon(interaction.interaction_type)}
            <span className="font-medium">{interaction.agent}</span>
            <Badge variant="outline" className="text-xs">
              {getInteractionLabel(interaction.interaction_type)}
            </Badge>
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(interaction.timestamp), "d MMM yyyy HH:mm", { locale: fr })}
          </span>
        </div>
        
        <p className="text-gray-700">{interaction.summary}</p>
        
        {interaction.recommendations && interaction.recommendations.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-600">Recommandations:</p>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
              {interaction.recommendations.map((rec, recIndex) => (
                <li key={recIndex}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {interaction.content && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#6D3FC8] hover:text-[#5A35A5]"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Masquer l'analyse complète
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Voir l'analyse complète
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && interaction.content && (
        <div className="border-t bg-gray-50 p-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-4">{children}</li>,
                p: ({ children }) => <p className="my-2">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                table: ({ children }) => <table className="border-collapse table-auto w-full my-4">{children}</table>,
                th: ({ children }) => <th className="border border-gray-300 px-3 py-2 bg-gray-100">{children}</th>,
                td: ({ children }) => <td className="border border-gray-300 px-3 py-2">{children}</td>,
              }}
            >
              {interaction.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = params.businessId as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAction, setChatAction] = useState<string>("general");

  useEffect(() => {
    fetchBusiness();
    
    // Vérifier si une action est demandée via l'URL
    const action = searchParams.get("action");
    if (action) {
      setChatAction(action);
      setChatOpen(true);
    }
  }, [businessId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/me/business/${businessId}`);
      setBusiness(response.data.business);
    } catch (err) {
      console.error("Error fetching business:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce business ?")) return;
    
    try {
      await api.delete(`/api/me/business/${businessId}`);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting business:", err);
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to delete business");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D3FC8] mx-auto"></div>
          <p className="mt-4 text-[#666666]">Chargement...</p>
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

  const getStageColor = (stage: string) => {
    const colors = {
      idea: "bg-yellow-50 text-yellow-700",
      startup: "bg-blue-50 text-blue-700",
      growth: "bg-green-50 text-green-700",
      established: "bg-purple-50 text-purple-700"
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Header */}
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
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={getStageColor(business.stage)}>
                    {business.stage}
                  </Badge>
                  <span className="text-sm text-[#666666]">{business.industry}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="market">Analyse de marché</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="interactions">Interactions Agence</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-[#444444]">Description</h3>
                  <p className="mt-1 text-[#666666]">{business.description}</p>
                </div>
                {business.website_url && (
                  <div>
                    <h3 className="font-medium text-[#444444]">Site web</h3>
                    <a 
                      href={business.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-[#6D3FC8] hover:text-[#5A35A5] hover:underline flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      {business.website_url}
                    </a>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-[#444444]">Créé le</h3>
                  <p className="mt-1 text-[#666666]">
                    {format(new Date(business._createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("create_website");
                  setChatOpen(true);
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

            {/* More Actions */}
            <h3 className="text-lg font-semibold mb-4">Nos autres agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("content_calendar");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                  <h4 className="font-medium text-sm">Calendrier de contenu</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Planifiez vos publications
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("competitor_analysis");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <BarChart3 className="w-6 h-6 text-orange-600 mb-2" />
                  <h4 className="font-medium text-sm">Analyse concurrentielle</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Étudiez vos concurrents
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("branding");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <Sparkles className="w-6 h-6 text-pink-600 mb-2" />
                  <h4 className="font-medium text-sm">Identité de marque</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Définissez votre image
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all shadow-md bg-white"
                onClick={() => {
                  setChatAction("social_media");
                  setChatOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-sm">Réseaux sociaux</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Stratégie sociale
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse de marché</CardTitle>
                <CardDescription>
                  Compréhension de votre marché et positionnement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.market_analysis.target_audience ? (
                  <>
                    <div>
                      <h3 className="font-medium text-gray-700">Audience cible</h3>
                      <p className="mt-1 text-[#666666]">{business.market_analysis.target_audience}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Proposition de valeur</h3>
                      <p className="mt-1 text-[#666666]">{business.market_analysis.value_proposition}</p>
                    </div>
                    {business.market_analysis.competitors && business.market_analysis.competitors.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700">Concurrents</h3>
                        <ul className="mt-1 list-disc list-inside text-gray-600">
                          {business.market_analysis.competitors.map((competitor, index) => (
                            <li key={index}>{competitor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune analyse de marché disponible</p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setChatAction("market_analysis");
                        setChatOpen(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Consulter l'agence
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stratégie marketing</CardTitle>
                <CardDescription>
                  Votre approche marketing et communication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.marketing_strategy.positioning ? (
                  <>
                    <div>
                      <h3 className="font-medium text-gray-700">Positionnement</h3>
                      <p className="mt-1 text-[#666666]">{business.marketing_strategy.positioning}</p>
                    </div>
                    {business.marketing_strategy.key_messages.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700">Messages clés</h3>
                        <ul className="mt-1 list-disc list-inside text-gray-600">
                          {business.marketing_strategy.key_messages.map((message, index) => (
                            <li key={index}>{message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {business.marketing_strategy.channels.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700">Canaux</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {business.marketing_strategy.channels.map((channel, index) => (
                            <Badge key={index} variant="secondary">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
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
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Créer avec l'agence
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Objectifs business</CardTitle>
                  <CardDescription>
                    Suivez vos objectifs et votre progression
                  </CardDescription>
                </div>
                <Link href={`/business/${businessId}/goals`}>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Gérer les objectifs
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {business.goals.length > 0 ? (
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

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des interactions avec l'agence</CardTitle>
                <CardDescription>
                  Toutes vos conversations et recommandations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {business.ezia_interactions.length > 0 ? (
                    business.ezia_interactions.map((interaction, index) => (
                      <InteractionCard key={index} interaction={interaction} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucune interaction pour le moment</p>
                      <Button 
                        className="mt-4"
                        onClick={() => {
                          setChatAction("general");
                          setChatOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Démarrer une conversation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ezia Chat Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-4xl h-[80vh] p-0 !bg-white !border-[#E0E0E0]" aria-describedby="ezia-chat-description">
            <DialogTitle className="sr-only">Agence Ezia</DialogTitle>
            <DialogDescription className="sr-only" id="ezia-chat-description">
              Discutez avec votre équipe d'agents IA pour gérer votre business {business.name}
            </DialogDescription>
            <EziaChatV2
              businessId={businessId}
              businessName={business.name}
              actionType={chatAction}
              onActionComplete={(result) => {
                console.log("Action completed:", result);
                // Recharger les données du business
                fetchBusiness();
                // Ne pas fermer la modale pour voir le résultat
                // setChatOpen(false);
              }}
              onClose={() => setChatOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Floating Action Button pour chat général */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            setChatAction("general");
            setChatOpen(true);
          }}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}