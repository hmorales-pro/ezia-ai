"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { AppNavbar } from "@/components/app-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Globe, MessageSquare, FileText, Zap, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

interface UsageData {
  plan: string;
  limits: {
    businesses: { used: number; total: number };
    analyses: { used: number; total: number };
    websites: { used: number; total: number };
    aiRequests: { used: number; total: number };
  };
  period: {
    start: string;
    end: string;
  };
  isBetaTester?: boolean;
  hasUnlimitedAccess?: boolean;
}

export default function UsagePage() {
  const router = useRouter();
  const { user } = useUser();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await api.get("/api/me/usage");
      setUsageData(response.data);
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    if (total === -1) return 0; // Unlimited
    return Math.round((used / total) * 100);
  };

  const getUsageColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return "text-purple-600";
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const formatLimit = (total: number) => {
    return total === -1 ? '∞' : total;
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (loading || !usageData) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D3FC8] mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement...</p>
        </div>
      </div>
    );
  }

  const isUnlimited = usageData.isBetaTester || usageData.hasUnlimitedAccess;

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <AppNavbar title="Utilisation" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan actuel */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plan actuel : {usageData.plan}</CardTitle>
                <CardDescription>
                  {isUnlimited ? (
                    <span className="text-purple-600 font-medium">✨ Accès illimité</span>
                  ) : (
                    `Période : du ${new Date(usageData.period.start).toLocaleDateString('fr-FR')} au ${new Date(usageData.period.end).toLocaleDateString('fr-FR')}`
                  )}
                </CardDescription>
              </div>
              {!isUnlimited && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] text-white hover:from-[#5A35A5] hover:to-[#4A2B87]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Améliorer mon plan
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Beta Tester Badge */}
        {isUnlimited && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 text-white rounded-full p-3">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-purple-900">Beta Tester - Accès Illimité</h3>
                  <p className="text-purple-700">Vous avez accès à toutes les fonctionnalités sans limite ! Merci de tester Ezia ✨</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques d'utilisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#6D3FC8]" />
                  Business
                </CardTitle>
                <span className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usageData.limits.businesses.used, usageData.limits.businesses.total), isUnlimited)}`}>
                  {usageData.limits.businesses.used}/{formatLimit(usageData.limits.businesses.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!isUnlimited && (
                <Progress
                  value={getUsagePercentage(usageData.limits.businesses.used, usageData.limits.businesses.total)}
                  className="h-3 mb-2"
                />
              )}
              <p className="text-sm text-[#666666]">
                {isUnlimited
                  ? `Vous avez créé ${usageData.limits.businesses.used} business (illimité)`
                  : `Vous avez créé ${usageData.limits.businesses.used} business sur ${usageData.limits.businesses.total} autorisés`
                }
              </p>
            </CardContent>
          </Card>

          {/* Analyses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#6D3FC8]" />
                  Analyses
                </CardTitle>
                <span className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usageData.limits.analyses.used, usageData.limits.analyses.total), isUnlimited)}`}>
                  {usageData.limits.analyses.used}/{formatLimit(usageData.limits.analyses.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!isUnlimited && (
                <Progress
                  value={getUsagePercentage(usageData.limits.analyses.used, usageData.limits.analyses.total)}
                  className="h-3 mb-2"
                />
              )}
              <p className="text-sm text-[#666666]">
                {isUnlimited
                  ? `${usageData.limits.analyses.used} analyses effectuées (illimité)`
                  : `${usageData.limits.analyses.used} analyses effectuées ce mois-ci`
                }
              </p>
            </CardContent>
          </Card>

          {/* Projets digitaux */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#6D3FC8]" />
                  Projets digitaux
                </CardTitle>
                <span className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usageData.limits.websites.used, usageData.limits.websites.total), isUnlimited)}`}>
                  {usageData.limits.websites.used}/{formatLimit(usageData.limits.websites.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!isUnlimited && (
                <Progress
                  value={getUsagePercentage(usageData.limits.websites.used, usageData.limits.websites.total)}
                  className="h-3 mb-2"
                />
              )}
              <p className="text-sm text-[#666666]">
                {isUnlimited
                  ? `${usageData.limits.websites.used} projet${usageData.limits.websites.used > 1 ? 's' : ''} digital${usageData.limits.websites.used > 1 ? 'aux' : ''} créé${usageData.limits.websites.used > 1 ? 's' : ''} (illimité)`
                  : `${usageData.limits.websites.used} projet${usageData.limits.websites.used > 1 ? 's' : ''} digital${usageData.limits.websites.used > 1 ? 'aux' : ''} créé${usageData.limits.websites.used > 1 ? 's' : ''}`
                }
              </p>
            </CardContent>
          </Card>

          {/* Requêtes IA */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#6D3FC8]" />
                  Requêtes IA
                </CardTitle>
                <span className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usageData.limits.aiRequests.used, usageData.limits.aiRequests.total), isUnlimited)}`}>
                  {usageData.limits.aiRequests.used}/{formatLimit(usageData.limits.aiRequests.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!isUnlimited && (
                <Progress
                  value={getUsagePercentage(usageData.limits.aiRequests.used, usageData.limits.aiRequests.total)}
                  className="h-3 mb-2"
                />
              )}
              <p className="text-sm text-[#666666]">
                {isUnlimited
                  ? "Interactions illimitées avec l'équipe Ezia"
                  : "Interactions avec l'équipe Ezia"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Historique détaillé */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6D3FC8]" />
              Historique détaillé
            </CardTitle>
            <CardDescription>
              Consultez votre historique d'utilisation détaillé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-[#666666] mb-4">
                L'historique détaillé sera bientôt disponible
              </p>
              <Button variant="outline" disabled>
                Télécharger le rapport
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conseils d'optimisation */}
        {!isUnlimited && (
          <Card className="mt-8 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">💡 Conseils d'optimisation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li>• Groupez vos analyses pour économiser vos quotas</li>
                <li>• Utilisez les modèles de sites pour gagner du temps</li>
                <li>• Planifiez vos interactions avec Ezia pour maximiser l'efficacité</li>
                <li>• Passez au plan supérieur pour débloquer plus de fonctionnalités</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
