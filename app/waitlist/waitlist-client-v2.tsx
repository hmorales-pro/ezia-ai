"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  CheckCircle, 
  Users, 
  Zap, 
  Globe,
  TrendingUp,
  MessageSquare,
  Loader2,
  User,
  Target,
  Flame
} from "lucide-react";

interface FormData {
  email: string;
  name: string;
  profile: string;
  profileOther?: string;
  needs: string[];
  urgency: string;
}

export default function WaitlistPageV2() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    profile: "",
    profileOther: "",
    needs: [],
    urgency: ""
  });

  const totalSteps = 2;

  const profiles = [
    { value: "entrepreneur", label: "Entrepreneur / Freelance", icon: "💼" },
    { value: "association", label: "Association / Collectif", icon: "🤝" },
    { value: "tpe-pme", label: "TPE/PME", icon: "🏢" },
    { value: "etudiant", label: "Étudiant / Porteur de projet", icon: "🎓" },
    { value: "autre", label: "Autre", icon: "✨" }
  ];

  const needs = [
    { value: "digital", label: "Créer / améliorer ma présence digitale (site, réseaux sociaux)", icon: "🌐" },
    { value: "productivity", label: "Gagner du temps sur la gestion et l'organisation", icon: "🧰" },
    { value: "network", label: "Développer mon réseau / mes clients", icon: "🤝" },
    { value: "guidance", label: "Être accompagné pas à pas dans mon projet", icon: "💡" },
    { value: "ethical-ai", label: "Découvrir une IA française et éthique", icon: "🧑‍💻" }
  ];

  const urgencyLevels = [
    { value: "now", label: "Je cherche une solution maintenant", icon: "🔥" },
    { value: "soon", label: "Je m'informe pour bientôt", icon: "🙂" },
    { value: "curious", label: "Je suis juste curieux", icon: "👀" }
  ];

  const handleNext = () => {
    // Validation par étape
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Email invalide");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.profile) {
      toast.error("Merci de sélectionner ton profil");
      return;
    }
    if (formData.profile === "autre" && !formData.profileOther?.trim()) {
      toast.error("Merci de préciser ton profil");
      return;
    }
    if (formData.needs.length === 0) {
      toast.error("Sélectionne au moins un besoin");
      return;
    }
    if (!formData.urgency) {
      toast.error("Dis-nous où tu en es !");
      return;
    }
    
    setLoading(true);
    
    try {
      // Détecter si c'est une entreprise/association
      const isEnterprise = window.location.pathname.includes('/waitlist-enterprise') || 
                          formData.profile === "association" || 
                          formData.profile === "tpe-pme";
      
      const submitData = {
        email: formData.email,
        name: formData.name,
        profile: formData.profile === "autre" ? formData.profileOther : formData.profile,
        needs: formData.needs.join(", "),
        urgency: formData.urgency,
        source: isEnterprise ? "waitlist-enterprise" : "waitlist-v2-compact"
      };

      const response = await api.post("/api/waitlist", submitData);
      
      if (response.data.success) {
        setSubmitted(true);
        setPosition(response.data.position);
        toast.success("Inscription réussie !");
      } else {
        toast.error(response.data.error || "Erreur lors de l'inscription");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Cet email est déjà inscrit sur la liste d'attente");
      } else {
        toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Écran de succès
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E0E0E0] shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">
              Bienvenue dans la liste VIP Ezia !
            </h2>
            
            <p className="text-[#666666] mb-6">
              Vous êtes officiellement inscrit(e) sur notre liste VIP. Vous recevrez en priorité 
              toutes les informations sur le lancement d'Ezia.
            </p>
            
            {position && (
              <Badge variant="secondary" className="mb-6">
                Position #{position} sur la liste d'attente
              </Badge>
            )}
            
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#6D3FC8] font-medium">
                👉 Vous serez prévenu par email dès que nous annoncerons la mise en ligne d'Ezia.
                Merci de votre confiance !
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => {
                  const isEnterprise = window.location.pathname.includes('/waitlist-enterprise');
                  router.push(isEnterprise ? "/home-enterprise" : "/home");
                }}
                className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
              >
                Retour à l'accueil
              </Button>
              
              <p className="text-sm text-[#666666]">
                En attendant, suivez-nous sur nos réseaux sociaux pour rester informé des dernières actualités.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Commençons par faire connaissance 👋</h3>
              <p className="text-sm text-[#666666] mb-6">
                Ces informations nous permettront de te contacter pour ton accès VIP.
              </p>
            </div>
            
            <div>
              <Label htmlFor="name">Ton nom complet *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Ton email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
              <p className="text-xs text-[#666666] mt-1">
                Nous utiliserons cet email uniquement pour t'informer du lancement d'Ezia
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Section Profil */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">A. Je suis...</h3>
              </div>
              
              <RadioGroup
                value={formData.profile}
                onValueChange={(value) => setFormData({ ...formData, profile: value })}
              >
                <div className="grid grid-cols-2 gap-3">
                  {profiles.map((profile) => (
                    <div key={profile.value} className="relative">
                      <div className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer
                        ${formData.profile === profile.value 
                          ? 'border-[#6D3FC8] bg-purple-50' 
                          : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}>
                        <RadioGroupItem value={profile.value} id={profile.value} className="sr-only" />
                        <Label 
                          htmlFor={profile.value} 
                          className="flex-1 cursor-pointer flex items-center gap-2 text-sm"
                        >
                          <span className="text-lg">{profile.icon}</span>
                          <span>{profile.label}</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              
              {formData.profile === "autre" && (
                <div className="mt-3">
                  <Label htmlFor="profileOther">Précise ton profil *</Label>
                  <Input
                    id="profileOther"
                    type="text"
                    placeholder="Décris ton profil..."
                    value={formData.profileOther}
                    onChange={(e) => setFormData({ ...formData, profileOther: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Section Besoins */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">B. Ton besoin principal <span className="text-xs text-[#666666] font-normal">(plusieurs choix possibles)</span></h3>
              </div>
              
              <div className="space-y-2">
                {needs.map((need) => (
                  <div 
                    key={need.value} 
                    className={`flex items-start space-x-3 p-2 rounded-lg border transition-all cursor-pointer
                      ${formData.needs.includes(need.value) 
                        ? 'border-[#6D3FC8] bg-purple-50' 
                        : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}
                    onClick={() => toggleNeed(need.value)}
                  >
                    <Checkbox
                      checked={formData.needs.includes(need.value)}
                      onCheckedChange={() => toggleNeed(need.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{need.icon}</span>
                        <span className="text-sm">{need.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Urgence */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-1">C. Tu en es où ? 🎯</h3>
              </div>
              
              <RadioGroup
                value={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
              >
                <div className="space-y-2">
                  {urgencyLevels.map((level) => (
                    <div key={level.value} className="relative">
                      <div className={`flex items-center space-x-3 p-2 rounded-lg border transition-all cursor-pointer
                        ${formData.urgency === level.value 
                          ? 'border-[#6D3FC8] bg-purple-50' 
                          : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}>
                        <RadioGroupItem value={level.value} id={level.value} />
                        <Label 
                          htmlFor={level.value} 
                          className="flex-1 cursor-pointer flex items-center gap-3"
                        >
                          <span className="text-xl">{level.icon}</span>
                          <span className="font-medium">{level.label}</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1]">
      {/* Header */}
      <header className="border-b border-[#E0E0E0] backdrop-blur-xl bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/home" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Ezia Logo"
                    width={40}
                    height={40}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <h1 className="text-xl font-bold text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">Ezia</h1>
              </Link>
              <span className="text-sm text-[#666666] hidden sm:inline">|</span>
              <span className="text-sm text-[#666666] hidden sm:inline">Liste d'attente VIP</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors hidden sm:inline">
                Retour à l'accueil
              </Link>
              <Link href="/auth/ezia">
                <Button size="sm" className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="gap-2 mb-4">
            <Sparkles className="w-3 h-3" />
            Accès VIP limité
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] mb-4">
            Rejoignez les premiers utilisateurs d'
            <span className="text-[#6D3FC8]">Ezia</span>
          </h1>
          
          <p className="text-xl text-[#666666] max-w-2xl mx-auto">
            Inscription rapide en 2 étapes pour rejoindre l'aventure Ezia
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#666666]">Étape {currentStep} sur {totalSteps}</span>
            <span className="text-sm text-[#666666]">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-[#E0E0E0] shadow-xl">
          <CardContent className="p-6 md:p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 bg-[#6D3FC8] hover:bg-[#5A35A5] text-white ml-auto"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#764BA2] text-white ml-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Rejoindre la liste VIP
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6D3FC8]">🚀</p>
              <p className="text-sm text-[#666666]">Accès prioritaire</p>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6D3FC8]">🇫🇷</p>
              <p className="text-sm text-[#666666]">IA Française</p>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6D3FC8]">2025</p>
              <p className="text-sm text-[#666666]">Lancement</p>
            </div>
          </div>
          
          <p className="text-xs text-[#666666]">
            En vous inscrivant, vous acceptez de recevoir des emails concernant 
            le lancement d'Ezia et ses actualités.
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}