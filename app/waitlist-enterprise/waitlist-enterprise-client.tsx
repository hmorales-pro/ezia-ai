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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  ArrowRight,
  ChartBar, 
  Database, 
  TrendingUp, 
  Zap, 
  Loader2,
  Building2,
  CheckCircle,
  BarChart3,
  Users,
  Activity,
  FileText
} from "lucide-react";

interface FormData {
  email: string;
  name: string;
  company: string;
  role: string;
  employees: string;
  revenue: string;
  tools: string[];
  challenges: string;
  expectations: string;
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
    role: "",
    employees: "",
    revenue: "",
    tools: [],
    challenges: "",
    expectations: ""
  });

  const totalSteps = 3;

  const tools = [
    { value: "stripe", label: "Stripe", icon: "💳" },
    { value: "asana", label: "Asana", icon: "✅" },
    { value: "zendesk", label: "Zendesk", icon: "🎧" },
    { value: "salesforce", label: "Salesforce", icon: "☁️" },
    { value: "hubspot", label: "HubSpot", icon: "🧲" },
    { value: "slack", label: "Slack", icon: "💬" },
    { value: "notion", label: "Notion", icon: "📝" },
    { value: "googleanalytics", label: "Google Analytics", icon: "📊" },
    { value: "other", label: "Autres", icon: "🔧" }
  ];

  const employeeRanges = [
    { value: "1-10", label: "1-10 employés" },
    { value: "11-50", label: "11-50 employés" },
    { value: "51-200", label: "51-200 employés" },
    { value: "201-500", label: "201-500 employés" },
    { value: "500+", label: "Plus de 500 employés" }
  ];

  const revenueRanges = [
    { value: "<100k", label: "Moins de 100k€" },
    { value: "100k-500k", label: "100k€ - 500k€" },
    { value: "500k-1M", label: "500k€ - 1M€" },
    { value: "1M-5M", label: "1M€ - 5M€" },
    { value: "5M+", label: "Plus de 5M€" }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.company || !formData.role) {
        toast.error("Merci de remplir tous les champs");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Email invalide");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.employees || !formData.revenue) {
        toast.error("Merci de sélectionner toutes les informations");
        return;
      }
      if (formData.tools.length === 0) {
        toast.error("Sélectionne au moins un outil");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.challenges || !formData.expectations) {
      toast.error("Merci de répondre à toutes les questions");
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = {
        email: formData.email,
        name: formData.name,
        company: formData.company,
        message: `Rôle: ${formData.role} | Employés: ${formData.employees} | CA: ${formData.revenue} | Outils: ${formData.tools.join(", ")} | Défis: ${formData.challenges} | Attentes: ${formData.expectations}`,
        profile: "enterprise",
        needs: formData.tools.join(", "),
        urgency: "business",
        source: "waitlist-enterprise"
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-300 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Inscription confirmée !
            </h2>
            
            <p className="text-slate-600 mb-6">
              Nous vous contacterons très prochainement pour une démonstration personnalisée d'Ezia Analytics.
            </p>
            
            {position && (
              <Badge variant="secondary" className="mb-6">
                Entreprise #{position} sur la liste VIP
              </Badge>
            )}
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 font-medium">
                🎯 Prochaine étape : Un de nos experts vous contactera dans les 48h pour comprendre vos besoins spécifiques et planifier une démo.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/home-enterprise")}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white"
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
              <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
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
              <Label htmlFor="company">Nom de l'entreprise *</Label>
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
              <Label htmlFor="role">Votre fonction *</Label>
              <Input
                id="role"
                type="text"
                placeholder="CEO, CTO, Directeur Marketing..."
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Votre entreprise</h3>
              </div>
              
              <div>
                <Label>Nombre d'employés *</Label>
                <RadioGroup
                  value={formData.employees}
                  onValueChange={(value) => setFormData({ ...formData, employees: value })}
                >
                  <div className="space-y-2 mt-2">
                    {employeeRanges.map((range) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={range.value} id={range.value} />
                        <Label htmlFor={range.value} className="cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Chiffre d'affaires annuel *</Label>
                <RadioGroup
                  value={formData.revenue}
                  onValueChange={(value) => setFormData({ ...formData, revenue: value })}
                >
                  <div className="space-y-2 mt-2">
                    {revenueRanges.map((range) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={range.value} id={`revenue-${range.value}`} />
                        <Label htmlFor={`revenue-${range.value}`} className="cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Vos outils actuels</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Sélectionnez tous les outils que vous utilisez
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <div 
                    key={tool.value} 
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer
                      ${formData.tools.includes(tool.value) 
                        ? 'border-slate-700 bg-slate-100' 
                        : 'border-slate-300 hover:border-slate-500'}`}
                    onClick={() => toggleTool(tool.value)}
                  >
                    <Checkbox
                      checked={formData.tools.includes(tool.value)}
                      onCheckedChange={() => toggleTool(tool.value)}
                      className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                    />
                    <div className="flex items-center gap-2">
                      <span>{tool.icon}</span>
                      <span className="text-sm">{tool.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Vos besoins</h3>
            </div>
            
            <div>
              <Label htmlFor="challenges">
                Quels sont vos principaux défis en matière de données ? *
              </Label>
              <Textarea
                id="challenges"
                placeholder="Ex: Données éparpillées entre plusieurs outils, difficultés à avoir une vue d'ensemble, temps perdu en reporting manuel..."
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                className="mt-1 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="expectations">
                Qu'attendez-vous d'une solution comme Ezia Analytics ? *
              </Label>
              <Textarea
                id="expectations"
                placeholder="Ex: Tableaux de bord unifiés, insights automatiques, prédictions, alertes intelligentes..."
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                className="mt-1 min-h-[100px]"
                required
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                💡 Ces informations nous permettront de personnaliser notre démonstration 
                selon vos besoins spécifiques.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header */}
      <header className="border-b border-slate-300 backdrop-blur-xl bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/home-enterprise" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Ezia Logo"
                    width={40}
                    height={40}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <h1 className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">Ezia Analytics</h1>
              </Link>
              <span className="text-sm text-slate-600 hidden sm:inline">|</span>
              <span className="text-sm text-slate-600 hidden sm:inline">Accès Entreprise</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/home-enterprise" className="text-sm text-slate-600 hover:text-slate-800 transition-colors hidden sm:inline">
                Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="gap-2 mb-4">
            <Building2 className="w-3 h-3" />
            Accès prioritaire entreprises
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Transformez vos données en
            <span className="text-blue-600"> décisions éclairées</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Rejoignez la liste d'attente pour découvrir comment Ezia unifie et analyse vos données business
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Étape {currentStep} sur {totalSteps}</span>
            <span className="text-sm text-slate-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-slate-300 shadow-xl">
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
                  className="gap-2 bg-slate-800 hover:bg-slate-900 text-white ml-auto"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white ml-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Demander une démo
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
              <p className="text-3xl font-bold text-blue-600">🔒</p>
              <p className="text-sm text-slate-600">Données sécurisées</p>
            </div>
            <div className="w-px h-12 bg-slate-300" />
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">⚡</p>
              <p className="text-sm text-slate-600">Intégrations rapides</p>
            </div>
            <div className="w-px h-12 bg-slate-300" />
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">🇫🇷</p>
              <p className="text-sm text-slate-600">Solution française</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}