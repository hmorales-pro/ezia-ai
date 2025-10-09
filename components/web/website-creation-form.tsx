"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, Globe, Palette, FileText } from "lucide-react";
import { toast } from "sonner";

interface Business {
  _id: string;
  businessId: string;
  userId: string;
  name: string;
  industry?: string;
  description?: string;
  stage?: string;
  targetAudience?: any;
  valueProposition?: string;
}

interface WebsiteCreationFormProps {
  businessId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function WebsiteCreationForm({ businessId, onSuccess, onCancel }: WebsiteCreationFormProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    style: 'modern' as 'modern' | 'minimal' | 'creative' | 'professional',
    colorScheme: 'purple' as 'purple' | 'blue' | 'green' | 'custom',
    features: {
      website: true,
      blog: true,
      shop: false,
      newsletter: false
    }
  });

  const [generationProgress, setGenerationProgress] = useState({
    phase: '',
    message: '',
    progress: 0
  });

  useEffect(() => {
    fetchBusinessAndPrefill();
  }, [businessId]);

  const fetchBusinessAndPrefill = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/me/business/${businessId}/simple`);

      if (response.data.success) {
        const businessData = response.data.business;

        // Normaliser le userId (peut être userId ou user_id selon l'API)
        const normalizedBusiness = {
          ...businessData,
          userId: businessData.userId || businessData.user_id || ''
        };

        setBusiness(normalizedBusiness);

        // Préremplir le formulaire avec les données du business
        setFormData(prev => ({
          ...prev,
          name: businessData.name || '',
          description: generateDescriptionFromBusiness(businessData),
          industry: businessData.industry || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Erreur lors du chargement des informations du business');
    } finally {
      setLoading(false);
    }
  };

  const generateDescriptionFromBusiness = (business: Business): string => {
    const parts = [];

    if (business.description) {
      parts.push(business.description);
    }

    if (business.valueProposition) {
      parts.push(`Notre proposition de valeur : ${business.valueProposition}`);
    }

    if (business.stage) {
      const stageLabels: Record<string, string> = {
        'idea': 'En phase d\'idéation',
        'mvp': 'En développement MVP',
        'launch': 'En phase de lancement',
        'growth': 'En croissance',
        'scale': 'En phase d\'expansion'
      };
      parts.push(`Stade actuel : ${stageLabels[business.stage] || business.stage}`);
    }

    return parts.join('. ');
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setStep('generating');
      setGenerationProgress({ phase: 'Initialisation...', message: 'Préparation de la génération', progress: 10 });

      // Récupérer le userId (depuis business ou depuis l'utilisateur connecté)
      let userId = business?.userId;

      if (!userId) {
        // Fallback: récupérer depuis l'utilisateur connecté
        try {
          const meResponse = await api.get('/api/me-simple');
          if (meResponse.data?.user?._id) {
            userId = meResponse.data.user._id;
          }
        } catch (meError) {
          console.error('Error fetching user:', meError);
        }
      }

      if (!userId) {
        toast.error('Impossible de récupérer vos informations utilisateur');
        throw new Error('UserId non disponible');
      }

      const createResponse = await api.post(`/api/web-projects/${businessId}`, {
        name: formData.name,
        description: formData.description,
        userId: userId,
        features: formData.features
      });

      if (!createResponse.data.success) {
        throw new Error(createResponse.data.error || 'Erreur lors de la création du projet');
      }

      const projectId = createResponse.data.webProject.projectId;

      setGenerationProgress({ phase: 'Architecture', message: 'Ezia analyse votre business...', progress: 20 });

      // Générer le site avec le système multi-agents en streaming
      const streamUrl = `/api/sites/generate-multi-agent-stream?name=${encodeURIComponent(formData.name)}&industry=${encodeURIComponent(formData.industry)}&description=${encodeURIComponent(formData.description)}&userId=${encodeURIComponent(userId)}&businessId=${encodeURIComponent(businessId)}&saveToDb=true`;

      const eventSource = new EventSource(streamUrl);

      // Mapper les phases aux pourcentages et messages
      const phaseMapping: Record<string, { label: string; message: string; progress: number }> = {
        'initialization': { label: 'Initialisation', message: 'Préparation des agents IA...', progress: 10 },
        'architecture': { label: 'Architecture', message: 'Ezia analyse votre business...', progress: 25 },
        'design': { label: 'Design', message: 'Kiko crée le système de design...', progress: 45 },
        'content': { label: 'Contenu', message: 'Milo génère le contenu personnalisé...', progress: 65 },
        'blog': { label: 'Blog', message: 'Génération des articles de blog...', progress: 80 },
        'build': { label: 'Construction', message: 'Lex assemble le site HTML/CSS...', progress: 90 }
      };

      eventSource.addEventListener('phase_start', (event) => {
        const data = JSON.parse(event.data);
        const phaseInfo = phaseMapping[data.phase] || {
          label: data.phase,
          message: data.description || 'Génération en cours...',
          progress: 50
        };

        setGenerationProgress({
          phase: phaseInfo.label,
          message: phaseInfo.message,
          progress: phaseInfo.progress
        });
      });

      eventSource.addEventListener('phase_complete', (event) => {
        const data = JSON.parse(event.data);
        console.log('Phase complète:', data.phase);
      });

      eventSource.addEventListener('complete', async (event) => {
        const data = JSON.parse(event.data);
        eventSource.close();

        if (data.success) {
          setGenerationProgress({ phase: 'Terminé', message: 'Votre site est prêt !', progress: 100 });
          setStep('success');

          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else {
          throw new Error('Erreur lors de la génération');
        }
      });

      eventSource.addEventListener('error', (event) => {
        eventSource.close();
        const data = JSON.parse(event.data);
        throw new Error(data.message || 'Erreur lors de la génération du site');
      });

      eventSource.onerror = () => {
        eventSource.close();
        throw new Error('Connexion perdue avec le serveur de génération');
      };

    } catch (error: any) {
      console.error('Error generating website:', error);
      toast.error(error?.message || 'Erreur lors de la génération du site');
      setGenerating(false);
      setStep('form');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6D3FC8]" />
          <p className="text-[#666666]">Chargement des informations...</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'generating') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">{generationProgress.phase}</h3>
          <p className="text-[#666666] mb-6">{generationProgress.message}</p>

          <div className="max-w-md mx-auto">
            <div className="w-full bg-[#E0E0E0] rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] h-2 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress.progress}%` }}
              />
            </div>
            <p className="text-sm text-[#666666]">{generationProgress.progress}%</p>
          </div>

          <div className="mt-8 text-sm text-[#666666]">
            <p>Nos agents IA travaillent pour vous :</p>
            <div className="flex justify-center gap-4 mt-4">
              <Badge variant="secondary">🏗️ Site Architect</Badge>
              <Badge variant="secondary">🎨 Kiko Design</Badge>
              <Badge variant="secondary">✍️ Milo Copywriter</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2">Site créé avec succès !</h3>
          <p className="text-[#666666]">Redirection en cours...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
            Créer mon site web avec Ezia
          </CardTitle>
          <CardDescription>
            Ezia a prérempli les informations d'après votre business. Vous pouvez les ajuster si nécessaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du site *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mon Site Web"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industrie *</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Ex: Restauration, E-commerce, Services..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description du site</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre activité, vos services, votre proposition de valeur..."
                rows={4}
              />
              <p className="text-xs text-[#666666] mt-1">
                💡 Prérempli par Ezia d'après vos informations business
              </p>
            </div>
          </div>

          {/* Style visuel */}
          <div className="space-y-3">
            <Label>Style visuel</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'modern', label: 'Moderne', icon: '🚀' },
                { value: 'minimal', label: 'Minimaliste', icon: '⚡' },
                { value: 'creative', label: 'Créatif', icon: '🎨' },
                { value: 'professional', label: 'Professionnel', icon: '💼' }
              ].map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, style: style.value as any })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.style === style.value
                      ? 'border-[#6D3FC8] bg-purple-50'
                      : 'border-[#E0E0E0] hover:border-[#6D3FC8]'
                  }`}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="text-sm font-medium">{style.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Palette de couleurs */}
          <div className="space-y-3">
            <Label>Palette de couleurs</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'purple', label: 'Violet', colors: ['#6D3FC8', '#8B5CF6'] },
                { value: 'blue', label: 'Bleu', colors: ['#3B82F6', '#60A5FA'] },
                { value: 'green', label: 'Vert', colors: ['#10B981', '#34D399'] },
                { value: 'custom', label: 'Personnalisé', colors: ['#1E1E1E', '#666666'] }
              ].map((scheme) => (
                <button
                  key={scheme.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorScheme: scheme.value as any })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.colorScheme === scheme.value
                      ? 'border-[#6D3FC8] bg-purple-50'
                      : 'border-[#E0E0E0] hover:border-[#6D3FC8]'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {scheme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium">{scheme.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-3">
            <Label>Fonctionnalités à activer</Label>
            <div className="space-y-2">
              {[
                { key: 'website', label: 'Site Web', icon: Globe, required: true },
                { key: 'blog', label: 'Blog', icon: FileText },
                { key: 'shop', label: 'Boutique en ligne (bientôt)', icon: Palette, disabled: true },
              ].map((feature) => (
                <label
                  key={feature.key}
                  className={`flex items-center gap-3 p-3 border rounded-lg ${
                    feature.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.features[feature.key as keyof typeof formData.features]}
                    onChange={(e) => !feature.disabled && !feature.required && setFormData({
                      ...formData,
                      features: { ...formData.features, [feature.key]: e.target.checked }
                    })}
                    disabled={feature.disabled || feature.required}
                    className="w-4 h-4"
                  />
                  <feature.icon className="w-5 h-5 text-[#666666]" />
                  <span className="font-medium">{feature.label}</span>
                  {feature.required && (
                    <Badge variant="secondary" className="ml-auto">Requis</Badge>
                  )}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={generating}>
            Annuler
          </Button>
        )}
        <Button
          onClick={handleGenerate}
          disabled={!formData.name || !formData.industry || generating}
          className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer mon site avec Ezia
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
