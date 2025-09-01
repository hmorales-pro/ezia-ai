'use client';

import { useState } from 'react';
import { Metadata } from "next";
import LandingNavbar from "@/components/landing-navbar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Code, 
  Palette, 
  TrendingUp, 
  Users, 
  Zap,
  Clock,
  ArrowRight,
  X
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";

const guides = [
  {
    id: 1,
    category: "Démarrage",
    title: "Créer votre premier site avec Ezia",
    description: "Guide complet pour lancer votre présence en ligne en 15 minutes",
    readTime: "10 min",
    level: "Débutant",
    icon: Code,
    color: "bg-blue-500",
    topics: ["Configuration initiale", "Choix du design", "Publication"]
  },
  {
    id: 2,
    category: "Marketing",
    title: "Stratégie marketing pour entrepreneurs",
    description: "Les bases du marketing digital pour faire décoller votre business",
    readTime: "15 min",
    level: "Débutant",
    icon: TrendingUp,
    color: "bg-purple-500",
    topics: ["SEO", "Réseaux sociaux", "Email marketing"]
  },
  {
    id: 3,
    category: "Design",
    title: "Principes de design pour votre site",
    description: "Comment créer un site qui convertit vos visiteurs en clients",
    readTime: "12 min",
    level: "Intermédiaire",
    icon: Palette,
    color: "bg-pink-500",
    topics: ["UX/UI", "Couleurs", "Typographie"]
  },
  {
    id: 4,
    category: "Croissance",
    title: "Analyser et optimiser vos performances",
    description: "Utilisez les données pour prendre les bonnes décisions",
    readTime: "20 min",
    level: "Avancé",
    icon: TrendingUp,
    color: "bg-green-500",
    topics: ["Analytics", "A/B Testing", "Conversion"]
  },
  {
    id: 5,
    category: "IA",
    title: "Maximiser l'utilisation d'Ezia",
    description: "Trucs et astuces pour tirer le meilleur parti de votre équipe IA",
    readTime: "8 min",
    level: "Tous niveaux",
    icon: Zap,
    color: "bg-orange-500",
    topics: ["Prompts efficaces", "Automatisation", "Collaboration"]
  },
  {
    id: 6,
    category: "Business",
    title: "De l'idée au lancement",
    description: "Validez votre idée et lancez votre business avec confiance",
    readTime: "25 min",
    level: "Débutant",
    icon: Users,
    color: "bg-indigo-500",
    topics: ["Validation", "Business plan", "Premiers clients"]
  }
];

export default function GuidesPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null);

  const handleGuideClick = (guide: typeof guides[0]) => {
    setSelectedGuide(guide);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Guides et Ressources
            </h1>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Apprenez à créer, développer et faire grandir votre business avec nos guides pratiques
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Card 
                key={guide.id} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleGuideClick(guide)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${guide.color} flex items-center justify-center`}>
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary">{guide.level}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{guide.readTime} de lecture</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-[#6D3FC8] transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-[#6D3FC8] group-hover:text-white transition-all"
                  >
                    Lire le guide
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Accès anticipé requis
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {selectedGuide && (
                <span className="font-medium text-[#1E1E1E]">
                  Guide : {selectedGuide.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Image
                src="/img/mascottes/Ezia.png"
                alt="Ezia"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <p className="text-[#666666] mb-4">
                Nos guides détaillés sont exclusifs aux membres de la liste d'attente. 
                Rejoignez-nous pour accéder à toutes nos ressources et être parmi les premiers 
                à utiliser Ezia !
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/waitlist" className="block">
                <Button className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                  Rejoindre la liste d'attente
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowModal(false)}
              >
                Continuer à explorer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}