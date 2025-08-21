"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowLeft, Sparkles, Bot, Globe, MessageSquare, Code2, Rocket, Users, Heart, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks";
import { toast } from "sonner";
import { Footer } from "@/components/ui/footer";

interface Plan {
  name: string;
  price: number;
  price_yearly?: number;
  features: {
    max_businesses: number;
    max_analyses_per_month: number;
    max_websites: number;
    priority_support: boolean;
    custom_domain: boolean;
    white_label: boolean;
    api_access: boolean;
  };
  description: string;
  tagline?: string;
  emoji?: string;
}

function TarifsPageContent() {
  const router = useRouter();
  const { user } = useUser();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/api/me/subscription');
      setPlans(response.data.plans);
      setCurrentPlan(response.data.subscription?.plan || 'free');
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // En cas d'erreur, utiliser les plans par défaut
      setPlans({
        free: { 
          name: 'Découverte', 
          price: 0, 
          emoji: '🌱',
          features: { 
            max_businesses: 1, 
            max_analyses_per_month: 5, 
            max_websites: 1, 
            priority_support: false, 
            custom_domain: false, 
            white_label: false, 
            api_access: false 
          }, 
          description: 'Idéal pour tester Ezia',
          tagline: 'Votre premier projet gratuit'
        },
        starter: {
          name: 'Créateur',
          price: 29,
          price_yearly: 290,
          emoji: '🚀',
          features: {
            max_businesses: 3,
            max_analyses_per_month: 50,
            max_websites: 3,
            priority_support: false,
            custom_domain: false,
            white_label: false,
            api_access: false
          },
          description: 'Pour lancer vos projets',
          tagline: 'L\'équipe complète à petit prix'
        },
        pro: { 
          name: 'Entrepreneur', 
          price: 79,
          price_yearly: 790,
          emoji: '✨',
          features: { 
            max_businesses: 10, 
            max_analyses_per_month: -1, 
            max_websites: 10, 
            priority_support: true, 
            custom_domain: true, 
            white_label: false, 
            api_access: true 
          }, 
          description: 'Pour développer votre activité',
          tagline: 'Conversations illimitées'
        },
        enterprise: {
          name: 'Agence',
          price: 299,
          price_yearly: 2990,
          emoji: '🏆',
          features: {
            max_businesses: -1,
            max_analyses_per_month: -1,
            max_websites: -1,
            priority_support: true,
            custom_domain: true,
            white_label: true,
            api_access: true
          },
          description: 'Pour les équipes et agences',
          tagline: 'Tout illimité + agents personnalisés'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      router.push('/auth/ezia');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/me/subscription', { plan: planKey });
      toast.success(response.data.message);
      setCurrentPlan(planKey);
      
      // Rediriger vers le dashboard après upgrade
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      toast.error("Erreur lors de la mise à jour de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatFeatureValue = (value: number) => {
    return value === -1 ? 'Illimité' : value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement des plans...</p>
        </div>
      </div>
    );
  }

  const planOrder = ['free', 'starter', 'pro', 'enterprise'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebe7e1] via-[#ebe7e1] to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#E0E0E0]/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Choisissez votre équipe Ezia</h1>
            </div>
            
            {/* Toggle Monthly/Yearly */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${!isYearly ? 'text-[#1E1E1E] font-semibold' : 'text-[#666666]'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#E0E0E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D3FC8] focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-[#1E1E1E] font-semibold' : 'text-[#666666]'}`}>
                Annuel
                <Badge className="ml-2 bg-[#6D3FC8] text-white">-2 mois</Badge>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            <span>Votre chef de projet IA et son équipe</span>
          </div>
          <h2 className="text-5xl font-bold text-[#1E1E1E] mb-6">
            Créez vos projets web en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">conversant</span>
          </h2>
          <p className="text-xl text-[#666666] max-w-3xl mx-auto leading-relaxed">
            Ezia est votre chef de projet IA qui coordonne une équipe d'agents spécialisés. 
            Développez votre business avec une équipe d'agents IA dédiée à votre succès.
          </p>
          
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-[#1E1E1E] mb-1">100% Conversationnel</h3>
              <p className="text-sm text-[#666666]">Créez tout en discutant naturellement</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Code2 className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-[#1E1E1E] mb-1">Sans code</h3>
              <p className="text-sm text-[#666666]">Aucune compétence technique requise</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-[#1E1E1E] mb-1">IA Française</h3>
              <p className="text-sm text-[#666666]">Conçu avec Mistral AI</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {planOrder.map((planKey) => {
            const plan = plans[planKey];
            if (!plan) return null;
            
            const isCurrentPlan = currentPlan === planKey;
            const isPro = planKey === 'pro';
            const price = isYearly && plan.price_yearly ? plan.price_yearly : plan.price;
            const monthlyPrice = isYearly && plan.price_yearly ? plan.price_yearly / 12 : plan.price;

            return (
              <Card
                key={planKey}
                className={`relative overflow-hidden transition-all hover:scale-[1.02] ${
                  isPro 
                    ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20' 
                    : 'border border-[#E0E0E0] shadow-md hover:shadow-xl'
                } bg-white`}
              >
                {isPro && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
                {isPro && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-bold text-[#1E1E1E]">
                      {plan.emoji} {plan.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[#666666]">
                    {plan.description}
                  </CardDescription>
                  {plan.tagline && (
                    <p className="text-sm font-medium text-purple-600 mt-2">
                      {plan.tagline}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-[#1E1E1E]">
                        {formatPrice(monthlyPrice)}
                      </span>
                      <span className="text-[#666666] ml-2">/mois</span>
                    </div>
                    {isYearly && plan.price_yearly && (
                      <p className="text-sm text-[#666666] mt-1">
                        Facturé {formatPrice(price)} par an
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        <strong className="text-[#1E1E1E]">{formatFeatureValue(plan.features.max_websites)}</strong> projets digitaux
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        <strong className="text-[#1E1E1E]">{formatFeatureValue(plan.features.max_analyses_per_month)}</strong> conversations/mois
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        Équipe d'agents IA
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.priority_support ? (
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.priority_support ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Support prioritaire
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.custom_domain ? (
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.custom_domain ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Déploiement personnalisé
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.api_access ? (
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.api_access ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Intégrations avancées
                      </span>
                    </li>
                    
                    {planKey === 'enterprise' && (
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#666666]">
                          Agents IA personnalisés
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Plan actuel
                    </Button>
                  ) : (
                    <Button
                      className={`w-full transition-all ${
                        isPro 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg' 
                          : 'hover:border-purple-500 hover:text-purple-600'
                      }`}
                      variant={isPro ? "default" : "outline"}
                      onClick={() => handleUpgrade(planKey)}
                      disabled={loading}
                    >
                      {planKey === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* What's Included Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-[#1E1E1E] mb-6 text-center">
            Ce qui est inclus dans tous les plans
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-[#1E1E1E] mb-2">Ezia, votre chef de projet IA</h4>
              <p className="text-sm text-[#666666]">Un assistant intelligent qui comprend vos besoins et coordonne votre projet</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-[#1E1E1E] mb-2">Une équipe d&apos;agents spécialisés</h4>
              <p className="text-sm text-[#666666]">Design, développement, SEO, marketing - tous les experts dont vous avez besoin</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-[#1E1E1E] mb-2">Hébergement inclus</h4>
              <p className="text-sm text-[#666666]">Vos projets sont hébergés gratuitement avec des performances optimales</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-[#1E1E1E] mb-8">
            Questions fréquentes
          </h3>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <Card className="bg-white border-[#E0E0E0]/50 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-600" />
                  Comment fonctionne Ezia ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Ezia est votre chef de projet IA. Vous lui expliquez votre projet en langage naturel, 
                  et elle coordonne son équipe d'agents pour créer votre site web, landing page ou application. 
                  Tout se fait par conversation, sans code.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-[#E0E0E0]/50 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Qu&apos;est-ce qu&apos;une conversation ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Une conversation est un échange avec Ezia pour créer ou modifier votre projet. 
                  Chaque demande de création, modification ou amélioration compte comme une conversation. 
                  Les discussions simples et questions ne sont pas comptées.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-[#E0E0E0]/50 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Puis-je modifier mon plan ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Oui ! Vous pouvez changer de plan à tout moment. L&apos;upgrade est immédiat, 
                  et si vous passez à un plan inférieur, il prendra effet au prochain cycle de facturation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-[#E0E0E0]/50 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Où sont hébergés mes projets ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Vos projets sont hébergés sur une infrastructure cloud performante et sécurisée. 
                  L&apos;hébergement est inclus dans tous les plans, sans frais supplémentaires.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function TarifsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement des plans...</p>
        </div>
      </div>
    }>
      <TarifsPageContent />
    </Suspense>
  );
}