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
import { ArrowLeft, Building2, Loader2, Sparkles, Globe, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function NewBusinessPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
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
                <Label htmlFor="description" className="text-[#1E1E1E]">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre business en quelques phrases..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-[#E0E0E0] text-[#1E1E1E] placeholder:text-[#999999] min-h-[100px] focus:border-[#6D3FC8] focus:ring-[#6D3FC8]/20"
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
    </div>
  );
}