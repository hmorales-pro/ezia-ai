"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ContentCalendarProps {
  projectId: string;
  onArticleCreated: () => void;
}

interface CalendarArticle {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
}

interface AITopicSuggestion {
  title: string;
  keywords: string[];
  description: string;
}

export function ContentCalendar({ projectId, onArticleCreated }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [articles, setArticles] = useState<CalendarArticle[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AITopicSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Formulaire de planification
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    tone: 'professional',
    length: 'medium' as 'short' | 'medium' | 'long',
    keywords: [] as string[],
    keywordInput: ''
  });

  useEffect(() => {
    loadArticles();
  }, [projectId, currentMonth]);

  const loadArticles = async () => {
    try {
      const response = await api.get(`/api/projects/${projectId}/blog`);
      if (response.data.success) {
        setArticles(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      // Simuler des suggestions AI (à remplacer par vraie API)
      const mockSuggestions: AITopicSuggestion[] = [
        {
          title: "Les tendances de votre secteur en 2025",
          keywords: ["tendances", "innovation", "2025"],
          description: "Analyse des principales évolutions à suivre"
        },
        {
          title: "Guide complet pour débutants",
          keywords: ["guide", "tutoriel", "débutant"],
          description: "Un guide pas à pas pour vos clients"
        },
        {
          title: "Comment optimiser vos résultats",
          keywords: ["optimisation", "performance", "résultats"],
          description: "Conseils pratiques et actionnables"
        },
        {
          title: "Interview d'expert : Les meilleurs conseils",
          keywords: ["expert", "conseils", "interview"],
          description: "Partage d'expertise du secteur"
        },
        {
          title: "Étude de cas : Un succès client",
          keywords: ["cas client", "succès", "résultats"],
          description: "Exemple concret de réussite"
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      toast.error('Erreur lors du chargement des suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerateAndSchedule = async () => {
    if (!selectedDate || !scheduleForm.title.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setIsGenerating(true);

      // Générer l'article avec l'AI
      const response = await api.post(`/api/projects/${projectId}/blog`, {
        aiGenerate: true,
        title: scheduleForm.title,
        keywords: scheduleForm.keywords,
        tone: scheduleForm.tone,
        length: scheduleForm.length,
        status: 'scheduled',
        scheduledAt: selectedDate.toISOString()
      });

      if (response.data.success) {
        toast.success('Article généré et programmé avec succès !');
        setShowScheduleDialog(false);
        resetForm();
        loadArticles();
        onArticleCreated();
      }
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error?.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setScheduleForm({
      title: '',
      tone: 'professional',
      length: 'medium',
      keywords: [],
      keywordInput: ''
    });
    setSelectedDate(null);
  };

  const addKeyword = () => {
    if (scheduleForm.keywordInput.trim() && !scheduleForm.keywords.includes(scheduleForm.keywordInput.trim())) {
      setScheduleForm({
        ...scheduleForm,
        keywords: [...scheduleForm.keywords, scheduleForm.keywordInput.trim()],
        keywordInput: ''
      });
    }
  };

  const useSuggestion = (suggestion: AITopicSuggestion) => {
    setScheduleForm({
      ...scheduleForm,
      title: suggestion.title,
      keywords: suggestion.keywords
    });
    setShowSuggestions(false);
  };

  // Générer les jours du calendrier
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getArticlesForDate = (date: Date | null) => {
    if (!date) return [];

    return articles.filter(article => {
      const articleDate = article.scheduledAt
        ? new Date(article.scheduledAt)
        : article.publishedAt
        ? new Date(article.publishedAt)
        : null;

      if (!articleDate) return false;

      return (
        articleDate.getDate() === date.getDate() &&
        articleDate.getMonth() === date.getMonth() &&
        articleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendrier de Contenu
            </CardTitle>
            <Button onClick={loadAISuggestions} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Idées d'articles AI
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Suggestions AI */}
      {showSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggestions de Sujets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                    onClick={() => useSuggestion(suggestion)}
                  >
                    <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendrier */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold capitalize">{monthName}</h3>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayArticles = date ? getArticlesForDate(date) : [];
              const isToday = date &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] border rounded-lg p-2 transition-colors",
                    date ? "hover:border-purple-300 cursor-pointer bg-white" : "bg-gray-50",
                    isToday && "border-purple-500 bg-purple-50"
                  )}
                  onClick={() => {
                    if (date) {
                      setSelectedDate(date);
                      setShowScheduleDialog(true);
                    }
                  }}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          isToday ? "text-purple-600" : "text-gray-700"
                        )}>
                          {date.getDate()}
                        </span>
                        {dayArticles.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayArticles.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayArticles.slice(0, 2).map((article) => (
                          <div
                            key={article._id}
                            className="text-xs p-1 rounded bg-purple-100 text-purple-800 truncate"
                          >
                            <div className="flex items-center gap-1">
                              {article.status === 'published' && <CheckCircle className="w-3 h-3" />}
                              {article.status === 'scheduled' && <Clock className="w-3 h-3" />}
                              <span className="truncate">{article.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayArticles.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayArticles.length - 2} autre{dayArticles.length - 2 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de planification */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Planifier un Article pour le {selectedDate?.toLocaleDateString('fr-FR')}
            </DialogTitle>
            <DialogDescription>
              L'IA générera automatiquement un article optimisé selon vos paramètres
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-title">Sujet de l'article *</Label>
              <Input
                id="schedule-title"
                placeholder="Ex: Les tendances du secteur en 2025"
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mots-clés</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un mot-clé"
                  value={scheduleForm.keywordInput}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, keywordInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {scheduleForm.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {scheduleForm.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                      <button
                        onClick={() => setScheduleForm({
                          ...scheduleForm,
                          keywords: scheduleForm.keywords.filter(k => k !== keyword)
                        })}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ton</Label>
                <Select value={scheduleForm.tone} onValueChange={(v) => setScheduleForm({ ...scheduleForm, tone: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="casual">Décontracté</SelectItem>
                    <SelectItem value="friendly">Amical</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="educational">Éducatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Longueur</Label>
                <Select value={scheduleForm.length} onValueChange={(v: any) => setScheduleForm({ ...scheduleForm, length: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Court (300-500 mots)</SelectItem>
                    <SelectItem value="medium">Moyen (500-800 mots)</SelectItem>
                    <SelectItem value="long">Long (800-1200 mots)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerateAndSchedule} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer & Planifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
