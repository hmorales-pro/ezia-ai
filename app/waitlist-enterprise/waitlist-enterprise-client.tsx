"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  CheckCircle,
  Zap, 
  Loader2,
  Building2,
  MessageSquare
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
    { value: "quickbooks", label: "QuickBooks", icon: "💰" },
    { value: "mailchimp", label: "Mailchimp", icon: "📧" },
    { value: "shopify", label: "Shopify", icon: "🛍️" },
    { value: "other", label: "Autres", icon: "🔧" }
  ];

  const employeeRanges = [
    { value: "1-10", label: "1-10 employés", emoji: "👥" },
    { value: "11-50", label: "11-50 employés", emoji: "👥👥" },
    { value: "51-200", label: "51-200 employés", emoji: "🏢" },
    { value: "201-500", label: "201-500 employés", emoji: "🏢🏢" },
    { value: "500+", label: "Plus de 500 employés", emoji: "🏙️" }
  ];

  const revenueRanges = [
    { value: "<100k", label: "Moins de 100k€", emoji: "🌱" },
    { value: "100k-500k", label: "100k€ - 500k€", emoji: "🌿" },
    { value: "500k-1M", label: "500k€ - 1M€", emoji: "🌳" },
    { value: "1M-5M", label: "1M€ - 5M€", emoji: "🌲" },
    { value: "5M+", label: "Plus de 5M€", emoji: "🏔️" }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.company || !formData.role) {
        toast.error("On a besoin de toutes ces infos pour bien vous connaître 😊");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Cet email ne semble pas valide 🤔");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.employees || !formData.revenue) {
        toast.error("Dites-nous en plus sur votre entreprise !");
        return;
      }
      if (formData.tools.length === 0) {
        toast.error("Sélectionnez au moins un outil que vous utilisez");
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
      toast.error("Racontez-nous vos défis et attentes !");
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
        toast.success("C'est dans la boîte ! 🎉");
      } else {
        toast.error(response.data.error || "Oups, quelque chose n'a pas fonctionné");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Vous êtes déjà inscrit ! On a hâte de vous montrer Ezia 😊");
      } else {
        toast.error("Erreur technique, réessayez dans quelques instants");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E0E0E0] shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">
              Bienvenue dans l'aventure Ezia ! 🚀
            </h2>
            
            <p className="text-[#666666] mb-6">
              Vous êtes maintenant sur notre liste prioritaire ! On vous tiendra au courant de l'avancée d'Ezia.
            </p>
            
            {position && (
              <Badge variant="secondary" className="mb-6">
                Entreprise #{position} sur la liste VIP
              </Badge>
            )}
            
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#6D3FC8] font-medium">
                📧 Surveillez vos emails ! On vous enverra bientôt toutes les infos pour découvrir Ezia en avant-première.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/home-enterprise")}
                className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
              >
                Retour à l'accueil
              </Button>
              
              <p className="text-sm text-[#666666]">
                En attendant, préparez vos questions ! On adore discuter data et business 😊
              </p>
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
              <h3 className="text-lg font-semibold mb-4">Faisons connaissance ! 👋</h3>
              <p className="text-sm text-[#666666] mb-6">
                Pour qu'Ezia puisse vraiment vous aider, on a besoin de mieux vous connaître.
              </p>
            </div>
            
            <div>
              <Label htmlFor="name">Votre nom *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Marie Dupont"
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
                placeholder="marie@entreprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
              <p className="text-xs text-[#666666] mt-1">
                On utilisera cet email pour vous envoyer les infos importantes
              </p>
            </div>

            <div>
              <Label htmlFor="company">Nom de votre entreprise *</Label>
              <Input
                id="company"
                type="text"
                placeholder="Ma Super Entreprise"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Votre rôle *</Label>
              <Input
                id="role"
                type="text"
                placeholder="CEO, Directeur Marketing, CTO..."
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
            {/* Section Taille */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Votre entreprise en quelques chiffres 📊</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Ça nous aide à personnaliser Ezia pour vos besoins
                </p>
              </div>
              
              <div>
                <Label className="mb-3 block">Combien êtes-vous ? *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employeeRanges.map((range) => (
                    <div 
                      key={range.value}
                      onClick={() => setFormData({ ...formData, employees: range.value })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                        ${formData.employees === range.value 
                          ? 'border-[#6D3FC8] bg-purple-50' 
                          : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}
                    >
                      <span className="text-sm font-medium">{range.label}</span>
                      <span className="text-lg">{range.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Votre chiffre d'affaires annuel *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {revenueRanges.map((range) => (
                    <div 
                      key={range.value}
                      onClick={() => setFormData({ ...formData, revenue: range.value })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                        ${formData.revenue === range.value 
                          ? 'border-[#6D3FC8] bg-purple-50' 
                          : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}
                    >
                      <span className="text-sm font-medium">{range.label}</span>
                      <span className="text-lg">{range.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Outils */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Vos outils du quotidien 🛠️</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Quels outils utilisez-vous déjà ? (plusieurs choix possibles)
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tools.map((tool) => (
                  <div 
                    key={tool.value} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer
                      ${formData.tools.includes(tool.value) 
                        ? 'border-[#6D3FC8] bg-purple-50' 
                        : 'border-[#E0E0E0] hover:border-[#6D3FC8]'}`}
                    onClick={() => toggleTool(tool.value)}
                  >
                    <Checkbox
                      checked={formData.tools.includes(tool.value)}
                      onCheckedChange={() => toggleTool(tool.value)}
                      className="data-[state=checked]:bg-[#6D3FC8] data-[state=checked]:border-[#6D3FC8]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
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
              <h3 className="text-lg font-semibold mb-4">Parlons de vos défis 💭</h3>
              <p className="text-sm text-[#666666] mb-6">
                C'est le moment de nous raconter ce qui vous préoccupe vraiment
              </p>
            </div>
            
            <div>
              <Label htmlFor="challenges">
                Quel est votre plus grand défi avec vos données aujourd'hui ? *
              </Label>
              <Textarea
                id="challenges"
                placeholder="Par exemple : 'Je perds 3h par semaine à compiler des rapports depuis 5 outils différents' ou 'Impossible de savoir d'où viennent vraiment nos meilleurs clients'..."
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                className="mt-1 min-h-[120px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="expectations">
                Si vous aviez une baguette magique, que feriez-vous avec vos données ? *
              </Label>
              <Textarea
                id="expectations"
                placeholder="Dites-nous votre rêve ! 'J'aimerais pouvoir demander à mon ordi : Comment va mon business ?' ou 'Voir en un coup d'œil où concentrer mes efforts'..."
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                className="mt-1 min-h-[120px]"
                required
              />
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-[#6D3FC8] flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Plus vous nous en dites, mieux on pourra personnaliser la démo d'Ezia 
                  pour répondre exactement à vos besoins !
                </span>
              </p>
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
                <h1 className="text-xl font-bold text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">Ezia</h1>
              </Link>
              <span className="text-sm text-[#666666] hidden sm:inline">|</span>
              <span className="text-sm text-[#666666] hidden sm:inline">Accès entreprise</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/home-enterprise" className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors hidden sm:inline">
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
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] mb-4">
            Découvrez l'histoire que racontent
            <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent"> vos données</span>
          </h1>
          
          <p className="text-xl text-[#666666] max-w-2xl mx-auto">
            Répondez à quelques questions pour qu'on prépare une démo d'Ezia personnalisée
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
                      Un instant...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Envoyer ma demande
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
              <p className="text-3xl font-bold text-[#6D3FC8]">🔒</p>
              <p className="text-sm text-[#666666]">100% sécurisé</p>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6D3FC8]">🇫🇷</p>
              <p className="text-sm text-[#666666]">Solution française</p>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#6D3FC8]">⚡</p>
              <p className="text-sm text-[#666666]">Accès prioritaire</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}