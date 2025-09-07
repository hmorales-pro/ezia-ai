"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Save, 
  Eye,
  Hash,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

interface BlogEditorProps {
  businessId: string;
  businessInfo: {
    name: string;
    description: string;
    industry: string;
  };
}

export default function BlogEditor({ businessId, businessInfo }: BlogEditorProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [editedContent, setEditedContent] = useState('');
  const { toast } = useToast();

  // Charger les suggestions au montage
  useEffect(() => {
    loadSuggestions();
  }, [businessId]);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/me/business/${businessId}/generate-blog`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!topic.trim()) {
      toast({
        title: "Sujet requis",
        description: "Veuillez entrer un sujet pour votre article",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/me/business/${businessId}/generate-blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
          keywords,
          businessInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPost(data.blogPost);
        setEditedContent(data.blogPost.content);
        setActiveTab('preview');
        toast({
          title: "Article généré !",
          description: "Votre article de blog a été créé avec succès",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible de générer l'article",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSaveBlog = async () => {
    if (!generatedPost) return;

    // Pour l'instant, on affiche juste un message de succès
    // Plus tard, on pourra sauvegarder dans la base de données
    toast({
      title: "Article sauvegardé !",
      description: "Votre article a été enregistré dans vos brouillons",
    });
  };

  const handlePublishBlog = async () => {
    if (!generatedPost) return;

    // Pour l'instant, on affiche juste un message
    // Plus tard, on pourra publier sur le site web du business
    toast({
      title: "Article publié !",
      description: "Votre article est maintenant visible sur votre site",
    });
  };

  const getLengthLabel = (length: string) => {
    const labels = {
      short: '500 mots',
      medium: '1000 mots',
      long: '2000 mots'
    };
    return labels[length as keyof typeof labels] || length;
  };

  const getToneLabel = (tone: string) => {
    const labels = {
      professional: 'Professionnel',
      casual: 'Décontracté',
      technical: 'Technique'
    };
    return labels[tone as keyof typeof labels] || tone;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur d'articles de blog
          </CardTitle>
          <CardDescription>
            Créez du contenu engageant pour votre blog d'entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">
                <Sparkles className="h-4 w-4 mr-2" />
                Générer
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedPost}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={!generatedPost}>
                <FileText className="h-4 w-4 mr-2" />
                Éditer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Suggestions de sujets
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        onClick={() => setTopic(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sujet */}
              <div className="space-y-2">
                <Label htmlFor="topic">Sujet de l'article</Label>
                <Input
                  id="topic"
                  placeholder="Ex: Les meilleures pratiques pour fidéliser vos clients"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Paramètres */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tone">Ton</Label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Professionnel
                        </div>
                      </SelectItem>
                      <SelectItem value="casual">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Décontracté
                        </div>
                      </SelectItem>
                      <SelectItem value="technical">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Technique
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Longueur</Label>
                  <Select value={length} onValueChange={(value: any) => setLength(value)}>
                    <SelectTrigger id="length">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Court (500 mots)
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Moyen (1000 mots)
                        </div>
                      </SelectItem>
                      <SelectItem value="long">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Long (2000 mots)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mots-clés */}
              <div className="space-y-2">
                <Label htmlFor="keywords">Mots-clés (optionnel)</Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    placeholder="Ajouter un mot-clé..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button 
                    onClick={handleAddKeyword}
                    size="icon"
                    variant="outline"
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton de génération */}
              <Button 
                onClick={handleGenerateBlog} 
                disabled={isGenerating || !topic.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer l'article
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              {generatedPost && (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold mb-2">{generatedPost.title}</h2>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{getToneLabel(tone)}</Badge>
                      <Badge variant="outline">{getLengthLabel(length)}</Badge>
                      {generatedPost.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{generatedPost.content}</ReactMarkdown>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setActiveTab('edit')} variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Éditer
                    </Button>
                    <Button onClick={handleSaveBlog} variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </Button>
                    <Button onClick={handlePublishBlog}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publier
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="mt-4">
              {generatedPost && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input 
                      value={generatedPost.title}
                      onChange={(e) => setGeneratedPost({...generatedPost, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu</Label>
                    <Textarea 
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setGeneratedPost({...generatedPost, content: editedContent});
                        setActiveTab('preview');
                        toast({
                          title: "Modifications appliquées",
                          description: "Vos changements ont été enregistrés"
                        });
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Appliquer les modifications
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('preview')}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}