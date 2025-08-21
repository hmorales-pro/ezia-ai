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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, Plus, FileText, Video, Image, Hash, Loader2, Edit, Trash2, Clock, CheckCircle, AlertCircle, Sparkles, TrendingUp, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: "article" | "video" | "image" | "social";
  status: "draft" | "scheduled" | "published";
  platform?: string[];
  description?: string;
  time?: string;
  tags?: string[];
  ai_generated?: boolean;
  performance?: {
    views?: number;
    engagement?: number;
    clicks?: number;
  };
}

interface ContentCalendarProps {
  businessId: string;
  businessName?: string;
  businessIndustry?: string;
}

const contentTypeIcons = {
  article: FileText,
  video: Video,
  image: Image,
  social: Hash,
};

const contentTypeColors = {
  article: "bg-blue-100 text-blue-800",
  video: "bg-purple-100 text-purple-800",
  image: "bg-green-100 text-green-800",
  social: "bg-orange-100 text-orange-800",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
};

const platformOptions = [
  { value: "website", label: "Site web" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
];

// In-memory storage for content items
declare global {
  var contentItems: Record<string, ContentItem[]>;
}

if (!global.contentItems) {
  global.contentItems = {};
}

export function ContentCalendarEnhanced({ businessId, businessName, businessIndustry }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  
  const [formData, setFormData] = useState({
    title: "",
    type: "article" as ContentItem["type"],
    description: "",
    time: "09:00",
    platform: [] as string[],
    tags: [] as string[],
  });

  useEffect(() => {
    // Load content items from memory
    setContentItems(global.contentItems[businessId] || []);
  }, [businessId]);

  const saveContentItems = (items: ContentItem[]) => {
    global.contentItems[businessId] = items;
    setContentItems(items);
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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

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

  const handlePublishContent = (id: string) => {
    const updatedItems = contentItems.map(item => 
      item.id === id ? { ...item, status: "published" as const } : item
    );
    saveContentItems(updatedItems);
    toast.success("Contenu publié");
  };

  const generateAIContent = async () => {
    setGeneratingAI(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions: Partial<ContentItem>[] = [
        {
          title: `5 tendances ${businessIndustry || 'du secteur'} à suivre en ${format(selectedDate || new Date(), 'yyyy')}`,
          type: "article",
          description: "Article approfondi sur les dernières tendances et innovations dans votre domaine",
          platform: ["website", "linkedin"],
          tags: ["tendances", "innovation", businessIndustry || "business"],
        },
        {
          title: `Découvrez comment ${businessName || 'nous'} révolutionne ${businessIndustry || 'le secteur'}`,
          type: "video",
          description: "Vidéo de présentation de vos services et de votre valeur ajoutée",
          platform: ["youtube", "facebook"],
          tags: ["présentation", "services", "innovation"],
        },
        {
          title: `Conseil du jour : optimisez votre ${businessIndustry || 'activité'}`,
          type: "social",
          description: "Post court avec un conseil pratique pour votre audience",
          platform: ["twitter", "linkedin"],
          tags: ["conseil", "tips", "productivité"],
        },
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setFormData({
        title: randomSuggestion.title || "",
        type: randomSuggestion.type || "article",
        description: randomSuggestion.description || "",
        time: "09:00",
        platform: randomSuggestion.platform || [],
        tags: randomSuggestion.tags || [],
      });

      toast.success("Suggestion de contenu générée par l'IA");
    } catch (error) {
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setGeneratingAI(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "article",
      description: "",
      time: "09:00",
      platform: [],
      tags: [],
    });
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
    });
    setShowEditDialog(true);
  };

  // Stats for the header
  const stats = {
    total: contentItems.length,
    published: contentItems.filter(i => i.status === "published").length,
    scheduled: contentItems.filter(i => i.status === "scheduled").length,
    draft: contentItems.filter(i => i.status === "draft").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendrier de contenu</CardTitle>
            <CardDescription>
              Planifiez et gérez vos publications avec l'aide de l'IA
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}
            >
              {viewMode === "calendar" ? "Vue liste" : "Vue calendrier"}
            </Button>
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
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-[#1E1E1E]">{stats.total}</div>
            <div className="text-xs text-[#666666]">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-xs text-green-600">Publiés</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
            <div className="text-xs text-yellow-600">Planifiés</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-xs text-gray-600">Brouillons</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === "calendar" ? (
          <div className="space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
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
                  onClick={handleToday}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for alignment */}
                {emptyCells.map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[120px] border-r border-b bg-gray-50" />
                ))}
                
                {/* Actual days */}
                {days.map((day) => {
                  const dayContent = getContentForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[120px] border-r border-b p-2 cursor-pointer hover:bg-gray-50 transition-colors",
                        !isCurrentMonth && "bg-gray-50 text-gray-400",
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
                      
                      {/* Content items preview */}
                      <div className="space-y-1">
                        {dayContent.slice(0, 3).map((item) => {
                          const Icon = contentTypeIcons[item.type];
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "text-xs p-1 rounded flex items-center gap-1 truncate cursor-pointer",
                                contentTypeColors[item.type]
                              )}
                              title={item.title}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(item);
                              }}
                            >
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                              {item.ai_generated && <Sparkles className="w-3 h-3 ml-auto" />}
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
        ) : (
          /* List View */
          <div className="space-y-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="published">Publiés</TabsTrigger>
                <TabsTrigger value="scheduled">Planifiés</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
              </TabsList>
              
              {["all", "published", "scheduled", "draft"].map((status) => (
                <TabsContent key={status} value={status} className="space-y-2">
                  {contentItems
                    .filter(item => status === "all" || item.status === status)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item) => {
                      const Icon = contentTypeIcons[item.type];
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                          <Icon className="w-6 h-6 text-gray-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{item.title}</h4>
                              {item.ai_generated && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(item.date), "d MMM yyyy", { locale: fr })}
                              </span>
                              {item.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.time}
                                </span>
                              )}
                              <Badge className={cn("text-xs", statusColors[item.status])}>
                                {item.status === "published" ? "Publié" : item.status === "scheduled" ? "Planifié" : "Brouillon"}
                              </Badge>
                              {item.platform?.map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePublishContent(item.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteContent(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>

      {/* Add Content Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter du contenu</DialogTitle>
            <DialogDescription>
              Planifiez un nouveau contenu pour le {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={generateAIContent}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
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
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((platform) => (
                  <label key={platform.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platform.includes(platform.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, platform: [...formData.platform, platform.value] });
                        } else {
                          setFormData({ ...formData, platform: formData.platform.filter(p => p !== platform.value) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddContent} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter au calendrier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le contenu</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre contenu
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type de contenu</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ContentItem["type"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="social">Post social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-time">Heure de publication</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Plateformes</Label>
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((platform) => (
                  <label key={platform.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platform.includes(platform.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, platform: [...formData.platform, platform.value] });
                        } else {
                          setFormData({ ...formData, platform: formData.platform.filter(p => p !== platform.value) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateContent} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}