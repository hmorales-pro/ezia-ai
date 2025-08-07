"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/login-modal";
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Globe, 
  Target, 
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle,
  Star,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDEAE3] text-[#1E1E1E] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                </div>
                <span className="text-xl font-bold text-[#1E1E1E]">Ezia</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Comment ça marche
              </Link>
              <Link href="#pricing" className="text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Tarifs
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="text-[#666666] hover:text-[#1E1E1E] border-[#E0E0E0] hover:bg-gray-50"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#C837F4] to-[#B028F2] hover:from-[#B028F2] hover:to-[#9B21D5] text-white border-0 shadow-md hover:shadow-lg transition-all"
              >
                Commencer gratuitement
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link href="#features" className="block text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="block text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Comment ça marche
              </Link>
              <Link href="#pricing" className="block text-[#666666] hover:text-[#1E1E1E] transition-colors">
                Tarifs
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="w-full text-[#666666] hover:text-[#1E1E1E] border-[#E0E0E0] hover:bg-gray-50"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-[#C837F4] to-[#B028F2] hover:from-[#B028F2] hover:to-[#9B21D5] text-white border-0 shadow-md hover:shadow-lg transition-all"
              >
                Commencer gratuitement
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#C837F4]/10 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C837F4]/10 border border-[#C837F4]/20 rounded-full text-sm mb-8">
            <Zap className="w-4 h-4 text-[#C837F4]" />
            <span className="text-[#666666]">Votre agence digitale propulsée par l'IA</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Votre agence digitale
            <br />
            <span className="bg-gradient-to-r from-[#C837F4] to-[#B028F2] bg-clip-text text-transparent">
              qui travaille 24/7
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#666666] mb-10 max-w-3xl mx-auto leading-relaxed">
            Ezia réunit une équipe d'experts IA spécialisés pour propulser 
            votre business en ligne. De la création web à la stratégie marketing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-[#C837F4] to-[#B028F2] hover:from-[#B028F2] hover:to-[#9B21D5] text-white border-0 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#E0E0E0] hover:border-[#C837F4] text-[#1E1E1E] bg-white hover:bg-gray-50 text-lg px-8 py-6 shadow-md hover:shadow-lg transition-all"
              onClick={() => setShowLoginModal(true)}
            >
              Se connecter
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[#666666]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Gratuit pour commencer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pas de carte requise</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>IA française</span>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#C837F4]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#B028F2]/20 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Une équipe complète d'experts IA
            </h2>
            <p className="text-xl text-[#666666]">
              Chaque agent spécialisé dans son domaine pour votre succès
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Web Designer</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre expert IA en développement web crée des sites professionnels, 
                modernes et optimisés SEO en quelques minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Analyste Marché</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre analyste IA étudie votre marché, identifie les opportunités 
                et positionne votre offre pour maximiser votre impact.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Marketing Stratégique</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre stratège marketing IA conçoit des campagnes personnalisées 
                avec des recommandations actionnables pour votre croissance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Veille Concurrentielle</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre expert en compétition analyse vos concurrents et identifie 
                vos avantages uniques pour dominer votre marché.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Social Media</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre community manager IA crée du contenu viral et gère 
                votre présence sur tous les réseaux sociaux.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white backdrop-blur-sm border border-[#E0E0E0] rounded-2xl p-8 hover:shadow-lg transition-all shadow-md">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Agent Business Analyst</h3>
              <p className="text-[#666666] leading-relaxed">
                Notre analyste business suit vos KPIs, optimise vos performances 
                et vous guide vers vos objectifs avec précision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Votre agence en action
            </h2>
            <p className="text-xl text-[#666666]">
              Démarrez avec votre équipe d'experts IA en 3 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 text-white shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3">Briefez votre agence</h3>
              <p className="text-[#666666]">
                Décrivez votre projet et vos objectifs. Notre équipe d'IA comprend 
                vos besoins et prépare un plan personnalisé.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 text-white shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3">L'agence se met au travail</h3>
              <p className="text-[#666666]">
                Nos agents créent votre site, analysent votre marché et 
                préparent votre stratégie de lancement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 text-white shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-3">Croissance continue</h3>
              <p className="text-[#666666]">
                Votre équipe d'agents travaille 24/7 pour optimiser, 
                analyser et faire croître votre business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white backdrop-blur-xl border border-[#E0E0E0] rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre idée en business ?
            </h2>
            <p className="text-xl text-[#666666] mb-8">
              Rejoignez des milliers d'entrepreneurs qui font confiance à Ezia 
              pour développer leur présence en ligne.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-[#C837F4] to-[#B028F2] text-white hover:from-[#B028F2] hover:to-[#9B21D5] text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0E0E0] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#C837F4] to-[#B028F2] rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#1E1E1E]">Ezia</span>
            </div>
            <p className="text-[#666666] text-sm">
              © 2024 Ezia. Tous droits réservés. Fait avec ❤️ en France
            </p>
          </div>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onClose={setShowLoginModal} />
    </div>
  );
}