"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Save,
  Sparkles,
  Eye,
  ArrowLeft,
  CheckCircle,
  Loader2,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BlogPost {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  tags: string[];
  keywords: string[];
  tone: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  aiGenerated?: boolean;
}

interface BlogEditorProps {
  projectId: string;
  post?: BlogPost | null;
  onBack: () => void;
  onSaved: () => void;
}

export function BlogEditor({ projectId, post, onBack, onSaved }: BlogEditorProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>(post ? 'manual' : 'ai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('content');

  // Données du formulaire
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: [],
    keywords: [],
    tone: 'professional',
    ...post
  });

  // Champs AI
  const [aiSubject, setAiSubject] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [aiTone, setAiTone] = useState('professional');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [keywordInput, setKeywordInput] = useState('');

  // Tag input
  const [tagInput, setTagInput] = useState('');

  const handleGenerateWithAI = async () => {
    if (!aiSubject.trim()) {
      toast.error('Veuillez entrer un sujet');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await api.post(`/api/projects/${projectId}/blog`, {
        aiGenerate: true,
        title: aiSubject,
        keywords: aiKeywords,
        tone: aiTone,
        length: aiLength,
        status: 'draft'
      });

      if (response.data.success) {
        const generatedPost = response.data.post;
        setFormData({
          title: generatedPost.title,
          excerpt: generatedPost.excerpt,
          content: generatedPost.content,
          status: 'draft',
          tags: generatedPost.tags || [],
          keywords: generatedPost.keywords || [],
          tone: generatedPost.tone || 'professional',
          slug: generatedPost.slug,
          seoTitle: generatedPost.seoTitle,
          seoDescription: generatedPost.seoDescription,
          aiGenerated: true
        });
        setMode('manual');
        setCurrentTab('content');
        toast.success('Article généré avec succès ! Vous pouvez maintenant le modifier.');
      }
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(error?.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Le contenu est requis');
      return;
    }

    try {
      setIsSaving(true);

      const dataToSave = {
        ...formData,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : formData.publishedAt
      };

      if (post && post.slug) {
        // Mise à jour
        await api.put(`/api/projects/${projectId}/blog/${post.slug}`, dataToSave);
        toast.success(`Article ${status === 'published' ? 'publié' : 'sauvegardé'} avec succès`);
      } else {
        // Création
        await api.post(`/api/projects/${projectId}/blog`, dataToSave);
        toast.success(`Article ${status === 'published' ? 'publié' : 'créé'} avec succès`);
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error?.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !aiKeywords.includes(keywordInput.trim())) {
      setAiKeywords([...aiKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setAiKeywords(aiKeywords.filter(k => k !== keyword));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {post ? 'Éditer l\'article' : 'Nouvel article'}
              </h1>
              <p className="text-sm text-gray-600">
                {mode === 'ai' ? 'Générez un article avec l\'IA' : 'Créez votre article'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Publier
            </Button>
          </div>
        </div>

        {/* Mode selector (only for new articles) */}
        {!post && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  variant={mode === 'ai' ? 'default' : 'outline'}
                  onClick={() => setMode('ai')}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer avec l'IA
                </Button>
                <Button
                  variant={mode === 'manual' ? 'default' : 'outline'}
                  onClick={() => setMode('manual')}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Créer manuellement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Generation Form */}
        {mode === 'ai' && !post && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Génération assistée par IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet de l'article *</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Les tendances du e-commerce en 2025"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Mots-clés (optionnel)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un mot-clé"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {aiKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Ton</Label>
                  <Select value={aiTone} onValueChange={setAiTone}>
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
                  <Label htmlFor="length">Longueur</Label>
                  <Select value={aiLength} onValueChange={(v: any) => setAiLength(v)}>
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

              <Button
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer l'article
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Manual Editor Form */}
        {mode === 'manual' && (
          <Card>
            <CardContent className="pt-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                </TabsList>

                {/* Tab Contenu */}
                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      placeholder="Titre de votre article"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Extrait</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Résumé court de l'article (150-200 caractères)"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.excerpt.length} caractères
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Contenu * (HTML)</Label>
                    <Textarea
                      id="content"
                      placeholder="<h2>Sous-titre</h2><p>Votre contenu ici...</p>"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      HTML supporté. {formData.content.split(' ').filter(w => w).length} mots environ
                    </p>
                  </div>
                </TabsContent>

                {/* Tab SEO */}
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">Titre SEO</Label>
                    <Input
                      id="seoTitle"
                      placeholder="Titre optimisé pour les moteurs de recherche"
                      value={formData.seoTitle || ''}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      {(formData.seoTitle || '').length}/60 caractères recommandés
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">Description SEO</Label>
                    <Textarea
                      id="seoDescription"
                      placeholder="Description pour les moteurs de recherche"
                      value={formData.seoDescription || ''}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {(formData.seoDescription || '').length}/160 caractères recommandés
                    </p>
                  </div>
                </TabsContent>

                {/* Tab Métadonnées */}
                <TabsContent value="metadata" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Auteur</Label>
                    <Input
                      id="author"
                      placeholder="Nom de l'auteur"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Ton</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(v) => setFormData({ ...formData, tone: v })}
                    >
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
