"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Globe, FileText, ShoppingBag, Users, 
  MessageSquare, Calendar, Lock, Share2, TrendingUp,
  Plus, Check, Loader2, ArrowRight, Zap, Layers
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface EcosystemFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'available' | 'active' | 'coming_soon';
  category: 'pages' | 'features' | 'integrations';
  complexity: 'simple' | 'medium' | 'advanced';
  benefits: string[];
}

interface EziaEcosystemPanelProps {
  projectId: string;
  businessId?: string;
  businessInfo?: any;
  currentSiteType: 'simple' | 'multipage';
  onFeatureAdded?: () => void;
}

const ECOSYSTEM_FEATURES: EcosystemFeature[] = [
  // Pages supplémentaires
  {
    id: 'blog',
    name: 'Blog professionnel',
    description: 'Partagez des articles et actualités pour améliorer votre SEO',
    icon: FileText,
    status: 'available',
    category: 'pages',
    complexity: 'medium',
    benefits: ['Améliore le référencement', 'Engage votre audience', 'Positionne votre expertise']
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Présentez vos réalisations et projets',
    icon: Layers,
    status: 'available',
    category: 'pages',
    complexity: 'simple',
    benefits: ['Montre votre savoir-faire', 'Rassure les prospects', 'Génère des leads']
  },
  {
    id: 'shop',
    name: 'Boutique en ligne',
    description: 'Vendez vos produits directement sur votre site',
    icon: ShoppingBag,
    status: 'available',
    category: 'pages',
    complexity: 'advanced',
    benefits: ['Nouveau canal de vente', 'Paiements sécurisés', 'Gestion des stocks']
  },
  
  // Fonctionnalités
  {
    id: 'booking',
    name: 'Système de réservation',
    description: 'Permettez à vos clients de réserver en ligne',
    icon: Calendar,
    status: 'available',
    category: 'features',
    complexity: 'medium',
    benefits: ['Automatise les réservations', 'Réduit les no-shows', 'Synchronise avec votre agenda']
  },
  {
    id: 'members',
    name: 'Espace membres',
    description: 'Créez une zone privée pour vos clients',
    icon: Lock,
    status: 'available',
    category: 'features',
    complexity: 'advanced',
    benefits: ['Fidélise vos clients', 'Contenu exclusif', 'Communauté engagée']
  },
  {
    id: 'chat',
    name: 'Chat en direct',
    description: 'Communiquez instantanément avec vos visiteurs',
    icon: MessageSquare,
    status: 'available',
    category: 'features',
    complexity: 'simple',
    benefits: ['Support immédiat', 'Augmente les conversions', 'Améliore la satisfaction']
  },
  
  // Intégrations
  {
    id: 'social',
    name: 'Réseaux sociaux',
    description: 'Intégrez vos réseaux sociaux et partagez automatiquement',
    icon: Share2,
    status: 'available',
    category: 'integrations',
    complexity: 'simple',
    benefits: ['Augmente la visibilité', 'Partage automatique', 'Widget de flux social']
  },
  {
    id: 'analytics',
    name: 'Analytics avancés',
    description: 'Comprenez votre audience et optimisez votre site',
    icon: TrendingUp,
    status: 'available',
    category: 'integrations',
    complexity: 'medium',
    benefits: ['Données détaillées', 'Rapports automatiques', 'Optimisation SEO']
  },
  {
    id: 'crm',
    name: 'CRM intégré',
    description: 'Gérez vos contacts et opportunités',
    icon: Users,
    status: 'coming_soon',
    category: 'integrations',
    complexity: 'advanced',
    benefits: ['Gestion des leads', 'Automatisation marketing', 'Suivi des ventes']
  }
];

export function EziaEcosystemPanel({
  projectId,
  businessId,
  businessInfo,
  currentSiteType,
  onFeatureAdded
}: EziaEcosystemPanelProps) {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingFeature, setIsAddingFeature] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pages' | 'features' | 'integrations'>('all');

  // Analyser les besoins au chargement
  useEffect(() => {
    if (businessInfo) {
      analyzeBusinessNeeds();
    }
  }, [businessInfo]);

  const analyzeBusinessNeeds = async () => {
    setIsAnalyzing(true);
    try {
      // Simuler une analyse d'Ezia
      const analysis = await api.post('/api/ezia/analyze-ecosystem', {
        businessInfo,
        currentFeatures: activeFeatures,
        siteType: currentSiteType
      });

      if (analysis.data.suggestions) {
        setSuggestedFeatures(analysis.data.suggestions);
      }
    } catch (error) {
      // Utiliser des suggestions par défaut
      if (businessInfo?.industry?.includes('restaurant')) {
        setSuggestedFeatures(['booking', 'social', 'blog']);
      } else if (businessInfo?.industry?.includes('commerce')) {
        setSuggestedFeatures(['shop', 'analytics', 'social']);
      } else {
        setSuggestedFeatures(['blog', 'social', 'analytics']);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addFeature = async (featureId: string) => {
    setIsAddingFeature(featureId);
    const feature = ECOSYSTEM_FEATURES.find(f => f.id === featureId);
    
    try {
      if (feature?.category === 'pages') {
        // Pour les pages, vérifier d'abord le type de projet
        if (currentSiteType === 'simple') {
          // Pour un projet simple, proposer la conversion
          toast.info("Pour ajouter des pages, vous devez d'abord convertir votre site en multipage.");
          setIsAddingFeature(null);
          // Le bouton de conversion est déjà affiché dans l'interface
          return;
        }
        
        // Pour les projets multipages, utiliser l'API multipage
        const response = await api.post(`/api/multipage/${projectId}/pages/simple`, {
          pageType: featureId,
          pageData: {
            name: feature.name,
            slug: featureId,
            title: `${feature.name} - ${businessInfo?.name || ''}`,
            description: feature.description
          }
        });

        if (response.data.ok) {
          toast.success(`${feature.name} ajouté avec succès !`);
          setActiveFeatures([...activeFeatures, featureId]);
          if (onFeatureAdded) onFeatureAdded();
        }
      } else {
        // Pour les autres fonctionnalités
        const response = await api.post(`/api/ecosystem/${projectId}/features`, {
          featureId,
          configuration: {
            businessId,
            enabled: true
          }
        });

        if (response.data.ok) {
          toast.success(`${feature?.name} activé !`);
          setActiveFeatures([...activeFeatures, featureId]);
        }
      }
    } catch (error) {
      console.error('Error adding feature:', error);
      toast.error("Erreur lors de l'ajout de la fonctionnalité");
    } finally {
      setIsAddingFeature(null);
    }
  };

  const filteredFeatures = ECOSYSTEM_FEATURES.filter(f => 
    selectedCategory === 'all' || f.category === selectedCategory
  );

  const getFeatureIcon = (feature: EcosystemFeature) => {
    const Icon = feature.icon;
    return <Icon className="w-5 h-5" />;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'default';
      case 'medium': return 'secondary';
      case 'advanced': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Écosystème de votre site
            </CardTitle>
            <CardDescription>
              Ezia vous aide à faire évoluer votre site avec de nouvelles fonctionnalités
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeBusinessNeeds}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Analyser mes besoins
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Message d'Ezia avec suggestions */}
        {suggestedFeatures.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900 mb-2">
              <strong>Suggestions d'Ezia :</strong> D'après votre activité, je recommande :
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedFeatures.map(featureId => {
                const feature = ECOSYSTEM_FEATURES.find(f => f.id === featureId);
                if (!feature) return null;
                return (
                  <Badge key={featureId} variant="secondary">
                    {getFeatureIcon(feature)}
                    <span className="ml-1">{feature.name}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtres par catégorie */}
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              Tout
            </TabsTrigger>
            <TabsTrigger value="pages" onClick={() => setSelectedCategory('pages')}>
              Pages
            </TabsTrigger>
            <TabsTrigger value="features" onClick={() => setSelectedCategory('features')}>
              Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="integrations" onClick={() => setSelectedCategory('integrations')}>
              Intégrations
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Liste des fonctionnalités */}
        <div className="space-y-3">
          {filteredFeatures.map((feature) => {
            const isActive = activeFeatures.includes(feature.id);
            const isSuggested = suggestedFeatures.includes(feature.id);
            const isLoading = isAddingFeature === feature.id;

            return (
              <div
                key={feature.id}
                className={`p-4 border rounded-lg transition-all ${
                  isActive 
                    ? 'bg-green-50 border-green-300' 
                    : isSuggested 
                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                        {getFeatureIcon(feature)}
                      </div>
                      <h4 className="font-medium">{feature.name}</h4>
                      {isSuggested && !isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Recommandé
                        </Badge>
                      )}
                      <Badge variant={getComplexityColor(feature.complexity)} className="text-xs">
                        {feature.complexity === 'simple' ? 'Facile' : 
                         feature.complexity === 'medium' ? 'Moyen' : 'Avancé'}
                      </Badge>
                      {feature.status === 'coming_soon' && (
                        <Badge variant="outline" className="text-xs">
                          Bientôt
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.benefits.map((benefit, i) => (
                        <span key={i} className="text-xs text-gray-500">
                          • {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "default"}
                    onClick={() => !isActive && feature.status === 'available' && addFeature(feature.id)}
                    disabled={isActive || isLoading || feature.status === 'coming_soon'}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Actif
                      </>
                    ) : isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : feature.status === 'coming_soon' ? (
                      'Bientôt'
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

        {/* Call to action pour passer en multipage */}
        {currentSiteType === 'simple' && activeFeatures.filter(f => {
          const feature = ECOSYSTEM_FEATURES.find(ef => ef.id === f);
          return feature?.category === 'pages';
        }).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Votre site grandit !</p>
                <p className="text-sm text-blue-700">
                  Convertissez votre site en site multipage pour une meilleure organisation
                </p>
              </div>
              <Button variant="default" size="sm">
                <ArrowRight className="w-4 h-4 mr-1" />
                Passer en multipage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}