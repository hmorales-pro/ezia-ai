"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle, Building2, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Image from "next/image";

interface FormData {
  email: string;
  name: string;
  company: string;
  profile: string;
  needs: string;
  urgency: string;
  teamSize?: string;
  tools?: string[];
  priorities?: string[];
}

export default function WaitlistEnterpriseClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    company: "",
    profile: "established",
    needs: "",
    urgency: "",
    teamSize: "",
    tools: [],
    priorities: []
  });

  const totalSteps = 4;

  const teamSizes = [
    { value: "solo", label: "Solo (1 personne)" },
    { value: "small", label: "Petite équipe (2-10)" },
    { value: "medium", label: "Moyenne (11-50)" },
    { value: "large", label: "Grande (50+)" }
  ];

  const toolCategories = [
    { value: "stripe", label: "Stripe / PayPal (Paiements)" },
    { value: "hubspot", label: "HubSpot / Salesforce (CRM)" },
    { value: "analytics", label: "Google Analytics / Mixpanel" },
    { value: "zendesk", label: "Zendesk / Intercom (Support)" },
    { value: "asana", label: "Asana / Trello (Projets)" },
    { value: "mailchimp", label: "Mailchimp / SendinBlue (Email)" },
    { value: "shopify", label: "Shopify / WooCommerce (E-commerce)" },
    { value: "quickbooks", label: "QuickBooks / Xero (Compta)" }
  ];

  const businessPriorities = [
    { value: "revenue", label: "Comprendre pourquoi notre CA stagne ou diminue", icon: "📉" },
    { value: "customer_journey", label: "Mieux comprendre le parcours de nos clients", icon: "🗺️" },
    { value: "retention", label: "Améliorer notre taux de rétention client", icon: "🎯" },
    { value: "acquisition", label: "Optimiser nos coûts d'acquisition", icon: "💰" },
    { value: "performance", label: "Identifier nos produits/services les plus rentables", icon: "📊" },
    { value: "automation", label: "Automatiser nos rapports et tableaux de bord", icon: "🤖" },
    { value: "predictions", label: "Prédire les tendances et anticiper", icon: "🔮" },
    { value: "competition", label: "Surveiller et analyser la concurrence", icon: "👀" }
  ];

  const urgencyOptions = [
    { value: "immediate", label: "J'ai besoin d'une solution maintenant", icon: "🔥" },
    { value: "3_months", label: "Dans les 3 prochains mois", icon: "📅" },
    { value: "exploring", label: "J'explore les options", icon: "🔍" }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.company) {
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

  const handleSubmit = async () => {
    if (!formData.urgency || formData.tools.length === 0 || formData.priorities?.length === 0) {
      toast.error("Veuillez compléter tous les champs");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/waitlist", {
        email: formData.email,
        name: formData.name,
        company: formData.company,
        profile: "established",
        needs: `Taille: ${formData.teamSize}, Outils: ${formData.tools.join(", ")}, Priorités: ${formData.priorities?.join(", ")}`,
        urgency: formData.urgency,
        source: "/waitlist-enterprise"
      });

      if (response.data.success) {
        setPosition(response.data.position);
        setSubmitted(true);
        toast.success("Inscription réussie !");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Cet email est déjà inscrit");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Bienvenue dans l'aventure Ezia Analytics ! 🎉</CardTitle>
            <CardDescription className="text-base mt-2">
              Vous êtes inscrit en position #{position}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-[#333333]">
                Nous sommes ravis de vous compter parmi nos early adopters. 
                Vous recevrez un email dès que votre accès sera disponible.
              </p>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-[#6D3FC8] font-medium">
                  En tant qu'early adopter, vous bénéficierez de :
                </p>
                <ul className="text-sm text-[#666666] mt-2 space-y-1">
                  <li>• Accès prioritaire à la plateforme</li>
                  <li>• Support personnalisé pour l'intégration</li>
                  <li>• Tarif préférentiel à vie</li>
                </ul>
              </div>
              
              <Button
                onClick={() => router.push("/home-enterprise")}
                className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de contact 📧</h3>
              <p className="text-sm text-[#666666] mb-6">
                Pour vous envoyer votre accès prioritaire à Ezia Analytics
              </p>
            </div>
            
            <div>
              <Label htmlFor="name">Votre nom complet *</Label>
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
              <Label htmlFor="email">Email professionnel *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean@entreprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Nom de votre entreprise *</Label>
              <Input
                id="company"
                type="text"
                placeholder="Mon Entreprise SAS"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="teamSize">Taille de votre équipe</Label>
              <Select value={formData.teamSize} onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez la taille de votre équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Vos outils actuels 🛠️</h3>
              <p className="text-sm text-[#666666] mb-6">
                Quels outils utilisez-vous aujourd'hui ? (Sélectionnez tous ceux qui s'appliquent)
              </p>
            </div>
            
            <div className="space-y-3">
              {toolCategories.map((tool) => (
                <div key={tool.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool.value}
                    checked={formData.tools?.includes(tool.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, tools: [...(formData.tools || []), tool.value] });
                      } else {
                        setFormData({ ...formData, tools: formData.tools?.filter(t => t !== tool.value) || [] });
                      }
                    }}
                  />
                  <Label htmlFor={tool.value} className="flex-1 cursor-pointer">
                    {tool.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Vos priorités business 🎯</h3>
              <p className="text-sm text-[#666666] mb-6">
                Qu'est-ce que vous aimeriez faire en priorité avec Ezia Analytics ? (Sélectionnez jusqu'à 3 priorités)
              </p>
            </div>
            
            <div className="space-y-3">
              {businessPriorities.map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={priority.value}
                    checked={formData.priorities?.includes(priority.value)}
                    onCheckedChange={(checked) => {
                      const currentPriorities = formData.priorities || [];
                      if (checked && currentPriorities.length < 3) {
                        setFormData({ ...formData, priorities: [...currentPriorities, priority.value] });
                      } else if (!checked) {
                        setFormData({ ...formData, priorities: currentPriorities.filter(p => p !== priority.value) });
                      } else if (checked && currentPriorities.length >= 3) {
                        toast.error("Vous pouvez sélectionner jusqu'à 3 priorités maximum");
                      }
                    }}
                  />
                  <Label htmlFor={priority.value} className="flex-1 cursor-pointer flex items-center gap-2">
                    <span className="text-lg">{priority.icon}</span>
                    <span>{priority.label}</span>
                  </Label>
                </div>
              ))}
            </div>
            
            {formData.priorities && formData.priorities.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-[#6D3FC8] font-medium">
                  {formData.priorities.length}/3 priorité{formData.priorities.length > 1 ? 's' : ''} sélectionnée{formData.priorities.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Votre urgence ⏰</h3>
              <p className="text-sm text-[#666666] mb-6">
                Quand avez-vous besoin d'une solution ?
              </p>
            </div>
            
            <RadioGroup
              value={formData.urgency}
              onValueChange={(value) => setFormData({ ...formData, urgency: value })}
            >
              <div className="space-y-3">
                {urgencyOptions.map((option) => (
                  <div key={option.value} className="relative">
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer
                      ${formData.urgency === option.value 
                        ? 'border-[#6D3FC8] bg-purple-50' 
                        : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}>
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span>{option.label}</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Link href="/home-enterprise" className="flex items-center gap-2 text-[#666666] hover:text-[#6D3FC8] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Ezia" width={32} height={32} />
          <span className="font-semibold text-[#1E1E1E]">Ezia Analytics</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Building2 className="w-8 h-8 text-[#6D3FC8]" />
              <div>
                <CardTitle className="text-2xl">
                  Rejoignez la liste d'attente Ezia Analytics
                </CardTitle>
                <CardDescription>
                  L'IA qui unifie et comprend toutes vos données business
                </CardDescription>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#666666]">
                <span>Étape {currentStep} sur {totalSteps}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {renderStep()}

            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Retour
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="flex-1 bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
                >
                  Continuer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#764BA2] text-white"
                >
                  {loading ? "Inscription..." : "Rejoindre la liste d'attente"}
                  {!loading && <CheckCircle className="ml-2 w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}