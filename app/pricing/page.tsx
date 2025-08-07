"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowLeft, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/components/contexts/user-context";
import { toast } from "sonner";

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
}

export default function PricingPage() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      router.push('/auth');
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
    } catch (error) {
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
      <div className="min-h-screen bg-[#EDEAE3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C837F4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement des plans...</p>
        </div>
      </div>
    );
  }

  const planOrder = ['free', 'starter', 'pro', 'enterprise'];

  return (
    <div className="min-h-screen bg-[#EDEAE3]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Plans et tarifs</h1>
            </div>
            
            {/* Toggle Monthly/Yearly */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${!isYearly ? 'text-[#1E1E1E] font-semibold' : 'text-[#666666]'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#E0E0E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C837F4] focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-[#1E1E1E] font-semibold' : 'text-[#666666]'}`}>
                Annuel
                <Badge className="ml-2 bg-[#C837F4] text-white">-2 mois</Badge>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1E1E1E] mb-4">
            Choisissez votre plan Ezia
          </h2>
          <p className="text-xl text-[#666666]">
            Commencez gratuitement, évoluez selon vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className={`relative overflow-hidden transition-all ${
                  isPro 
                    ? 'border-2 border-[#C837F4] shadow-xl scale-105' 
                    : 'border border-[#E0E0E0] shadow-md hover:shadow-lg'
                } bg-white`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#C837F4] to-[#B028F2] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#1E1E1E]">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-[#666666]">
                    {plan.description}
                  </CardDescription>
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
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        <strong className="text-[#1E1E1E]">{formatFeatureValue(plan.features.max_businesses)}</strong> business
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        <strong className="text-[#1E1E1E]">{formatFeatureValue(plan.features.max_analyses_per_month)}</strong> analyses/mois
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">
                        <strong className="text-[#1E1E1E]">{formatFeatureValue(plan.features.max_websites)}</strong> sites web
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.priority_support ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.priority_support ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Support prioritaire
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.custom_domain ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.custom_domain ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Domaine personnalisé
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      {plan.features.api_access ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.features.api_access ? 'text-[#666666]' : 'text-gray-400'}`}>
                        Accès API
                      </span>
                    </li>
                    
                    {planKey === 'enterprise' && (
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#666666]">
                          Marque blanche
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
                      className={`w-full ${
                        isPro 
                          ? 'bg-gradient-to-r from-[#C837F4] to-[#B028F2] hover:from-[#B028F2] hover:to-[#9B21D5] text-white' 
                          : ''
                      }`}
                      variant={isPro ? "default" : "outline"}
                      onClick={() => handleUpgrade(planKey)}
                      disabled={loading}
                    >
                      {planKey === 'free' ? 'Rétrograder' : 'Choisir ce plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-[#1E1E1E] mb-4">
            Questions fréquentes
          </h3>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Puis-je changer de plan à tout moment ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
                  Les changements sont appliqués immédiatement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Que se passe-t-il si je dépasse mes limites ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Nous vous préviendrons avant d'atteindre vos limites. Vous pourrez alors 
                  passer à un plan supérieur ou attendre le mois suivant pour de nouvelles analyses.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Y a-t-il des frais cachés ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">
                  Non, les prix affichés sont tout compris. Pas de frais de configuration, 
                  pas de coûts cachés. Vous payez uniquement l'abonnement mensuel ou annuel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}