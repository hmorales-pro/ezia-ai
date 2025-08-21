"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth, addDays, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, ChevronLeft, ChevronRight, Sparkles, FileText, Video, Image, Hash, 
  Loader2, Play, Pause, CheckCircle, AlertCircle, Clock, TrendingUp, Users,
  Linkedin, Facebook, Instagram, Twitter, Youtube, Globe, Zap, BarChart3,
  MessageSquare, Target, Lightbulb, PenTool, Camera, Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AIContentItem {
  id: string;
  date: string;
  title: string;
  type: "article" | "video" | "image" | "social" | "email" | "ad";
  description: string;
  agent: string;
  agent_emoji: string;
  platforms: string[];
  estimatedTime: string;
  aiCapabilities: string[];
  status: "suggested" | "approved" | "generating" | "generated" | "published";
  content?: string;
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
  performance?: {
    estimatedReach?: number;
    estimatedEngagement?: number;
  };
}

interface AIContentCalendarProps {
  businessId: string;
  businessName: string;
  businessIndustry: string;
  businessDescription: string;
  marketAnalysis?: any;
  targetAudience?: string;
}

// Agents et leurs capacités de création de contenu
const CONTENT_AGENTS = {
  kiko: {
    name: "Kiko",
    emoji: "💻",
    role: "Développeur Full-Stack",
    capabilities: [
      { type: "article", label: "Articles techniques et tutoriels" },
      { type: "article", label: "Documentation produit" },
      { type: "social", label: "Tips techniques sur LinkedIn/Twitter" }
    ]
  },
  vera: {
    name: "Vera",
    emoji: "✍️",
    role: "Rédactrice de contenu",
    capabilities: [
      { type: "article", label: "Articles de blog SEO" },
      { type: "email", label: "Newsletters engageantes" },
      { type: "social", label: "Posts réseaux sociaux" },
      { type: "ad", label: "Copies publicitaires" }
    ]
  },
  milo: {
    name: "Milo",
    emoji: "🎨",
    role: "Designer UI/UX",
    capabilities: [
      { type: "image", label: "Visuels pour réseaux sociaux" },
      { type: "image", label: "Infographies" },
      { type: "image", label: "Bannières publicitaires" }
    ]
  },
  leo: {
    name: "Leo",
    emoji: "🎥",
    role: "Créateur vidéo",
    capabilities: [
      { type: "video", label: "Vidéos courtes (Reels/TikTok)" },
      { type: "video", label: "Vidéos explicatives" },
      { type: "video", label: "Témoignages clients" }
    ]
  },
  sophie: {
    name: "Sophie",
    emoji: "📊",
    role: "Analyste marketing",
    capabilities: [
      { type: "article", label: "Rapports d'analyse de marché" },
      { type: "image", label: "Graphiques de performance" },
      { type: "email", label: "Rapports mensuels clients" }
    ]
  }
};

const platformIcons = {
  website: Globe,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  email: MessageSquare
};

const contentTypeConfig = {
  article: { icon: FileText, color: "bg-blue-100 text-blue-800", label: "Article" },
  video: { icon: Video, color: "bg-purple-100 text-purple-800", label: "Vidéo" },
  image: { icon: Image, color: "bg-green-100 text-green-800", label: "Visuel" },
  social: { icon: Hash, color: "bg-orange-100 text-orange-800", label: "Post social" },
  email: { icon: MessageSquare, color: "bg-pink-100 text-pink-800", label: "Email" },
  ad: { icon: Megaphone, color: "bg-red-100 text-red-800", label: "Publicité" }
};

// Stockage en mémoire
declare global {
  var aiContentSuggestions: Record<string, AIContentItem[]>;
}

if (!global.aiContentSuggestions) {
  global.aiContentSuggestions = {};
}

export function AIContentCalendar({ 
  businessId, 
  businessName, 
  businessIndustry, 
  businessDescription,
  marketAnalysis,
  targetAudience 
}: AIContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [suggestions, setSuggestions] = useState<AIContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AIContentItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    // Charger les suggestions existantes
    setSuggestions(global.aiContentSuggestions[businessId] || []);
  }, [businessId]);

  const saveSuggestions = (items: AIContentItem[]) => {
    global.aiContentSuggestions[businessId] = items;
    setSuggestions(items);
  };

  const generateMonthSuggestions = async () => {
    setGeneratingCalendar(true);
    try {
      // Simuler la génération IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const monthStart = startOfMonth(currentDate);
      const suggestions: AIContentItem[] = [];
      
      // Stratégie de contenu basée sur le secteur
      const contentStrategy = getContentStrategy(businessIndustry, targetAudience);
      
      // Générer 12-15 suggestions pour le mois
      for (let i = 0; i < 15; i++) {
        const dayOffset = Math.floor(Math.random() * 28) + 1;
        const date = addDays(monthStart, dayOffset);
        
        // Sélectionner un agent aléatoire
        const agents = Object.keys(CONTENT_AGENTS);
        const agentKey = agents[Math.floor(Math.random() * agents.length)];
        const agent = CONTENT_AGENTS[agentKey as keyof typeof CONTENT_AGENTS];
        
        // Sélectionner une capacité de l'agent
        const capability = agent.capabilities[Math.floor(Math.random() * agent.capabilities.length)];
        
        // Générer le contenu suggéré
        const suggestion = generateContentSuggestion(
          date,
          agent,
          capability,
          businessName,
          businessIndustry,
          contentStrategy
        );
        
        suggestions.push(suggestion);
      }
      
      // Trier par date
      suggestions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      saveSuggestions([...global.aiContentSuggestions[businessId] || [], ...suggestions]);
      toast.success("Calendrier de contenu généré avec succès !");
      
    } catch (error) {
      toast.error("Erreur lors de la génération du calendrier");
    } finally {
      setGeneratingCalendar(false);
    }
  };

  const getContentStrategy = (industry: string, audience?: string) => {
    // Stratégies personnalisées par industrie
    const strategies: Record<string, any> = {
      technology: {
        themes: ["innovation", "tutoriels", "tendances", "cas d'usage"],
        tone: "professionnel et accessible",
        frequency: "3-4 fois par semaine"
      },
      retail: {
        themes: ["promotions", "nouveautés", "conseils d'achat", "lifestyle"],
        tone: "amical et engageant",
        frequency: "quotidien"
      },
      services: {
        themes: ["expertise", "études de cas", "conseils", "témoignages"],
        tone: "expert et rassurant",
        frequency: "2-3 fois par semaine"
      },
      healthcare: {
        themes: ["prévention", "conseils santé", "innovations", "bien-être"],
        tone: "empathique et informatif",
        frequency: "2-3 fois par semaine"
      }
    };
    
    return strategies[industry] || strategies.services;
  };

  const generateContentSuggestion = (
    date: Date,
    agent: typeof CONTENT_AGENTS[keyof typeof CONTENT_AGENTS],
    capability: { type: string; label: string },
    businessName: string,
    industry: string,
    strategy: any
  ): AIContentItem => {
    const themes = strategy.themes;
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    // Générer un titre basé sur le type et le thème
    const titles = getContentTitles(capability.type, theme, businessName, industry);
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    // Déterminer les plateformes appropriées
    const platforms = getPlatformsForContent(capability.type);
    
    return {
      id: `ai-${Date.now()}-${Math.random()}`,
      date: format(date, "yyyy-MM-dd"),
      title,
      type: capability.type as AIContentItem["type"],
      description: capability.label,
      agent: agent.name,
      agent_emoji: agent.emoji,
      platforms,
      estimatedTime: getEstimatedTime(capability.type),
      aiCapabilities: [
        "Génération automatique du contenu",
        "Optimisation SEO",
        "Adaptation multi-plateformes",
        "Analyse de performance prédictive"
      ],
      status: "suggested",
      keywords: [theme, industry, capability.type],
      targetAudience: strategy.audience || "Professionnels et décideurs",
      tone: strategy.tone,
      performance: {
        estimatedReach: Math.floor(Math.random() * 5000) + 1000,
        estimatedEngagement: Math.floor(Math.random() * 15) + 5
      }
    };
  };

  const getContentTitles = (type: string, theme: string, businessName: string, industry: string) => {
    const titleTemplates: Record<string, string[]> = {
      article: [
        `Comment ${theme} transforme ${industry}`,
        `${theme} : Le guide complet pour ${industry}`,
        `5 façons dont ${businessName} révolutionne ${theme}`,
        `L'impact de ${theme} sur votre business`
      ],
      video: [
        `${businessName} explique : ${theme}`,
        `Découvrez ${theme} en 60 secondes`,
        `Behind the scenes : Notre approche ${theme}`,
        `Témoignage client sur ${theme}`
      ],
      image: [
        `Infographie : ${theme} en chiffres`,
        `${theme} visualisé pour ${industry}`,
        `Les tendances ${theme} 2024`,
        `${businessName} et ${theme} : Les stats clés`
      ],
      social: [
        `💡 Saviez-vous que ${theme}...`,
        `🚀 ${businessName} innove avec ${theme}`,
        `📊 Les chiffres ${theme} qui comptent`,
        `✨ Nouveau : ${theme} chez ${businessName}`
      ],
      email: [
        `Newsletter : Les dernières actualités ${theme}`,
        `${businessName} : Votre update ${theme}`,
        `Ce mois-ci : Focus sur ${theme}`,
        `Exclusive : Nos insights ${theme}`
      ],
      ad: [
        `Découvrez comment ${theme} booste votre ROI`,
        `${businessName} : Leader en ${theme}`,
        `Transformez votre business avec ${theme}`,
        `Offre spéciale ${theme} - Temps limité`
      ]
    };
    
    return titleTemplates[type] || titleTemplates.article;
  };

  const getPlatformsForContent = (type: string): string[] => {
    const platformMap: Record<string, string[]> = {
      article: ["website", "linkedin", "facebook"],
      video: ["youtube", "instagram", "linkedin", "facebook"],
      image: ["instagram", "facebook", "twitter", "linkedin"],
      social: ["linkedin", "twitter", "facebook", "instagram"],
      email: ["email"],
      ad: ["facebook", "linkedin", "instagram"]
    };
    
    return platformMap[type] || ["website"];
  };

  const getEstimatedTime = (type: string): string => {
    const timeMap: Record<string, string> = {
      article: "30-45 min",
      video: "15-30 min",
      image: "10-20 min",
      social: "5-10 min",
      email: "20-30 min",
      ad: "15-20 min"
    };
    
    return timeMap[type] || "15 min";
  };

  const handleApproveContent = (item: AIContentItem) => {
    const updated = suggestions.map(s => 
      s.id === item.id ? { ...s, status: "approved" as const } : s
    );
    saveSuggestions(updated);
    toast.success("Contenu approuvé pour génération");
  };

  const handleGenerateContent = async (item: AIContentItem) => {
    setGenerating(true);
    const updated = suggestions.map(s => 
      s.id === item.id ? { ...s, status: "generating" as const } : s
    );
    saveSuggestions(updated);
    
    try {
      // Simuler la génération du contenu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const finalUpdated = suggestions.map(s => 
        s.id === item.id 
          ? { 
              ...s, 
              status: "generated" as const,
              content: `Contenu généré par ${item.agent} : ${item.title}\n\nCeci est un exemple de contenu qui serait généré automatiquement par l'agent IA.`
            } 
          : s
      );
      saveSuggestions(finalUpdated);
      toast.success(`Contenu généré par ${item.agent} !`);
      
    } catch (error) {
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setGenerating(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getContentForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return suggestions.filter(item => item.date === dateStr);
  };

  // Statistiques
  const stats = {
    total: suggestions.length,
    approved: suggestions.filter(s => s.status === "approved").length,
    generated: suggestions.filter(s => s.status === "generated").length,
    published: suggestions.filter(s => s.status === "published").length,
    byAgent: Object.entries(CONTENT_AGENTS).map(([key, agent]) => ({
      name: agent.name,
      emoji: agent.emoji,
      count: suggestions.filter(s => s.agent === agent.name).length
    }))
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
              Calendrier de contenu IA
            </CardTitle>
            <CardDescription>
              Contenus suggérés et générables automatiquement par votre équipe d'agents
            </CardDescription>
          </div>
          <Button
            onClick={generateMonthSuggestions}
            disabled={generatingCalendar}
            className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
          >
            {generatingCalendar ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Générer suggestions du mois
          </Button>
        </div>

        {/* Stats des agents */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {stats.byAgent.map((agent) => (
            <div key={agent.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">{agent.emoji}</span>
              <div>
                <div className="text-xs text-gray-600">{agent.name}</div>
                <div className="text-sm font-semibold">{agent.count} contenus</div>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {/* Navigation du mois */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-xl font-semibold">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Grille du calendrier */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {emptyCells.map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[120px] border-r border-b bg-gray-50" />
                ))}
                
                {days.map((day) => {
                  const dayContent = getContentForDate(day);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[120px] border-r border-b p-2",
                        isTodayDate && "bg-blue-50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "text-sm font-medium",
                          isTodayDate && "text-blue-600 font-bold"
                        )}>
                          {format(day, "d")}
                        </span>
                        {dayContent.length > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {dayContent.length}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayContent.slice(0, 2).map((item) => {
                          const config = contentTypeConfig[item.type];
                          const Icon = config.icon;
                          
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "text-xs p-1 rounded flex items-center gap-1 truncate cursor-pointer",
                                config.color
                              )}
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailDialog(true);
                              }}
                            >
                              <span className="text-sm">{item.agent_emoji}</span>
                              <Icon className="w-3 h-3" />
                              <span className="truncate flex-1">{item.title}</span>
                              {item.status === "generated" && (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              )}
                            </div>
                          );
                        })}
                        {dayContent.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayContent.length - 2} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="space-y-2">
              {["suggested", "approved", "generating", "generated", "published"].map((status) => (
                <div key={status}>
                  <h4 className="font-medium text-sm text-gray-600 mb-2 capitalize">
                    {status === "suggested" && "Suggestions IA"}
                    {status === "approved" && "Approuvés"}
                    {status === "generating" && "En génération"}
                    {status === "generated" && "Générés"}
                    {status === "published" && "Publiés"}
                    <Badge variant="secondary" className="ml-2">
                      {suggestions.filter(s => s.status === status).length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {suggestions
                      .filter(s => s.status === status)
                      .map((item) => {
                        const config = contentTypeConfig[item.type];
                        const Icon = config.icon;
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetailDialog(true);
                            }}
                          >
                            <span className="text-xl">{item.agent_emoji}</span>
                            <div className={cn("p-2 rounded", config.color)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{item.title}</h5>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{format(new Date(item.date), "d MMM", { locale: fr })}</span>
                                <span>{item.agent}</span>
                                <span>{item.estimatedTime}</span>
                              </div>
                            </div>
                            {item.status === "suggested" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveContent(item);
                                }}
                              >
                                Approuver
                              </Button>
                            )}
                            {item.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateContent(item);
                                }}
                              >
                                Générer
                              </Button>
                            )}
                            {item.status === "generating" && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance estimée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Portée totale estimée</span>
                        <span className="font-semibold">
                          {suggestions.reduce((acc, s) => acc + (s.performance?.estimatedReach || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taux d'engagement moyen</span>
                        <span className="font-semibold">
                          {Math.round(suggestions.reduce((acc, s) => acc + (s.performance?.estimatedEngagement || 0), 0) / suggestions.length || 0)}%
                        </span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(contentTypeConfig).map(([type, config]) => {
                      const count = suggestions.filter(s => s.type === type).length;
                      const percentage = suggestions.length > 0 ? (count / suggestions.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1 rounded", config.color)}>
                              <config.icon className="w-3 h-3" />
                            </div>
                            <span className="text-sm">{config.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{count}</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#6D3FC8] h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Dialog de détail */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedItem?.agent_emoji}</span>
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription>
              Suggéré par {selectedItem?.agent} pour le {selectedItem && format(new Date(selectedItem.date), "d MMMM yyyy", { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type de contenu:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const config = contentTypeConfig[selectedItem.type];
                      const Icon = config.icon;
                      return (
                        <>
                          <div className={cn("p-1 rounded", config.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{config.label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Temps estimé:</span>
                  <p className="font-medium mt-1">{selectedItem.estimatedTime}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Plateformes:</span>
                <div className="flex gap-2 mt-1">
                  {selectedItem.platforms.map(platform => {
                    const Icon = platformIcons[platform as keyof typeof platformIcons];
                    return (
                      <div key={platform} className="p-2 bg-gray-100 rounded">
                        <Icon className="w-4 h-4" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Capacités IA:</span>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {selectedItem.aiCapabilities.map((cap, i) => (
                    <li key={i}>{cap}</li>
                  ))}
                </ul>
              </div>

              {selectedItem.status === "generated" && selectedItem.content && (
                <div>
                  <span className="text-sm text-gray-600">Contenu généré:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                    {selectedItem.content}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Performance estimée</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Portée: {selectedItem.performance?.estimatedReach?.toLocaleString()} • 
                    Engagement: {selectedItem.performance?.estimatedEngagement}%
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fermer
            </Button>
            {selectedItem?.status === "suggested" && (
              <Button 
                onClick={() => {
                  handleApproveContent(selectedItem);
                  setShowDetailDialog(false);
                }}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
              >
                Approuver pour génération
              </Button>
            )}
            {selectedItem?.status === "approved" && (
              <Button 
                onClick={() => {
                  handleGenerateContent(selectedItem);
                  setShowDetailDialog(false);
                }}
                disabled={generating}
              >
                {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Générer maintenant
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}