"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, MessageCircle, Book, Zap } from "lucide-react";

export default function HelpPage() {
  const router = useRouter();

  const faqItems = [
    {
      question: "Comment créer mon premier site avec Ezia ?",
      answer: "C'est simple ! Commencez par créer un business depuis le tableau de bord, puis cliquez sur 'Créer un site web'. Ezia vous guidera à travers le processus en vous posant quelques questions pour personnaliser votre site."
    },
    {
      question: "Puis-je modifier mon site après sa création ?",
      answer: "Bien sûr ! Vous pouvez modifier votre site à tout moment. Utilisez le chat pour demander des modifications ou cliquez directement sur les éléments que vous souhaitez changer."
    },
    {
      question: "Comment publier mon site en ligne ?",
      answer: "Une fois satisfait de votre site, cliquez sur le bouton 'Publier' dans l'éditeur. Choisissez un nom pour votre site et il sera automatiquement mis en ligne."
    },
    {
      question: "Quelles sont les limites du plan gratuit ?",
      answer: "Le plan gratuit vous permet de créer jusqu'à 3 sites web et d'avoir 10 conversations par mois avec Ezia. Pour plus de fonctionnalités, consultez nos plans premium."
    },
    {
      question: "Comment fonctionne l'intelligence artificielle d'Ezia ?",
      answer: "Ezia utilise une équipe d'agents IA spécialisés qui travaillent ensemble pour créer votre site. Chaque agent a son expertise : design, contenu, technique, etc."
    }
  ];

  const helpCategories = [
    {
      icon: Book,
      title: "Guide de démarrage",
      description: "Apprenez les bases pour bien commencer avec Ezia",
      action: "Lire le guide"
    },
    {
      icon: MessageCircle,
      title: "Support par chat",
      description: "Posez vos questions directement à notre équipe",
      action: "Ouvrir le chat"
    },
    {
      icon: Zap,
      title: "Tutoriels vidéo",
      description: "Découvrez Ezia en action avec nos vidéos",
      action: "Voir les vidéos"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <header className="border-b border-[#E0E0E0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-[#666666] hover:text-[#1E1E1E] hover:bg-[#F5F5F5]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6D3FC8]" />
                <h1 className="text-xl font-semibold text-[#1E1E1E]">
                  Centre d'aide Ezia
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">
            Comment pouvons-nous vous aider ?
          </h2>
          <p className="text-lg text-[#666666]">
            Trouvez des réponses à vos questions ou contactez notre équipe de support
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="bg-white border-[#E0E0E0] hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Icon className="w-12 h-12 text-[#6D3FC8] mx-auto mb-4" />
                  <CardTitle className="text-lg text-[#1E1E1E]">{category.title}</CardTitle>
                  <CardDescription className="text-[#666666]">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#E0E0E0] text-[#6D3FC8] hover:bg-[#6D3FC8]/10"
                  >
                    {category.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-6">
            Questions fréquentes
          </h3>
          {faqItems.map((item, index) => (
            <Card key={index} className="bg-white border-[#E0E0E0]">
              <CardHeader>
                <CardTitle className="text-lg text-[#1E1E1E]">
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#666666]">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-[#6D3FC8]/10 rounded-lg">
          <MessageCircle className="w-8 h-8 text-[#6D3FC8] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2">
            Besoin d'aide supplémentaire ?
          </h3>
          <p className="text-[#666666] mb-4">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !
          </p>
          <Button 
            className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
          >
            Contactez le support
          </Button>
        </div>
      </main>
    </div>
  );
}