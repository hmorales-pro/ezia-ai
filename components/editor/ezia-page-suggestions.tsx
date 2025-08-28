"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, FileText, ShoppingBag, Users, MessageSquare, 
  HelpCircle, Calendar, Camera, DollarSign, Sparkles,
  Check, Plus, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface PageSuggestion {
  type: string;
  name: string;
  slug: string;
  reason: string;
  priority: 'essential' | 'recommended' | 'optional';
  content?: {
    sections: string[];
    features: string[];
  };
}

interface EziaPageSuggestionsProps {
  projectId: string;
  businessInfo: any;
  existingPages: string[];
  onPageAdded: () => void;
}

const PAGE_ICONS: Record<string, any> = {
  accueil: Globe,
  services: ShoppingBag,
  apropos: Users,
  contact: MessageSquare,
  blog: FileText,
  portfolio: Camera,
  boutique: ShoppingBag,
  equipe: Users,
  temoignages: MessageSquare,
  faq: HelpCircle,
  evenements: Calendar,
  tarifs: DollarSign
};

export function EziaPageSuggestions({
  projectId,
  businessInfo,
  existingPages,
  onPageAdded
}: EziaPageSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PageSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingPage, setIsAddingPage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeBusiness = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/api/ezia/analyze-pages', {
        businessInfo
      });

      if (response.data.ok) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
        toast.success("Analyse terminée ! Voici mes recommandations.");
      }
    } catch (error) {
      console.error('Error analyzing business:', error);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSuggestedPage = async (suggestion: PageSuggestion) => {
    setIsAddingPage(suggestion.type);
    try {
      const response = await api.post(`/api/multipage/${projectId}/pages`, {
        pageType: suggestion.type,
        pageData: {
          name: suggestion.name,
          slug: suggestion.slug,
          title: `${suggestion.name} - ${businessInfo.name}`,
          description: suggestion.reason
        }
      });

      if (response.data.ok) {
        toast.success(`Page "${suggestion.name}" ajoutée avec succès !`);
        onPageAdded();
        
        // Retirer la suggestion de la liste
        setSuggestions(prev => prev.filter(s => s.type !== suggestion.type));
      }
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error("Erreur lors de l'ajout de la page");
    } finally {
      setIsAddingPage(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'destructive';
      case 'recommended': return 'default';
      case 'optional': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'essential': return 'Essentiel';
      case 'recommended': return 'Recommandé';
      case 'optional': return 'Optionnel';
      default: return priority;
    }
  };

  // Filtrer les suggestions pour ne pas montrer les pages déjà existantes
  const filteredSuggestions = suggestions.filter(
    s => !existingPages.includes(s.slug)
  );

  if (!showSuggestions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Assistant Ezia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Je peux analyser votre entreprise et vous suggérer les pages les plus pertinentes pour votre site.
          </p>
          <Button
            onClick={analyzeBusiness}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyser et suggérer des pages
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredSuggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Structure optimale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Votre site contient déjà toutes les pages recommandées pour votre activité !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Suggestions d'Ezia
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSuggestions(false)}
          >
            Masquer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => {
            const Icon = PAGE_ICONS[suggestion.type] || FileText;
            return (
              <div
                key={suggestion.type}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium">{suggestion.name}</h4>
                      <Badge variant={getPriorityColor(suggestion.priority)}>
                        {getPriorityLabel(suggestion.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {suggestion.reason}
                    </p>
                    {suggestion.content && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Contenu suggéré :</span>{' '}
                        {suggestion.content.sections.join(', ')}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addSuggestedPage(suggestion)}
                    disabled={isAddingPage === suggestion.type}
                  >
                    {isAddingPage === suggestion.type ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}