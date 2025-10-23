"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, FileText, Video, Image, Hash, 
  Loader2, Edit, Trash2, Clock, CheckCircle, AlertCircle, Sparkles, TrendingUp, 
  Target, Users, Linkedin, Facebook, Instagram, Twitter, Youtube, Globe, Zap, 
  BarChart3, MessageSquare, Lightbulb, PenTool, Camera, Megaphone, Eye, Send,
  ImageIcon, Wand2, RefreshCw, MoreVertical, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/hooks/useUser";

interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: "article" | "video" | "image" | "social" | "email" | "ad";
  status: "draft" | "scheduled" | "published" | "suggested" | "approved" | "generating" | "generated";
  platform?: string[];
  description?: string;
  time?: string;
  tags?: string[];
  ai_generated?: boolean;
  content?: string;
  imageUrl?: string;
  agent?: string;
  agent_emoji?: string;
  aiCapabilities?: string[];
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
  marketingObjective?: string;
  objectiveDescription?: string;
  performance?: {
    views?: number;
    engagement?: number;
    clicks?: number;
    estimatedReach?: number;
    estimatedEngagement?: number;
  };
}

interface UnifiedContentCalendarProps {
  businessId: string;
  businessName: string;
  businessIndustry: string;
  businessDescription: string;
  marketAnalysis?: any;
  marketingStrategy?: any;
  competitorAnalysis?: any;
}

const contentTypeConfig = {
  article: { icon: FileText, color: "bg-blue-100 text-blue-800", label: "Article" },
  video: { icon: Video, color: "bg-purple-100 text-purple-800", label: "Vidéo" },
  image: { icon: Image, color: "bg-green-100 text-green-800", label: "Visuel" },
  social: { icon: Hash, color: "bg-orange-100 text-orange-800", label: "Post social" },
  email: { icon: MessageSquare, color: "bg-pink-100 text-pink-800", label: "Email" },
  ad: { icon: Megaphone, color: "bg-red-100 text-red-800", label: "Publicité" }
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

const platformOptions = [
  { value: "website", label: "Site web" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
];

// Agents et leurs capacités
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

// Stockage en mémoire
declare global {
  var unifiedContentItems: Record<string, ContentItem[]>;
}

if (!global.unifiedContentItems) {
  global.unifiedContentItems = {};
}

// Helper function to generate personalized content titles
function generatePersonalizedTitle(
  type: string,
  topic: string,
  businessName: string,
  industry: string
): string {
  const templates = {
    article: [
      `${topic} : Guide complet pour ${industry}`,
      `Comment ${businessName} révolutionne ${topic}`,
      `Top 5 tendances ${topic} en ${industry}`,
      `${topic} : Notre vision chez ${businessName}`,
      `Les secrets de ${topic} dans le ${industry}`
    ],
    video: [
      `${businessName} présente : ${topic}`,
      `${topic} expliqué en 2 minutes`,
      `Découvrez ${topic} avec ${businessName}`,
      `${topic} : Tutoriel ${industry}`
    ],
    social: [
      `💡 ${topic} : Notre expertise ${industry}`,
      `🚀 ${businessName} et ${topic}`,
      `✨ Astuce ${topic} pour ${industry}`,
      `🎯 ${topic} : Focus ${businessName}`
    ],
    email: [
      `Newsletter ${businessName} : ${topic}`,
      `${topic} - Édition spéciale ${industry}`,
      `Votre dose de ${topic} par ${businessName}`
    ]
  };

  const categoryTemplates = templates[type as keyof typeof templates] || templates.article;
  const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
  return categoryTemplates[randomIndex];
}

export function UnifiedContentCalendar({
  businessId,
  businessName,
  businessIndustry,
  businessDescription,
  marketAnalysis,
  marketingStrategy,
  competitorAnalysis
}: UnifiedContentCalendarProps) {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showBulkGenerateDialog, setShowBulkGenerateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "pipeline">("calendar");
  const [activeTab, setActiveTab] = useState("overview");
  const [hasAICalendar, setHasAICalendar] = useState(false);
  const [imageQuota, setImageQuota] = useState({ used: 0, quota: 0, remaining: 0 });
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "article" as ContentItem["type"],
    description: "",
    time: "09:00",
    platform: [] as string[],
    tags: [] as string[],
    content: "",
    imagePrompt: "",
  });

  useEffect(() => {
    // Charger le calendrier sauvegardé depuis l'API
    loadSavedCalendar();
    // Charger le quota d'images
    loadImageQuota();
  }, [businessId, user]);

  const loadImageQuota = async () => {
    // Ne charger le quota que si l'utilisateur est authentifié
    if (!user) {
      setImageQuota({ used: 0, quota: 0, remaining: 0 });
      return;
    }

    try {
      const response = await api.get('/api/images/generate');
      if (response.data.usage) {
        setImageQuota(response.data.usage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du quota d\'images:', error);
      // En cas d'erreur, ne pas afficher d'erreur mais initialiser à 0
      setImageQuota({ used: 0, quota: 0, remaining: 0 });
    }
  };

  const loadSavedCalendar = async () => {
    try {
      const response = await api.get(`/api/me/business/${businessId}/calendar`);
      if (response.data.calendar?.items) {
        setContentItems(response.data.calendar.items);
        // Vérifier si c'est un calendrier généré par IA
        const hasAISuggestions = response.data.calendar.items.some((item: ContentItem) => item.ai_generated);
        setHasAICalendar(hasAISuggestions);
      } else {
        // Fallback sur le stockage local si pas de calendrier sauvegardé
        setContentItems(global.unifiedContentItems[businessId] || []);
      }
    } catch (error) {
      console.error("Error loading calendar:", error);
      // Fallback sur le stockage local
      setContentItems(global.unifiedContentItems[businessId] || []);
    }
  };

  const saveContentItems = async (items: ContentItem[]) => {
    // Sauvegarder localement
    global.unifiedContentItems[businessId] = items;
    setContentItems(items);
    
    // Sauvegarder sur le serveur
    try {
      await api.post(`/api/me/business/${businessId}/calendar`, {
        calendar: items
      });
    } catch (error) {
      console.error("Error saving calendar to server:", error);
      toast.error("Erreur lors de la sauvegarde du calendrier");
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getContentForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return contentItems.filter(item => item.date === dateStr);
  };

  const generateAISuggestions = async (regenerate = false) => {
    // Si régénération, demander confirmation
    if (regenerate && hasAICalendar) {
      const confirmRegenerate = window.confirm(
        "Voulez-vous vraiment régénérer le calendrier AI ? Les suggestions précédentes seront remplacées."
      );
      if (!confirmRegenerate) return;
    }
    
    setGeneratingCalendar(true);
    
    // Afficher un message indiquant que l'IA travaille
    const loadingToast = toast.loading(
      "L'IA Ezia analyse votre business et génère un calendrier personnalisé...",
      { 
        description: "Cela peut prendre 10-20 secondes"
      }
    );
    
    try {
      // Si régénération, supprimer les suggestions AI existantes
      if (regenerate) {
        const nonAIItems = contentItems.filter(item => !item.ai_generated || item.status !== "suggested");
        await saveContentItems(nonAIItems);
      }
      
      // Vérifier si des analyses sont disponibles
      const hasAnalyses = marketAnalysis || marketingStrategy || competitorAnalysis;
      
      if (!hasAnalyses) {
        toast.warning("Les analyses de marché ne sont pas encore disponibles. Les suggestions seront plus génériques.");
      }
      
      // Appeler l'API pour générer les suggestions avec l'IA
      console.log("Calling regenerate-calendar API...");
      console.log("Business data:", {
        name: businessName,
        description: businessDescription,
        industry: businessIndustry,
        hasMarketAnalysis: !!marketAnalysis,
        hasMarketingStrategy: !!marketingStrategy
      });
      
      // Garantir un délai minimum pour que l'utilisateur perçoive le travail de l'IA
      const startTime = Date.now();
      
      const response = await api.post(`/api/me/business/${businessId}/regenerate-calendar`, {
        businessInfo: {
          name: businessName,
          description: businessDescription,
          industry: businessIndustry,
          marketAnalysis,
          marketingStrategy,
          competitorAnalysis
        },
        existingItems: contentItems,
        keepExisting: !regenerate
      });
      
      // Attendre au moins 3 secondes au total
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - elapsedTime));
      }
      
      console.log("API Response:", response.data);
      
      if (!response.data.success) {
        throw new Error("Failed to generate calendar");
      }
      
      const suggestions: ContentItem[] = response.data.suggestions || [];
      console.log("Suggestions received:", suggestions.length);
      
      // Sauvegarder les suggestions avec les items existants
      const currentItems = regenerate ? 
        contentItems.filter(item => !item.ai_generated || item.status !== "suggested") :
        contentItems;
      
      await saveContentItems([...currentItems, ...suggestions]);
      setHasAICalendar(true);
      
      // Fermer le toast de chargement et afficher le succès
      toast.dismiss(loadingToast);
      
      if (response.data.aiGenerated) {
        toast.success(
          `🤖 ${suggestions.length} suggestions personnalisées générées par l'IA !`,
          {
            description: "Basées sur votre analyse de marché et stratégie marketing"
          }
        );
      } else {
        toast.success(
          `✨ ${suggestions.length} suggestions de contenu générées !`,
          {
            description: "Suggestions de base adaptées à votre industrie"
          }
        );
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Erreur lors de la génération des suggestions");
      console.error(error);
    } finally {
      setGeneratingCalendar(false);
    }
  };

  // Les fonctions de génération locale ont été supprimées - maintenant géré par l'API
  const handleAddContent = () => {
    if (!formData.title || !selectedDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newItem: ContentItem = {
      id: `content-${Date.now()}`,
      date: format(selectedDate, "yyyy-MM-dd"),
      title: formData.title,
      type: formData.type,
      description: formData.description,
      status: "scheduled",
      time: formData.time,
      platform: formData.platform,
      tags: formData.tags,
      ai_generated: false,
      content: formData.content,
    };

    saveContentItems([...contentItems, newItem]);
    setShowAddDialog(false);
    resetForm();
    toast.success("Contenu ajouté au calendrier");
  };

  const handleUpdateContent = () => {
    if (!editingItem || !formData.title) return;

    const updatedItems = contentItems.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            title: formData.title,
            type: formData.type,
            description: formData.description,
            time: formData.time,
            platform: formData.platform,
            tags: formData.tags,
            content: formData.content,
          }
        : item
    );

    saveContentItems(updatedItems);
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
    toast.success("Contenu mis à jour");
  };

  const handleDeleteContent = (id: string) => {
    const updatedItems = contentItems.filter(item => item.id !== id);
    saveContentItems(updatedItems);
    toast.success("Contenu supprimé");
  };

  const handleGenerateSingleContent = async (item: ContentItem) => {
    setLoading(true);
    const updated = contentItems.map(c =>
      c.id === item.id ? { ...c, status: "generating" as const, content: "" } : c
    );
    await saveContentItems(updated);

    try {
      console.log("[Streaming] Démarrage génération pour:", item.title);

      // Appel à l'API streaming
      const response = await fetch(`/api/me/business/${businessId}/generate-content-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentItem: item,
          businessInfo: {
            name: businessName,
            description: businessDescription,
            industry: businessIndustry,
            marketAnalysis,
            marketingStrategy
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Lire le stream SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("[Streaming] ✅ Génération terminée");
          break;
        }

        // Décoder le chunk
        buffer += decoder.decode(value, { stream: true });

        // Traiter les lignes SSE
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            try {
              const json = JSON.parse(data);

              if (json.error) {
                throw new Error(json.error);
              }

              if (json.content) {
                // Accumuler le contenu
                accumulatedContent += json.content;

                // Mise à jour en temps réel de l'UI ⚡
                const streamUpdated = contentItems.map(c =>
                  c.id === item.id
                    ? {
                        ...c,
                        status: "generating" as const,
                        content: accumulatedContent
                      }
                    : c
                );
                setContentItems(streamUpdated);
              }
            } catch (e) {
              console.debug("[Streaming] Parse error:", e);
            }
          }
        }
      }

      // Marquer comme généré
      const finalUpdated = contentItems.map(c =>
        c.id === item.id
          ? {
              ...c,
              status: "generated" as const,
              content: accumulatedContent
            }
          : c
      );
      await saveContentItems(finalUpdated);
      toast.success(`Contenu généré avec succès !`);

      // Génération automatique d'image si le type est "image"
      if (item.type === "image" && imageQuota.remaining > 0) {
        try {
          toast.info("Génération automatique de l'image...");
          const imageResponse = await api.post("/api/images/generate", {
            prompt: "",
            contentTitle: item.title,
            contentDescription: accumulatedContent,
            contentType: item.type,
            width: 1024,
            height: 1024,
          });

          if (imageResponse.data.success && imageResponse.data.image) {
            // Mettre à jour l'item avec l'image générée
            const updatedWithImage = contentItems.map(c =>
              c.id === item.id
                ? {
                    ...c,
                    imageUrl: imageResponse.data.image
                  }
                : c
            );
            await saveContentItems(updatedWithImage);

            if (imageResponse.data.usage) {
              setImageQuota(imageResponse.data.usage);
            }

            toast.success(`Image générée automatiquement ! (${imageResponse.data.usage.remaining} restantes)`);
          }
        } catch (imageError: any) {
          console.error("Erreur génération auto image:", imageError);
          toast.warning("Le contenu a été généré mais l'image a échoué. Vous pouvez réessayer manuellement.");
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
      // Réinitialiser le statut en cas d'erreur
      const errorUpdated = contentItems.map(c => 
        c.id === item.id ? { ...c, status: "suggested" as const } : c
      );
      await saveContentItems(errorUpdated);
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulkContent = async () => {
    if (selectedItems.length === 0) {
      toast.error("Veuillez sélectionner au moins un contenu");
      return;
    }
    
    setLoading(true);
    
    try {
      // Mettre à jour le statut de tous les éléments sélectionnés
      const updated = contentItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: "generating" as const } 
          : item
      );
      await saveContentItems(updated);
      
      // Générer le contenu pour chaque élément sélectionné
      for (const itemId of selectedItems) {
        const item = contentItems.find(c => c.id === itemId);
        if (item) {
          // Utiliser la même fonction de génération que pour un seul contenu
          await handleGenerateSingleContent(item);
        }
      }
      
      toast.success(`${selectedItems.length} contenus générés avec succès !`);
      setSelectedItems([]);
      setShowBulkGenerateDialog(false);
      
    } catch (error) {
      toast.error("Erreur lors de la génération en masse");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegenerateAllContent = async (keepExisting = false) => {
    const confirmMessage = keepExisting 
      ? "Régénérer tout le calendrier AI tout en gardant vos contenus existants ?"
      : "Régénérer tout le calendrier AI ? Cela remplacera tous les contenus suggérés existants.";
    
    if (!window.confirm(confirmMessage)) return;
    
    setGeneratingCalendar(true);
    
    try {
      if (!keepExisting) {
        // Supprimer tous les contenus AI suggérés
        const nonAIItems = contentItems.filter(item => 
          !item.ai_generated || item.status !== "suggested"
        );
        await saveContentItems(nonAIItems);
      }
      
      // Régénérer le calendrier AI
      await generateAISuggestions(true);
      
    } catch (error) {
      console.error("Error regenerating calendar:", error);
      toast.error("Erreur lors de la régénération du calendrier");
    } finally {
      setGeneratingCalendar(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.imagePrompt && !formData.title) {
      toast.error("Veuillez décrire l'image à générer ou fournir un titre");
      return;
    }

    // Vérifier le quota
    if (imageQuota.remaining <= 0 && imageQuota.quota > 0) {
      toast.error(`Quota d'images épuisé (${imageQuota.quota}/mois). Revenez le mois prochain !`);
      return;
    }

    setGeneratingImage(true);

    try {
      // Appeler l'API pour générer l'image avec Stable Diffusion
      const response = await api.post("/api/images/generate", {
        prompt: formData.imagePrompt,
        contentTitle: formData.title,
        contentDescription: formData.description,
        contentType: formData.type,
        width: 1024,
        height: 1024,
      });

      if (response.data.success && response.data.image) {
        const imageBase64 = response.data.image;

        // Sauvegarder l'image générée
        setGeneratedImageUrl(imageBase64);

        // Mettre à jour le quota
        if (response.data.usage) {
          setImageQuota(response.data.usage);
        }

        toast.success(`Image générée ! (${response.data.usage.remaining} restantes ce mois)`);
      } else {
        toast.error("Aucune image générée");
      }

    } catch (error: any) {
      console.error("Erreur génération image:", error);
      const errorMessage = error.response?.data?.error || "Erreur lors de la génération de l'image";
      toast.error(errorMessage);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handlePreviewContent = (item: ContentItem) => {
    setPreviewItem(item);
    setShowPreviewDialog(true);
  };

  const handlePublishContent = async (item: ContentItem) => {
    const updated = contentItems.map(c => 
      c.id === item.id ? { ...c, status: "published" as const } : c
    );
    saveContentItems(updated);
    toast.success("Contenu publié avec succès !");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "article",
      description: "",
      time: "09:00",
      platform: [],
      tags: [],
      content: "",
      imagePrompt: "",
    });
    setGeneratedImageUrl(null);
  };

  const openEditDialog = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      description: item.description || "",
      time: item.time || "09:00",
      platform: item.platform || [],
      tags: item.tags || [],
      content: item.content || "",
      imagePrompt: "",
    });
    setShowEditDialog(true);
  };

  // Statistiques
  const stats = {
    total: contentItems.length,
    published: contentItems.filter(i => i.status === "published").length,
    scheduled: contentItems.filter(i => i.status === "scheduled").length,
    draft: contentItems.filter(i => i.status === "draft").length,
    suggested: contentItems.filter(i => i.status === "suggested").length,
    generated: contentItems.filter(i => i.status === "generated").length,
    byAgent: Object.entries(CONTENT_AGENTS).map(([key, agent]) => ({
      name: agent.name,
      emoji: agent.emoji,
      count: contentItems.filter(i => i.agent === agent.name).length
    }))
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#6D3FC8]" />
              Calendrier de contenu unifié
            </CardTitle>
            <CardDescription>
              Planifiez, générez et publiez vos contenus avec l'aide de l'IA
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasAICalendar ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAISuggestions(true)}
                  disabled={generatingCalendar}
                >
                  {generatingCalendar ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Régénérer IA
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Options de régénération</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRegenerateAllContent(false)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Régénérer tout (remplacer)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegenerateAllContent(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Régénérer tout (garder existant)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      const suggestedItems = contentItems.filter(item => item.status === "suggested");
                      setSelectedItems(suggestedItems.map(item => item.id));
                      setShowBulkGenerateDialog(true);
                    }}>
                      <Zap className="w-4 h-4 mr-2" />
                      Générer tous les suggérés
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAISuggestions(false)}
                disabled={generatingCalendar}
              >
                {generatingCalendar ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Suggestions IA
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                setShowAddDialog(true);
              }}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contenu
            </Button>
          </div>
        </div>
        
        {/* Indicateur de personnalisation */}
        {hasAICalendar && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">
                    Calendrier IA actif et sauvegardé
                  </p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    {stats.suggested} suggestions personnalisées basées sur vos analyses
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white">
                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                Sauvegardé
              </Badge>
            </div>
          </div>
        )}
        
        {/* Alerte si pas d'analyses disponibles */}
        {!marketAnalysis && !hasAICalendar && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Analyses de marché non disponibles
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Générez d'abord vos analyses pour des suggestions personnalisées
              </p>
            </div>
          </div>
        )}
        
        {/* Stats rapides */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-[#1E1E1E]">{stats.total}</div>
            <div className="text-xs text-[#666666]">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{stats.published}</div>
            <div className="text-xs text-green-600">Publiés</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{stats.scheduled}</div>
            <div className="text-xs text-yellow-600">Planifiés</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{stats.suggested}</div>
            <div className="text-xs text-purple-600">Suggérés</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.generated}</div>
            <div className="text-xs text-blue-600">Générés</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-xs text-gray-600">Brouillons</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
            {/* Navigation du mois */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#1E1E1E]">
                  {format(currentDate, "MMMM yyyy", { locale: fr })}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
                        "min-h-[120px] border-r border-b p-2 cursor-pointer hover:bg-gray-50 transition-colors",
                        isTodayDate && "bg-blue-50"
                      )}
                      onClick={() => {
                        setSelectedDate(day);
                        setShowAddDialog(true);
                      }}
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
                        {dayContent.slice(0, 3).map((item) => {
                          const config = contentTypeConfig[item.type] || contentTypeConfig.article;
                          const Icon = config.icon;
                          
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "text-xs p-1 rounded flex items-center gap-1 truncate cursor-pointer transition-all",
                                config.color,
                                item.status === "generating" && "animate-pulse ring-2 ring-[#6D3FC8] ring-opacity-50"
                              )}
                              title={item.title}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewContent(item);
                              }}
                            >
                              {item.agent_emoji && <span className="text-xs">{item.agent_emoji}</span>}
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                              {item.ai_generated && <Sparkles className="w-3 h-3 ml-auto" />}
                              {item.status === "generating" && (
                                <Loader2 className="w-3 h-3 ml-auto animate-spin text-[#6D3FC8]" />
                              )}
                              {item.status === "generated" && (
                                <CheckCircle className="w-3 h-3 ml-auto text-green-600" />
                              )}
                            </div>
                          );
                        })}
                        {dayContent.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayContent.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </CardContent>

      {/* Dialog Ajouter/Éditer contenu */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier le contenu" : "Ajouter du contenu"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Modifiez les détails de votre contenu"
                : `Planifiez un nouveau contenu pour le ${selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Générer une suggestion IA pour le formulaire
                  const suggestion = generatePersonalizedTitle("article", "innovation", businessName, businessIndustry);
                  setFormData({
                    ...formData,
                    title: suggestion,
                    description: "Article généré par l'IA sur les dernières tendances",
                    type: "article",
                    platform: ["website", "linkedin"],
                  });
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Suggestion IA
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Article sur les tendances 2024"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type de contenu</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ContentItem["type"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="social">Post social</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ad">Publicité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le contenu..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Heure de publication</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Plateformes</Label>
                <Select 
                  value={formData.platform[0] || ""} 
                  onValueChange={(value) => {
                    if (!formData.platform.includes(value)) {
                      setFormData({ ...formData, platform: [...formData.platform, value] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.platform.map((p) => (
                    <Badge 
                      key={p} 
                      variant="secondary" 
                      className="text-xs cursor-pointer"
                      onClick={() => setFormData({ 
                        ...formData, 
                        platform: formData.platform.filter(pl => pl !== p) 
                      })}
                    >
                      {platformOptions.find(opt => opt.value === p)?.label} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Rédigez votre contenu ici..."
                rows={6}
              />
            </div>
            
            {(formData.type === "image" || formData.type === "social" || formData.type === "article" || formData.type === "ad" || formData.type === "video") && (
              <div className="grid gap-3 p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="imagePrompt" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Générer une image avec Stable Diffusion
                  </Label>
                  <span className="text-xs text-gray-600">
                    {imageQuota.quota > 0 ? (
                      <span className={imageQuota.remaining > 0 ? "text-green-600" : "text-red-600"}>
                        {imageQuota.remaining}/{imageQuota.quota} restantes ce mois
                      </span>
                    ) : (
                      <span className="text-orange-600">Plan Creator requis (29€/mois = 50 images)</span>
                    )}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="imagePrompt"
                    value={formData.imagePrompt}
                    onChange={(e) => setFormData({ ...formData, imagePrompt: e.target.value })}
                    placeholder="Décrivez l'image (ou laissez vide pour auto-générer depuis le titre)"
                  />
                  <Button
                    size="sm"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || (imageQuota.quota > 0 && imageQuota.remaining <= 0)}
                  >
                    {generatingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {generatedImageUrl && (
                  <div className="mt-2 border rounded-lg overflow-hidden bg-white">
                    <img
                      src={generatedImageUrl}
                      alt="Image générée"
                      className="w-full h-auto"
                    />
                    <div className="p-2 text-xs text-center text-gray-600">
                      Image générée avec succès ✓
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setEditingItem(null);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button onClick={editingItem ? handleUpdateContent : handleAddContent} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Mettre à jour" : "Ajouter au calendrier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Aperçu du contenu */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewItem?.agent_emoji && <span className="text-2xl">{previewItem.agent_emoji}</span>}
              {previewItem?.title}
            </DialogTitle>
            <DialogDescription>
              {previewItem && format(new Date(previewItem.date), "d MMMM yyyy", { locale: fr })} • 
              {previewItem?.agent && ` Créé par ${previewItem.agent}`}
            </DialogDescription>
          </DialogHeader>
          
          {previewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type de contenu:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const config = contentTypeConfig[previewItem.type] || contentTypeConfig.article;
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
                  <span className="text-gray-600">Statut:</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(previewItem.status)}>
                      {getStatusLabel(previewItem.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {previewItem.platform && previewItem.platform.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Plateformes:</span>
                  <div className="flex gap-2 mt-1">
                    {previewItem.platform.map(platform => {
                      const Icon = platformIcons[platform as keyof typeof platformIcons];
                      return Icon ? (
                        <div key={platform} className="p-2 bg-gray-100 rounded">
                          <Icon className="w-4 h-4" />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {previewItem.description && (
                <div>
                  <span className="text-sm text-gray-600">Description:</span>
                  <p className="mt-1 text-sm">{previewItem.description}</p>
                </div>
              )}
              
              {previewItem.content && (
                <div className="overflow-hidden">
                  <span className="text-sm text-gray-600">Contenu:</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-y-auto max-h-96">
                    <div className="markdown-content max-w-full">
                      <ReactMarkdown
                        components={{
                          h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6 break-words">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-5 break-words">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 break-words">{children}</h3>,
                          p: ({children}) => <p className="mb-3 text-gray-700 break-words">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>,
                          li: ({children}) => <li className="text-gray-700 break-words">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 break-words">{children}</blockquote>,
                          code: ({inline, children}) => 
                            inline 
                              ? <code className="bg-gray-200 px-1 rounded text-sm break-all">{children}</code>
                              : <pre className="bg-gray-200 p-3 rounded overflow-x-auto my-3 text-sm"><code className="break-all">{children}</code></pre>,
                          hr: () => <hr className="my-4 border-gray-300" />,
                          a: ({children, href}) => <a href={href} className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">{children}</a>,
                        }}
                      >
                        {previewItem.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {previewItem.imageUrl && (
                <div>
                  <span className="text-sm text-gray-600">Image:</span>
                  <img 
                    src={previewItem.imageUrl} 
                    alt="Aperçu" 
                    className="mt-2 rounded-lg max-w-full"
                  />
                </div>
              )}
              
              {previewItem.performance && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Performance estimée</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Portée:</span>
                      <p className="font-semibold">{previewItem.performance.estimatedReach?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Engagement:</span>
                      <p className="font-semibold">{previewItem.performance.estimatedEngagement}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Fermer
            </Button>
            {(previewItem?.status === "suggested" || previewItem?.status === "scheduled" || previewItem?.status === "draft") && (
              <Button
                onClick={() => {
                  handleGenerateSingleContent(previewItem);
                  setShowPreviewDialog(false);
                }}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Générer le contenu
              </Button>
            )}
            {previewItem?.status === "generated" && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleGenerateSingleContent(previewItem);
                    setShowPreviewDialog(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer
                </Button>
                <Button 
                  onClick={() => {
                    handlePublishContent(previewItem);
                    setShowPreviewDialog(false);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publier maintenant
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Génération en masse */}
      <Dialog open={showBulkGenerateDialog} onOpenChange={setShowBulkGenerateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Génération en masse</DialogTitle>
            <DialogDescription>
              Générer {selectedItems.length} contenus automatiquement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Les contenus suivants seront générés par l'IA en fonction de vos analyses de marché et de votre stratégie marketing :
            </p>
            
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {selectedItems.map(itemId => {
                  const item = contentItems.find(c => c.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <div key={itemId} className="flex items-center gap-2 text-sm">
                      {item.agent_emoji && <span>{item.agent_emoji}</span>}
                      <span className="truncate">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                La génération peut prendre quelques minutes selon le nombre de contenus.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkGenerateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleGenerateBulkContent}
              disabled={loading}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Lancer la génération
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Fonctions utilitaires
function getStatusColor(status: string): string {
  switch (status) {
    case "published": return "bg-green-100 text-green-800";
    case "scheduled": return "bg-yellow-100 text-yellow-800";
    case "draft": return "bg-gray-100 text-gray-800";
    case "suggested": return "bg-purple-100 text-purple-800";
    case "approved": return "bg-blue-100 text-blue-800";
    case "generating": return "bg-orange-100 text-orange-800";
    case "generated": return "bg-teal-100 text-teal-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "published": return "Publié";
    case "scheduled": return "Planifié";
    case "draft": return "Brouillon";
    case "suggested": return "Suggéré par l'IA";
    case "approved": return "Approuvé";
    case "generating": return "En génération";
    case "generated": return "Généré";
    default: return status;
  }
}