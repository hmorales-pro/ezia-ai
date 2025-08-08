"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Sparkles } from "lucide-react";

export default function GalleryPage() {
  const router = useRouter();

  const examples = [
    {
      title: "Site Vitrine Moderne",
      description: "Un template épuré pour présenter votre entreprise",
      type: "Professionnel",
      preview: "🏢"
    },
    {
      title: "Landing Page Conversion",
      description: "Optimisée pour convertir vos visiteurs en clients",
      type: "Marketing",
      preview: "🚀"
    },
    {
      title: "Portfolio Créatif",
      description: "Montrez vos réalisations avec style",
      type: "Personnel",
      preview: "🎨"
    },
    {
      title: "Blog Minimaliste",
      description: "Partagez vos idées avec élégance",
      type: "Blog",
      preview: "✍️"
    },
    {
      title: "E-commerce Starter",
      description: "Commencez à vendre en ligne rapidement",
      type: "Commerce",
      preview: "🛍️"
    },
    {
      title: "Page Coming Soon",
      description: "Annoncez votre lancement avec impact",
      type: "Lancement",
      preview: "⏰"
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
                <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
                <h1 className="text-xl font-semibold text-[#1E1E1E]">
                  Galerie Ezia
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">
            Inspirez-vous de nos créations
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto">
            Découvrez des exemples de sites créés avec Ezia. Chaque template peut être personnalisé 
            selon vos besoins grâce à notre intelligence artificielle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <Card key={index} className="bg-white border-[#E0E0E0] hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="h-32 bg-gradient-to-br from-[#FAF9F5] to-[#E0E0E0] rounded-lg flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                  {example.preview}
                </div>
                <CardTitle className="text-lg text-[#1E1E1E]">{example.title}</CardTitle>
                <p className="text-sm text-[#666666] mt-2">{example.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-[#6D3FC8]/10 text-[#6D3FC8] px-2 py-1 rounded-full">
                    {example.type}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="text-[#6D3FC8] hover:text-[#5A35A5]"
                  >
                    Utiliser ce modèle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-[#6D3FC8]/10 rounded-lg">
          <Globe className="w-8 h-8 text-[#6D3FC8] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2">
            Créez votre propre site unique
          </h3>
          <p className="text-[#666666] mb-4">
            Ces exemples ne sont qu'un point de départ. Avec Ezia, créez exactement le site dont vous avez besoin.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
          >
            Commencer maintenant
          </Button>
        </div>
      </main>
    </div>
  );
}