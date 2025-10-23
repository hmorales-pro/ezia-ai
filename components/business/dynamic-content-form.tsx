"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const platformOptions = [
  { value: "website", label: "Site web" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "email", label: "Email" },
];

// Configuration des formulaires selon le type de contenu
const contentFormConfig: Record<string, any> = {
  article: {
    titlePlaceholder: "Ex: Comment optimiser votre stratégie marketing en 2024",
    descriptionPlaceholder: "Résumé de l'article, points clés abordés...",
    contentPlaceholder: "Rédigez votre article complet ici... (introduction, développement, conclusion)",
    contentLabel: "Contenu de l'article",
    contentRows: 12,
    suggestedPlatforms: ["website", "linkedin"],
    fields: {
      showKeywords: true,
      showTone: true,
      showTargetAudience: true,
    },
    toneOptions: ["Professionnel", "Éducatif", "Inspirant", "Technique", "Conversationnel"],
    icon: "📝",
    tip: "Les articles longs (1000+ mots) performent mieux en SEO"
  },
  video: {
    titlePlaceholder: "Ex: Tutoriel : Créer votre première campagne publicitaire",
    descriptionPlaceholder: "Scénario, points clés, durée estimée...",
    contentPlaceholder: "Script de la vidéo :\n\n[INTRO] (0:00-0:15)\n- Accroche\n\n[DÉVELOPPEMENT] (0:15-2:00)\n- Point 1\n- Point 2\n\n[CONCLUSION] (2:00-2:30)\n- Call-to-action",
    contentLabel: "Script vidéo",
    contentRows: 10,
    suggestedPlatforms: ["youtube", "instagram", "facebook"],
    fields: {
      showDuration: true,
      showTone: true,
      showTargetAudience: true,
      showFormat: true,
    },
    toneOptions: ["Dynamique", "Éducatif", "Humoristique", "Professionnel", "Inspirant"],
    formatOptions: ["Courte (< 1 min)", "Moyenne (1-3 min)", "Longue (3-10 min)", "Longue format (10+ min)"],
    icon: "🎥",
    tip: "Les vidéos courtes (< 60s) génèrent plus d'engagement sur les réseaux sociaux"
  },
  social: {
    titlePlaceholder: "Ex: Lancement de notre nouvelle fonctionnalité !",
    descriptionPlaceholder: "Objectif du post, cible, message clé...",
    contentPlaceholder: "Texte du post (pensez aux emojis et hashtags) 🚀\n\n#Marketing #Business #Innovation",
    contentLabel: "Texte du post",
    contentRows: 6,
    suggestedPlatforms: ["linkedin", "instagram", "facebook", "twitter"],
    fields: {
      showHashtags: true,
      showTone: true,
      showCallToAction: true,
    },
    toneOptions: ["Engageant", "Informatif", "Inspirant", "Humoristique", "Urgence"],
    icon: "📱",
    tip: "Limitez à 3-5 hashtags pertinents pour maximiser l'engagement"
  },
  email: {
    titlePlaceholder: "Ex: Newsletter Janvier - Les tendances 2024",
    descriptionPlaceholder: "Objet de l'email, segments ciblés, objectif...",
    contentPlaceholder: "Objet : [Écrivez un objet accrocheur]\n\nPrévisualisation : [Texte visible dans la boîte de réception]\n\n---\n\nBonjour [Prénom],\n\n[Corps de l'email]\n\n[Call-to-action]\n\nCordialement,\n[Signature]",
    contentLabel: "Contenu de l'email",
    contentRows: 10,
    suggestedPlatforms: ["email"],
    fields: {
      showSubject: true,
      showPreheader: true,
      showSegment: true,
      showCallToAction: true,
    },
    icon: "📧",
    tip: "Les emails avec objets personnalisés ont 26% plus de chances d'être ouverts"
  },
  image: {
    titlePlaceholder: "Ex: Infographie : Les chiffres clés 2024",
    descriptionPlaceholder: "Type d'image, message visuel, éléments à inclure...",
    contentPlaceholder: "Description de l'image à créer :\n- Style : [moderne, minimaliste, coloré...]\n- Éléments : [texte, graphiques, icônes...]\n- Couleurs : [palette de couleurs]\n- Dimensions : [format carré, portrait, paysage...]",
    contentLabel: "Brief créatif",
    contentRows: 8,
    suggestedPlatforms: ["instagram", "facebook", "linkedin", "website"],
    fields: {
      showImageType: true,
      showDimensions: true,
      showColorScheme: true,
    },
    imageTypeOptions: ["Post simple", "Carrousel", "Story", "Infographie", "Citation", "Promotion"],
    dimensionsOptions: ["Carré (1:1)", "Portrait (4:5)", "Paysage (16:9)", "Story (9:16)"],
    icon: "🎨",
    tip: "Les images avec visages génèrent 38% plus d'engagement"
  },
  ad: {
    titlePlaceholder: "Ex: Campagne Black Friday - Réduction 30%",
    descriptionPlaceholder: "Objectif publicitaire, audience, budget...",
    contentPlaceholder: "Accroche : [Titre principal percutant]\n\nDescription : [Détails de l'offre]\n\nCall-to-action : [Bouton d'action]\n\nTexte d'annonce : [Message complet]\n\nOffre : [Détails, conditions]",
    contentLabel: "Copy publicitaire",
    contentRows: 10,
    suggestedPlatforms: ["facebook", "instagram", "linkedin"],
    fields: {
      showObjective: true,
      showBudget: true,
      showTargetAudience: true,
      showCallToAction: true,
      showDuration: true,
    },
    objectiveOptions: ["Trafic", "Conversions", "Notoriété", "Engagement", "Génération de leads"],
    icon: "📢",
    tip: "Testez toujours 3-5 variantes de copies pour optimiser les performances"
  }
};

interface DynamicContentFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function DynamicContentForm({ formData, setFormData }: DynamicContentFormProps) {
  const config = contentFormConfig[formData.type] || contentFormConfig.article;
  const charCount = formData.content?.length || 0;
  const wordCount = formData.content?.trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <>
      {/* Indication visuelle du type avec tip */}
      <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900">
            {contentFormConfig[formData.type as keyof typeof contentFormConfig]?.contentLabel || "Contenu"}
          </p>
          <p className="text-xs text-purple-700 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {config.tip}
          </p>
        </div>
      </div>

      {/* Titre */}
      <div className="grid gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={config.titlePlaceholder}
        />
      </div>

      {/* Type de contenu */}
      <div className="grid gap-2">
        <Label htmlFor="type">Type de contenu</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            // Quand on change de type, suggérer les plateformes appropriées
            const newConfig = contentFormConfig[value];
            setFormData({
              ...formData,
              type: value,
              platform: newConfig?.suggestedPlatforms || []
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="article">📝 Article</SelectItem>
            <SelectItem value="video">🎥 Vidéo</SelectItem>
            <SelectItem value="image">🎨 Image</SelectItem>
            <SelectItem value="social">📱 Post social</SelectItem>
            <SelectItem value="email">📧 Email</SelectItem>
            <SelectItem value="ad">📢 Publicité</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Description / Brief</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={config.descriptionPlaceholder}
          rows={3}
        />
      </div>

      {/* Champs conditionnels selon le type */}
      <div className="grid gap-4">
        {/* Ton */}
        {config.fields?.showTone && (
          <div className="grid gap-2">
            <Label>Ton / Style</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) => setFormData({ ...formData, tone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un ton..." />
              </SelectTrigger>
              <SelectContent>
                {config.toneOptions?.map((tone: string) => (
                  <SelectItem key={tone} value={tone.toLowerCase()}>{tone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Audience cible */}
        {config.fields?.showTargetAudience && (
          <div className="grid gap-2">
            <Label>Audience cible</Label>
            <Input
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="Ex: Entrepreneurs 25-40 ans, B2B tech..."
            />
          </div>
        )}

        {/* Mots-clés (article) */}
        {config.fields?.showKeywords && (
          <div className="grid gap-2">
            <Label>Mots-clés SEO</Label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="Ex: marketing digital, stratégie, ROI (séparés par des virgules)"
            />
          </div>
        )}

        {/* Format vidéo */}
        {config.fields?.showFormat && (
          <div className="grid gap-2">
            <Label>Format vidéo</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData({ ...formData, format: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durée estimée..." />
              </SelectTrigger>
              <SelectContent>
                {config.formatOptions?.map((format: string) => (
                  <SelectItem key={format} value={format}>{format}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Durée (vidéo/publicité) */}
        {config.fields?.showDuration && formData.type === 'ad' && (
          <div className="grid gap-2">
            <Label>Durée de la campagne</Label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex: 7 jours, 1 mois..."
            />
          </div>
        )}

        {/* Hashtags (social) */}
        {config.fields?.showHashtags && (
          <div className="grid gap-2">
            <Label>Hashtags</Label>
            <Input
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="#Marketing #Business #Innovation (3-5 max)"
            />
          </div>
        )}

        {/* Call-to-action */}
        {config.fields?.showCallToAction && (
          <div className="grid gap-2">
            <Label>Call-to-action</Label>
            <Input
              value={formData.callToAction}
              onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
              placeholder="Ex: En savoir plus, S'inscrire maintenant, Télécharger..."
            />
          </div>
        )}

        {/* Sujet email */}
        {config.fields?.showSubject && (
          <div className="grid gap-2">
            <Label>Objet de l'email</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Objet accrocheur et personnalisé..."
            />
          </div>
        )}

        {/* Prévisualisation email */}
        {config.fields?.showPreheader && (
          <div className="grid gap-2">
            <Label>Prévisualisation (preheader)</Label>
            <Input
              value={formData.preheader}
              onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
              placeholder="Texte visible dans la boîte de réception..."
            />
          </div>
        )}

        {/* Segment email */}
        {config.fields?.showSegment && (
          <div className="grid gap-2">
            <Label>Segment / Liste</Label>
            <Input
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              placeholder="Ex: Clients actifs, Prospects, Inscrits newsletter..."
            />
          </div>
        )}

        {/* Type d'image */}
        {config.fields?.showImageType && (
          <div className="grid gap-2">
            <Label>Type d'image</Label>
            <Select
              value={formData.imageType}
              onValueChange={(value) => setFormData({ ...formData, imageType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type..." />
              </SelectTrigger>
              <SelectContent>
                {config.imageTypeOptions?.map((type: string) => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dimensions */}
        {config.fields?.showDimensions && (
          <div className="grid gap-2">
            <Label>Dimensions / Format</Label>
            <Select
              value={formData.dimensions}
              onValueChange={(value) => setFormData({ ...formData, dimensions: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un format..." />
              </SelectTrigger>
              <SelectContent>
                {config.dimensionsOptions?.map((dim: string) => (
                  <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Couleurs */}
        {config.fields?.showColorScheme && (
          <div className="grid gap-2">
            <Label>Palette de couleurs</Label>
            <Input
              value={formData.colorScheme}
              onChange={(e) => setFormData({ ...formData, colorScheme: e.target.value })}
              placeholder="Ex: Violet et blanc, Tons pastels, Couleurs vives..."
            />
          </div>
        )}

        {/* Objectif publicitaire */}
        {config.fields?.showObjective && (
          <div className="grid gap-2">
            <Label>Objectif publicitaire</Label>
            <Select
              value={formData.objective}
              onValueChange={(value) => setFormData({ ...formData, objective: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un objectif..." />
              </SelectTrigger>
              <SelectContent>
                {config.objectiveOptions?.map((obj: string) => (
                  <SelectItem key={obj} value={obj.toLowerCase()}>{obj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Budget */}
        {config.fields?.showBudget && (
          <div className="grid gap-2">
            <Label>Budget estimé</Label>
            <Input
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Ex: 500€, 1000-2000€..."
              type="text"
            />
          </div>
        )}
      </div>

      {/* Plateformes & Heure */}
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
              <SelectValue placeholder="Ajouter une plateforme..." />
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
            {formData.platform.map((p: string) => (
              <Badge
                key={p}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-red-100"
                onClick={() => setFormData({
                  ...formData,
                  platform: formData.platform.filter((pl: string) => pl !== p)
                })}
              >
                {platformOptions.find(opt => opt.value === p)?.label} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">{config.contentLabel}</Label>
          {config.fields?.showCharCount && (
            <span className="text-xs text-gray-500">
              {charCount} caractères
            </span>
          )}
          {config.fields?.showWordCount && (
            <span className="text-xs text-gray-500">
              {wordCount} mots
            </span>
          )}
        </div>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={config.contentPlaceholder}
          rows={config.contentRows}
          className="font-mono text-sm"
        />
      </div>
    </>
  );
}
