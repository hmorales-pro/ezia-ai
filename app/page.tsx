import RedirectPage from "./redirect-page";

export default function Page() {
  return <RedirectPage />;
}

/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/login-modal";
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare,
  Code2,
  Palette,
  Users,
  PenTool,
  Star,
  Menu,
  X,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const agents = [
    {
      name: "Kiko",
      role: "Expert Développement",
      description: "Transforme vos idées en code propre et performant",
      icon: Code2,
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "Milo",
      role: "Expert Branding & Naming",
      description: "Crée votre identité de marque unique et mémorable",
      icon: Palette,
      color: "from-purple-500 to-pink-600"
    },
    {
      name: "Yuna",
      role: "Expert UX & Recherche",
      description: "Conçoit des expériences utilisateur intuitives",
      icon: Users,
      color: "from-green-500 to-teal-600"
    },
    {
      name: "Vera",
      role: "Expert Contenu & SEO",
      description: "Rédige du contenu optimisé qui convertit",
      icon: PenTool,
      color: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      quote: "J'ai créé ma landing page en 20 minutes simplement en discutant avec Ezia. Incroyable !",
      author: "Marie L.",
      role: "Coach en développement personnel",
      rating: 5
    },
    {
      quote: "L'équipe d'IA a généré tout mon site e-commerce. Plus besoin de freelances coûteux.",
      author: "Thomas D.",
      role: "Fondateur startup",
      rating: 5
    },
    {
      quote: "Ezia comprend vraiment mes besoins. C'est comme avoir une vraie cheffe de projet.",
      author: "Sophie R.",
      role: "Consultante indépendante",
      rating: 5
    }
  ];

  const useCases = [
    {
      title: "Sites vitrines",
      description: "Présentez votre activité avec style",
      icon: "🏢"
    },
    {
      title: "Landing pages",
      description: "Convertissez vos visiteurs en clients",
      icon: "🚀"
    },
    {
      title: "Blogs professionnels",
      description: "Partagez votre expertise",
      icon: "📝"
    },
    {
      title: "Projets SaaS",
      description: "Lancez votre application web",
      icon: "💻"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                </div>
                <span className="text-xl font-bold text-[#1E1E1E]">Ezia</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#equipe" className="text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                L'équipe
              </Link>
              <Link href="#comment" className="text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                Comment ça marche
              </Link>
              <Link href="#temoignages" className="text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                Témoignages
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="text-[#666666] hover:text-[#6D3FC8] font-medium"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                Commencer gratuitement
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
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
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
            <div className="px-4 py-6 space-y-4">
              <Link href="#equipe" className="block text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                L'équipe
              </Link>
              <Link href="#comment" className="block text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                Comment ça marche
              </Link>
              <Link href="#temoignages" className="block text-[#666666] hover:text-[#6D3FC8] transition-colors font-medium">
                Témoignages
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowLoginModal(true)}
                className="w-full text-[#666666] hover:text-[#6D3FC8] font-medium"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg font-medium"
              >
                Commencer gratuitement
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#6D3FC8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5A35A5]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#6D3FC8]/20 rounded-full text-sm mb-8 shadow-sm">
              <MessageSquare className="w-4 h-4 text-[#6D3FC8]" />
              <span className="text-[#666666] font-medium">Votre cheffe de projet digitale IA</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discutez. Créez.
              <br />
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] bg-clip-text text-transparent">
                Lancez votre projet.
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#666666] mb-10 max-w-3xl mx-auto leading-relaxed">
              Ezia, votre cheffe de projet IA, orchestre une équipe d'experts
              pour créer votre site web, landing page ou SaaS. 
              <span className="font-semibold text-[#1E1E1E]"> Juste en discutant.</span>
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Parler à Ezia gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-[#E0E0E0] hover:border-[#6D3FC8] text-[#1E1E1E] bg-white/80 backdrop-blur-sm hover:bg-white text-lg px-8 py-6 transition-all duration-300"
                onClick={() => document.getElementById('comment')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Voir comment ça marche
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#666666]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>100% gratuit pour commencer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Aucune carte requise</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>IA 100% française</span>
              </div>
            </div>
          </div>

          {/* Use cases grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:border-[#6D3FC8]/20">
                <div className="text-3xl mb-2">{useCase.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{useCase.title}</h3>
                <p className="text-xs text-[#666666]">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Team Section */}
      <section id="equipe" className="py-20 px-4 bg-gradient-to-b from-transparent via-white/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Une équipe d'experts IA à votre service
            </h2>
            <p className="text-xl text-[#666666] max-w-2xl mx-auto">
              Ezia coordonne une équipe spécialisée pour chaque aspect de votre projet
            </p>
          </div>

          {/* Ezia - Main Project Manager */}
          <div className="bg-gradient-to-br from-[#6D3FC8]/10 to-[#5A35A5]/10 border-2 border-[#6D3FC8]/20 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  Ezia
                  <span className="text-sm bg-[#6D3FC8]/10 text-[#6D3FC8] px-3 py-1 rounded-full font-medium">Cheffe de projet</span>
                </h3>
                <p className="text-[#666666] mb-4">
                  Votre interlocutrice unique qui comprend vos besoins, planifie votre projet et coordonne toute l'équipe. 
                  Elle s'assure que chaque expert contribue au bon moment pour un résultat parfait.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="text-xs bg-white/80 px-3 py-1 rounded-full">Gestion de projet</span>
                  <span className="text-xs bg-white/80 px-3 py-1 rounded-full">Coordination d'équipe</span>
                  <span className="text-xs bg-white/80 px-3 py-1 rounded-full">Vision stratégique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team members grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {agents.map((agent, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-[#6D3FC8]/20">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <agent.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
                    <p className="text-sm text-[#6D3FC8] font-medium mb-2">{agent.role}</p>
                    <p className="text-[#666666] text-sm">{agent.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Conversational approach */}
      <section id="comment" className="py-20 px-4 bg-[#FAF9F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Créez simplement en discutant
            </h2>
            <p className="text-xl text-[#666666] max-w-2xl mx-auto">
              Pas de drag & drop, pas de complexité. Juste une conversation naturelle.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Conversation examples */}
            <div className="space-y-6 mb-12">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-[#6D3FC8] text-white rounded-2xl rounded-br-none px-6 py-4 max-w-md shadow-lg">
                  <p className="text-sm font-medium mb-1">Vous</p>
                  <p>J'aimerais créer un site pour mon activité de coaching en développement personnel</p>
                </div>
              </div>

              {/* Ezia response */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-6 py-4 max-w-md shadow-lg">
                  <p className="text-sm font-medium mb-1 text-[#6D3FC8]">Ezia</p>
                  <p className="text-[#666666]">
                    Parfait ! Je vais coordonner l'équipe pour créer votre site de coaching. 
                    Commençons par définir votre identité. Quel message voulez-vous transmettre à vos clients ?
                  </p>
                </div>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-[#6D3FC8] text-white rounded-2xl rounded-br-none px-6 py-4 max-w-md shadow-lg">
                  <p className="text-sm font-medium mb-1">Vous</p>
                  <p>Je veux inspirer la transformation personnelle avec bienveillance</p>
                </div>
              </div>

              {/* Ezia response with team */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-6 py-4 max-w-lg shadow-lg">
                  <p className="text-sm font-medium mb-1 text-[#6D3FC8]">Ezia</p>
                  <p className="text-[#666666] mb-3">
                    Excellent ! L'équipe se met au travail :
                  </p>
                  <div className="space-y-2 pl-4 border-l-2 border-[#6D3FC8]/20">
                    <p className="text-sm text-[#666666]"><span className="font-semibold">Milo</span> prépare votre identité visuelle chaleureuse</p>
                    <p className="text-sm text-[#666666]"><span className="font-semibold">Yuna</span> conçoit un parcours utilisateur intuitif</p>
                    <p className="text-sm text-[#666666]"><span className="font-semibold">Vera</span> rédige vos contenus inspirants</p>
                    <p className="text-sm text-[#666666]"><span className="font-semibold">Kiko</span> code votre site avec les dernières technologies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process steps */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Décrivez votre projet</h3>
                <p className="text-[#666666]">
                  Parlez naturellement de vos besoins et objectifs à Ezia
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">L'équipe s'active</h3>
                <p className="text-[#666666]">
                  Chaque expert IA contribue selon sa spécialité
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Votre projet est prêt</h3>
                <p className="text-[#666666]">
                  Recevez un site professionnel, optimisé et personnalisé
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ils ont fait confiance à Ezia
            </h2>
            <p className="text-xl text-[#666666]">
              Des entrepreneurs comme vous qui ont transformé leurs idées en réalité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#FAF9F5] rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#6D3FC8] text-[#6D3FC8]" />
                  ))}
                </div>
                <p className="text-[#666666] mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-[#666666]">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#6D3FC8]/5 to-[#5A35A5]/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à discuter de votre projet ?
            </h2>
            <p className="text-xl text-[#666666] mb-8 max-w-2xl mx-auto">
              Ezia et son équipe d'experts IA sont prêts à transformer vos idées en 
              projets digitaux professionnels. Commencez gratuitement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] text-white hover:from-[#5A35A5] hover:to-[#4A2B87] text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Commencer ma conversation
                <MessageSquare className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#666666]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6D3FC8]" />
                <span>Création en minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#6D3FC8]" />
                <span>100% personnalisé</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#6D3FC8]" />
                <span>Optimisé SEO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-[#1E1E1E]">Ezia</span>
              </div>
              <p className="text-[#666666] mb-4 max-w-md">
                Votre cheffe de projet digitale IA qui transforme vos idées en projets web professionnels, 
                simplement en discutant.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E0E0E0] hover:border-[#6D3FC8] hover:text-[#6D3FC8]"
                  onClick={() => router.push("/dashboard")}
                >
                  Essayer gratuitement
                </Button>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-[#666666]">
                <li><Link href="#equipe" className="hover:text-[#6D3FC8] transition-colors">L'équipe IA</Link></li>
                <li><Link href="#comment" className="hover:text-[#6D3FC8] transition-colors">Comment ça marche</Link></li>
                <li><Link href="#temoignages" className="hover:text-[#6D3FC8] transition-colors">Témoignages</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-[#666666]">
                <li><Link href="/about" className="hover:text-[#6D3FC8] transition-colors">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-[#6D3FC8] transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-[#6D3FC8] transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#666666] text-sm">
                © 2024 Ezia. Tous droits réservés. Fait avec ❤️ en France
              </p>
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <span>IA 100% française</span>
                <span>•</span>
                <span>Données sécurisées</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onClose={setShowLoginModal} />
    </div>
  );
}