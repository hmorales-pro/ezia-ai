"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Building2, Loader2, Sparkles, Globe, Rocket, MessageSquare, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BusinessDescriptionAssistant } from "@/components/business/business-description-assistant";

export default function NewBusinessPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "idea",
    hasWebsite: "no",
    wantsWebsite: "yes",
    existingWebsiteUrl: ""
  });

  const industries = [
    "Technology",
    "E-commerce",
    "Services",
    "Santé",
    "Education",
    "Finance",
    "Immobilier",
    "Restauration",
    "Art & Culture",
    "Sport & Bien-être",
    "Consulting",
    "Autre"
  ];

  const stages = [
    { value: "idea", label: "Idée", description: "J'ai une idée mais pas encore commencé" },
    { value: "startup", label: "Startup", description: "Je démarre mon activité" },
    { value: "growth", label: "Croissance", description: "Mon business est en développement" },
    { value: "established", label: "Établi", description: "Mon business est mature" }
  ];

  // Exemples contextuels par industrie
  const descriptionExamples: Record<string, string> = {
    "Technology": "Plateforme SaaS de gestion de projet pour PME françaises, avec IA intégrée pour automatiser les tâches répétitives. Public cible : équipes de 5-50 personnes dans le secteur tech. Notre différenciation : interface en français, support local et tarification transparente.",
    "E-commerce": "Boutique en ligne de vêtements éco-responsables pour femmes 25-40 ans, basée à Lyon. Nous proposons des collections capsules de créateurs locaux, avec livraison 48h en France métropolitaine. Notre mission : démocratiser la mode durable et éthique.",
    "Services": "Agence de conseil en transformation digitale pour TPE/PME en région PACA. Nous accompagnons les entreprises traditionnelles dans leur digitalisation : création de sites web, stratégie réseaux sociaux, formation des équipes. Notre force : proximité et suivi personnalisé.",
    "Santé": "Cabinet de téléconsultation médicale spécialisé en médecine générale, couvrant toute la France. Consultations vidéo 7j/7 de 8h à 22h, prescriptions électroniques, suivi patient via application mobile. Public cible : actifs 25-55 ans en zone urbaine.",
    "Education": "Plateforme de cours en ligne pour entrepreneurs débutants, avec accompagnement personnalisé par des mentors. Programme de 3 mois couvrant : business plan, marketing digital, comptabilité, juridique. Notre différence : communauté active et suivi individuel.",
    "Finance": "Application mobile de gestion de budget et d'investissement pour jeunes actifs 25-35 ans. Agrégation de comptes bancaires, conseils personnalisés par IA, parcours d'investissement gamifié. Mission : démocratiser l'éducation financière en France.",
    "Immobilier": "Agence immobilière digitale spécialisée dans les premiers achats pour jeunes couples à Marseille et alentours. Service clé en main : recherche personnalisée, négociation, accompagnement bancaire et juridique. Notre plus : transparence totale et pas de frais cachés.",
    "Restauration": "Restaurant gastronomique moderne à Bordeaux, cuisine fusion franco-asiatique, produits locaux et de saison. Capacité 40 couverts, service midi et soir, privatisation possible. Public cible : CSP+ 30-60 ans, touristes gastronomiques. Chef étoilé au parcours international.",
    "Art & Culture": "Galerie d'art contemporain et espace événementiel à Paris 11ème, spécialisée dans les artistes émergents français. Expositions mensuelles, vente d'œuvres, ateliers créatifs le week-end. Public : amateurs d'art 30-55 ans, collectionneurs débutants, entreprises pour art corporate.",
    "Sport & Bien-être": "Salle de sport nouvelle génération à Toulouse avec coaching personnalisé et cours collectifs innovants (HIIT, yoga, boxe). 500m², équipements premium, application de suivi. Cible : urbains actifs 25-45 ans cherchant flexibilité et accompagnement qualité.",
    "Consulting": "Cabinet de conseil RH spécialisé en recrutement tech pour startups et scale-ups françaises. Services : chasse de têtes, assessment, marque employeur. Réseau de 10 000+ candidats qualifiés. Notre expertise : profils rares (DevOps, Data Scientists, Product Managers).",
    "Autre": "Décrivez votre activité en détaillant : votre zone géographique, votre cible précise (âge, profil, besoins), votre offre unique, ce qui vous différencie de la concurrence, et vos objectifs principaux."
  };

  // Conseils de rédaction qui s'affichent sous la description
  const getDescriptionTips = () => [
    "📍 Localisation : Précisez votre zone géographique (ville, région, national, international)",
    "🎯 Cible : Décrivez précisément vos clients idéaux (âge, profession, besoins)",
    "💡 Différenciation : Qu'est-ce qui vous rend unique par rapport à la concurrence ?",
    "🎨 Offre : Détaillez vos produits/services principaux et leur valeur ajoutée",
    "🚀 Objectif : Quel problème résolvez-vous ? Quelle est votre mission ?"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      router.push("/dashboard");
      return;
    }

    if (!formData.name || !formData.description || !formData.industry) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setLoadingMessage("Création de votre business...");
    
    try {
      console.log("Submitting to:", "/me/business");
      console.log("FormData:", formData);
      console.log("API base URL:", api.defaults.baseURL);
      
      const response = await api.post("/api/me/business-simple", formData);
      
      if (response.data.ok) {
        setLoadingMessage("Business créé ! Lancement des analyses...");
        toast.success("Business créé avec succès !");
        
        // Délai pour montrer le message sur les analyses
        setTimeout(() => {
          setLoadingMessage("Nos agents commencent l'analyse de votre marché...");
        }, 1000);
        
        // Redirection après un court délai avec flag 'new' pour auto-start
        setTimeout(() => {
          router.push(`/business/${response.data.business.business_id}?new=true`);
        }, 2500);
      } else {
        toast.error(response.data.error || "Erreur lors de la création");
        setLoading(false);
        setLoadingMessage("");
      }
    } catch (error) {
      console.error("Error creating business:", error);
      const axiosError = error as {response?: {status?: number}, config?: {url?: string, baseURL?: string}};
      console.error("Error response:", axiosError.response);
      console.error("Error config:", axiosError.config);
      
      if (axiosError.response?.status === 404) {
        console.error("404 URL attempted:", axiosError.config?.url);
        console.error("Full URL:", (axiosError.config?.baseURL || '') + (axiosError.config?.url || ''));
      }
      
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du business";
      toast.error(errorMessage);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-[#ebe7e1] relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#6D3FC8] mb-4" />
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                {loadingMessage || "Création en cours..."}
              </h3>
              <p className="text-sm text-[#666666] text-center">
                Veuillez patienter pendant que nous préparons votre espace business
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b border-[#E0E0E0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-[#666666] hover:text-[#1E1E1E] hover:bg-[#F5F5F5]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6D3FC8]" />
                <h1 className="text-xl font-semibold text-[#1E1E1E]">Nouveau Business</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white border-[#E0E0E0] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1E1E1E]">Créer votre business</CardTitle>
            <CardDescription className="text-[#666666]">
              Commençons par les informations de base. Notre équipe d'agents IA utilisera ces données 
              pour personnaliser leur accompagnement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#1E1E1E]">Nom du business *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Ma Super Startup"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-[#E0E0E0] text-[#1E1E1E] placeholder:text-[#999999] focus:border-[#6D3FC8] focus:ring-[#6D3FC8]/20"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-[#1E1E1E]">Secteur d&apos;activité *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white border-[#E0E0E0] text-[#1E1E1E] hover:border-[#6D3FC8] focus:border-[#6D3FC8] focus:ring-[#6D3FC8]/20">
                    <SelectValue placeholder="Sélectionnez un secteur" className="text-[#999999]" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E0E0E0]">
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry} className="text-[#1E1E1E] hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Label htmlFor="description" className="text-[#1E1E1E]">
                    Description détaillée *
                  </Label>
                  <span className="text-xs text-[#6D3FC8] font-medium">
                    Plus c'est détaillé, meilleure sera l'analyse IA
                  </span>
                </div>
                <div className="relative">
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre business en détail : zone géographique, public cible, offre unique, ce qui vous différencie..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white border-[#E0E0E0] text-[#1E1E1E] placeholder:text-[#999999] min-h-[120px] focus:border-[#6D3FC8] focus:ring-[#6D3FC8]/20 pr-12"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAssistant(true)}
                    className="absolute top-2 right-2 text-[#6D3FC8] hover:text-[#5A35A5] hover:bg-[#6D3FC8]/10"
                    disabled={loading || !formData.name || !formData.industry}
                    title={!formData.name || !formData.industry ? "Remplissez d'abord le nom et le secteur" : "Aide IA pour rédiger"}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>

                {/* Exemple contextuel basé sur l'industrie sélectionnée */}
                {formData.industry && (
                  <div className="p-3 bg-[#6D3FC8]/5 rounded-lg border border-[#6D3FC8]/20">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#6D3FC8] mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-[#6D3FC8]">
                          Exemple pour {formData.industry} :
                        </p>
                        <p className="text-xs text-[#666666] leading-relaxed">
                          {descriptionExamples[formData.industry] || descriptionExamples["Autre"]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conseils de rédaction */}
                <details className="group">
                  <summary className="cursor-pointer text-xs font-medium text-[#6D3FC8] hover:text-[#5A35A5] flex items-center gap-2">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Conseils pour une description complète
                  </summary>
                  <div className="mt-2 ml-6 space-y-1.5">
                    {getDescriptionTips().map((tip, idx) => (
                      <p key={idx} className="text-xs text-[#666666] leading-relaxed">
                        {tip}
                      </p>
                    ))}
                  </div>
                </details>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1E1E1E]">Stade de développement *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {stages.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, stage: stage.value })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.stage === stage.value
                          ? "bg-[#6D3FC8]/10 border-[#6D3FC8] shadow-sm"
                          : "bg-white border-[#E0E0E0] hover:border-[#6D3FC8]/50"
                      }`}
                      disabled={loading}
                    >
                      <div className="font-medium mb-1 text-[#1E1E1E]">{stage.label}</div>
                      <div className="text-xs text-[#666666]">{stage.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E0E0E0]">
                <div className="space-y-3">
                  <Label className="text-[#1E1E1E] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#6D3FC8]" />
                    Avez-vous déjà un site internet ?
                  </Label>
                  <RadioGroup
                    value={formData.hasWebsite}
                    onValueChange={(value) => setFormData({ ...formData, hasWebsite: value })}
                    disabled={loading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="has-website-yes" />
                      <Label htmlFor="has-website-yes" className="text-[#666666] cursor-pointer">
                        Oui, j'ai déjà un site
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="has-website-no" />
                      <Label htmlFor="has-website-no" className="text-[#666666] cursor-pointer">
                        Non, pas encore
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {formData.hasWebsite === "yes" && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="website-url" className="text-[#1E1E1E] text-sm">
                        URL de votre site actuel (optionnel)
                      </Label>
                      <Input
                        id="website-url"
                        type="url"
                        placeholder="https://www.monsite.com"
                        value={formData.existingWebsiteUrl}
                        onChange={(e) => setFormData({ ...formData, existingWebsiteUrl: e.target.value })}
                        className="bg-white border-[#E0E0E0] text-[#1E1E1E] placeholder:text-[#999999] focus:border-[#6D3FC8] focus:ring-[#6D3FC8]/20"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>

                {formData.hasWebsite === "no" && (
                  <div className="space-y-3">
                    <Label className="text-[#1E1E1E] flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-[#6D3FC8]" />
                      Souhaitez-vous qu'Ezia génère un site pour vous ?
                    </Label>
                    <RadioGroup
                      value={formData.wantsWebsite}
                      onValueChange={(value) => setFormData({ ...formData, wantsWebsite: value })}
                      disabled={loading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="wants-website-yes" />
                        <Label htmlFor="wants-website-yes" className="text-[#666666] cursor-pointer">
                          Oui, générer automatiquement après les analyses
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="later" id="wants-website-later" />
                        <Label htmlFor="wants-website-later" className="text-[#666666] cursor-pointer">
                          Plus tard, je déciderai après les analyses
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="wants-website-no" />
                        <Label htmlFor="wants-website-no" className="text-[#666666] cursor-pointer">
                          Non, je n'ai pas besoin de site
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    {formData.wantsWebsite === "yes" && (
                      <div className="mt-3 p-3 bg-[#6D3FC8]/10 rounded-lg border border-[#6D3FC8]/30">
                        <p className="text-sm text-[#6D3FC8]">
                          🚀 Parfait ! Ezia générera automatiquement votre site après avoir complété 
                          les analyses de marché et la stratégie marketing.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#6D3FC8] hover:bg-[#5A35A5] text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer et continuer avec Ezia
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                  className="border-[#E0E0E0] text-[#666666] hover:bg-[#F5F5F5] hover:text-[#1E1E1E]"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-[#6D3FC8]/10 rounded-lg border border-[#6D3FC8]/30">
          <p className="text-sm text-[#6D3FC8]">
            <strong>💡 Astuce :</strong> Plus vous donnez d&apos;informations précises,
            mieux Ezia pourra vous accompagner. Vous pourrez toujours modifier
            ces informations plus tard.
          </p>
        </div>
      </main>

      {/* Assistant IA pour la description */}
      <BusinessDescriptionAssistant
        open={showAssistant}
        onClose={() => setShowAssistant(false)}
        onComplete={(description) => {
          setFormData({ ...formData, description });
          setShowAssistant(false);
        }}
        businessName={formData.name}
        industry={formData.industry}
        currentDescription={formData.description}
      />
    </div>
  );
}