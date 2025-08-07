"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare,
  Code2,
  Palette,
  Users,
  PenTool,
  Star,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

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
      description: "Rédige et optimise votre contenu pour le web",
      icon: PenTool,
      color: "from-orange-500 to-red-600"
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: "100% Conversationnel",
      description: "Créez tout simplement en discutant avec Ezia et son équipe"
    },
    {
      icon: Code2,
      title: "Sans code requis",
      description: "Aucune compétence technique nécessaire, l'équipe s'occupe de tout"
    },
    {
      icon: Zap,
      title: "Livraison rapide",
      description: "Obtenez votre site web professionnel en quelques minutes"
    },
    {
      icon: Target,
      title: "Optimisé pour vous",
      description: "Chaque projet est personnalisé selon vos besoins spécifiques"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAF9F5] via-white to-purple-50/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Votre chef de projet IA et son équipe</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discutez. Créez. Lancez
              <br />
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent">
                votre projet.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#666666] mb-8 max-w-3xl mx-auto">
              Ezia coordonne une équipe d'experts IA pour créer votre site web professionnel.
              Pas de code, pas de stress, juste une conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white shadow-lg hover:shadow-xl transition-all">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-[#6D3FC8] text-[#6D3FC8] hover:bg-[#6D3FC8] hover:text-white">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-[#666666]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Projets illimités</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-[#666666]">Créez votre projet en 3 étapes simples</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Décrivez votre projet",
                description: "Expliquez à Ezia ce que vous voulez créer, vos objectifs et votre vision"
              },
              {
                step: "2",
                title: "L'équipe travaille",
                description: "Nos agents IA collaborent pour créer votre site web sur mesure"
              },
              {
                step: "3",
                title: "Publiez en un clic",
                description: "Votre site est prêt ! Publiez-le instantanément ou personnalisez-le davantage"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#6D3FC8] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[#666666]">{item.description}</p>
                </div>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-[#E0E0E0]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Rencontrez votre équipe</h2>
            <p className="text-xl text-[#666666]">
              Ezia coordonne une équipe d'experts IA spécialisés
            </p>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full flex items-center justify-center text-6xl shadow-xl">
                  👩‍💼
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mt-4">Ezia</h3>
              <p className="text-[#666666]">Votre chef de projet IA</p>
              <p className="text-sm text-[#666666] mt-2 max-w-md mx-auto">
                Je coordonne l'équipe et m'assure que votre vision devienne réalité
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 bg-gradient-to-br ${agent.color} rounded-full flex items-center justify-center mb-4`}>
                  <agent.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                <p className="text-sm text-[#6D3FC8] font-medium mb-3">{agent.role}</p>
                <p className="text-[#666666] text-sm">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Ezia ?</h2>
            <p className="text-xl text-[#666666]">La création de site web réinventée</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#6D3FC8]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#666666] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à lancer votre projet ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'entrepreneurs qui ont choisi Ezia pour créer leur présence en ligne
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-[#6D3FC8] hover:bg-gray-100 shadow-lg">
              Commencer maintenant - C'est gratuit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[#666666]">
              © 2024 Ezia. Créé avec ❤️ par une équipe d'IA passionnée.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}