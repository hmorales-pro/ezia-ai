"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building2, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Globe,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { LoginModal } from "@/components/login-modal";

interface Business {
  business_id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  website_url?: string;
  _createdAt: string;
  completion_score?: number;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      fetchBusinesses();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get("/api/me/business");
      if (response.data.ok) {
        setBusinesses(response.data.businesses);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    router.push("/business/new");
  };

  const handleBusinessClick = (businessId: string) => {
    router.push(`/business/${businessId}`);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-500" />
              <h1 className="text-2xl font-bold">Ezia</h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-zinc-400">
                    Bonjour, {user.fullname || user.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/projects")}
                  >
                    Projets Web
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  Se connecter
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Votre cheffe de projet IA
            </h2>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Je suis Ezia, votre assistante IA qui vous accompagne dans le développement 
              de votre présence en ligne et la croissance de votre business.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleCreateBusiness}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Business
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/chat")}
                disabled={!user || businesses.length === 0}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Parler avec Ezia
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Grid */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-2xl font-bold mb-8">Vos Business</h3>
          
          {businesses.length === 0 ? (
            <Card className="p-12 text-center bg-zinc-900 border-zinc-800">
              <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">
                Aucun business pour le moment
              </h4>
              <p className="text-zinc-400 mb-6">
                Commencez par créer votre premier business pour bénéficier 
                de l&apos;accompagnement complet d&apos;Ezia.
              </p>
              <Button onClick={handleCreateBusiness} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier business
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card
                  key={business.business_id}
                  className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group"
                  onClick={() => handleBusinessClick(business.business_id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Building2 className="w-8 h-8 text-violet-500" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      business.stage === 'idea' ? 'bg-blue-500/20 text-blue-400' :
                      business.stage === 'startup' ? 'bg-green-500/20 text-green-400' :
                      business.stage === 'growth' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {business.stage}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                    {business.name}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {business.industry}
                    </span>
                    {business.website_url && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Site web
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Score: {business.completion_score || 0}%
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Add New Business Card */}
              <Card
                className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group border-dashed"
                onClick={handleCreateBusiness}
              >
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Plus className="w-12 h-12 text-zinc-600 group-hover:text-violet-400 mb-4 transition-colors" />
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                    Nouveau Business
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Ajoutez un nouveau business à votre portfolio
                  </p>
                </div>
              </Card>
            </div>
          )}
        </section>
      )}

      {/* Features Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Comment Ezia vous accompagne
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <TrendingUp className="w-8 h-8 text-violet-500 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Analyse de marché</h4>
              <p className="text-sm text-zinc-400">
                Je vous aide à comprendre votre marché, identifier les opportunités 
                et positionner votre offre.
              </p>
            </Card>
            
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <Globe className="w-8 h-8 text-violet-500 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Présence en ligne</h4>
              <p className="text-sm text-zinc-400">
                Création de sites web, stratégie réseaux sociaux et optimisation 
                de votre visibilité digitale.
              </p>
            </Card>
            
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <MessageSquare className="w-8 h-8 text-violet-500 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Accompagnement continu</h4>
              <p className="text-sm text-zinc-400">
                Un suivi personnalisé avec des recommandations adaptées à 
                l&apos;évolution de votre business.
              </p>
            </Card>
          </div>
        </section>
      )}

      <LoginModal open={showLoginModal} onClose={setShowLoginModal} />
    </div>
  );
}