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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />
                </div>
                <span className="text-xl font-bold">Ezia</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                Comment ça marche
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Tarifs
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="text-gray-300 hover:text-white"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
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
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              <Link href="#features" className="block text-gray-300 hover:text-white transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors">
                Comment ça marche
              </Link>
              <Link href="#pricing" className="block text-gray-300 hover:text-white transition-colors">
                Tarifs
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="w-full text-gray-300 hover:text-white"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
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
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm mb-8">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300">Votre assistante IA business</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Développez votre business
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              avec l'IA
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Ezia est votre cheffe de projet IA qui vous accompagne dans la création et 
            la croissance de votre présence en ligne. Site web, marketing, stratégie - tout en un.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 text-lg px-8 py-6"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-700 hover:border-gray-600 text-white bg-white/5 text-lg px-8 py-6"
              onClick={() => setShowLoginModal(true)}
            >
              Se connecter
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
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
        <div className="absolute top-20 left-10 w-20 h-20 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-violet-900/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-400">
              Une plateforme complète pour développer votre business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Création de site web</h3>
              <p className="text-gray-400 leading-relaxed">
                Générez un site web professionnel en quelques clics avec notre IA. 
                Design moderne, responsive et optimisé SEO.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Analyse de marché</h3>
              <p className="text-gray-400 leading-relaxed">
                Comprenez votre marché, identifiez les opportunités et positionnez 
                votre offre avec l'aide de notre IA.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Stratégie marketing</h3>
              <p className="text-gray-400 leading-relaxed">
                Développez une stratégie marketing complète avec des recommandations 
                personnalisées et actionnables.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Analyse concurrentielle</h3>
              <p className="text-gray-400 leading-relaxed">
                Étudiez vos concurrents et identifiez vos avantages compétitifs 
                pour vous démarquer sur le marché.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Réseaux sociaux</h3>
              <p className="text-gray-400 leading-relaxed">
                Créez du contenu engageant et développez votre présence sur les 
                réseaux sociaux avec notre IA.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Objectifs & KPIs</h3>
              <p className="text-gray-400 leading-relaxed">
                Définissez et suivez vos objectifs business avec des métriques 
                claires et un suivi en temps réel.
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
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-400">
              Lancez votre business en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3">Créez votre business</h3>
              <p className="text-gray-400">
                Décrivez votre projet et vos objectifs. Ezia comprend vos besoins 
                et prépare un plan personnalisé.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3">Lancez votre site</h3>
              <p className="text-gray-400">
                Générez un site web professionnel en quelques clics. 
                Personnalisez-le selon vos préférences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-3">Développez avec l'IA</h3>
              <p className="text-gray-400">
                Utilisez nos outils IA pour analyser, optimiser et faire croître 
                votre business en continu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre idée en business ?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Rejoignez des milliers d'entrepreneurs qui utilisent Ezia pour 
              développer leur présence en ligne.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="bg-white text-black hover:bg-gray-100 text-lg px-10 py-6"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Ezia</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Ezia. Tous droits réservés. Fait avec ❤️ en France
            </p>
          </div>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onClose={setShowLoginModal} />
    </div>
  );
}