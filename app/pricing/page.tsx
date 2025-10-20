"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Sparkles, Zap, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Gratuit") return;

    setLoading(true);
    try {
      // Récupérer les prix depuis les variables d'environnement
      const priceId = billingCycle === "monthly"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY;

      const response = await api.post('/api/stripe/create-checkout-session', {
        priceId,
        billingCycle,
      });

      if (response.data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = response.data.url;
      } else {
        toast.error("Erreur lors de la création de la session de paiement");
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.error || "Erreur lors de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Gratuit",
      price: 0,
      description: "Pour découvrir Ezia et tester les fonctionnalités de base",
      features: [
        "1 business",
        "Analyse de marché basique",
        "Stratégie marketing simplifiée",
        "Calendrier de contenu (10 publications/mois)",
        "Support communautaire"
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
      current: true
    },
    {
      name: "Creator",
      price: billingCycle === "monthly" ? 29 : 290,
      description: "Pour les entrepreneurs qui veulent développer leur présence",
      features: [
        "3 business",
        "Analyse de marché complète (PESTEL, Porter, SWOT)",
        "Stratégie marketing avancée",
        "Calendrier de contenu illimité",
        "Génération de contenu IA optimisé",
        "50 images IA/mois (Stable Diffusion)",
        "Support prioritaire par email",
        "Statistiques détaillées"
      ],
      cta: "Choisir Creator",
      highlighted: true,
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Tarifs</h1>
              <p className="text-sm text-[#666666]">Choisissez le plan qui correspond à vos besoins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 inline-flex shadow-sm border border-[#E0E0E0]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#6D3FC8] text-white shadow-sm"
                  : "text-[#666666] hover:text-[#1E1E1E]"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-[#6D3FC8] text-white shadow-sm"
                  : "text-[#666666] hover:text-[#1E1E1E]"
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? "border-2 border-[#6D3FC8] shadow-xl"
                  : "border border-[#E0E0E0] shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] text-white px-4 py-1 rounded-full text-sm font-medium shadow-md flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Recommandé
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-[#1E1E1E]">
                    {plan.price}€
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[#666666] ml-2">
                      /{billingCycle === "monthly" ? "mois" : "an"}
                    </span>
                  )}
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-[#1E1E1E]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white shadow-md hover:shadow-lg"
                      : plan.current
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border-2 border-[#6D3FC8] text-[#6D3FC8] hover:bg-purple-50"
                  }`}
                  disabled={plan.current || loading}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : plan.current ? (
                    "Plan actuel"
                  ) : (
                    <>
                      {plan.highlighted && <Zap className="w-4 h-4 mr-2" />}
                      {plan.cta}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ ou informations supplémentaires */}
        <div className="mt-16 text-center">
          <p className="text-[#666666] mb-4">
            Vous avez des questions sur nos tarifs ?
          </p>
          <Link
            href="/home"
            className="text-[#6D3FC8] hover:underline font-medium"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}
