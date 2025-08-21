"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  PlayCircle,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Building2,
  Users,
  Globe,
  Palette,
  PenTool,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";
import { Footer } from "@/components/ui/footer";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  steps: number;
  icon: any;
  color: string;
  popular?: boolean;
}

const guides: Guide[] = [
  {
    id: "getting-started",
    title: "Démarrer avec Ezia : Guide complet",
    description: "Apprenez à créer votre premier site web et à configurer votre business en moins de 30 minutes.",
    category: "Démarrage",
    difficulty: "Débutant",
    duration: "30 min",
    steps: 5,
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
    popular: true
  },
  {
    id: "website-optimization",
    title: "Optimiser votre site pour les conversions",
    description: "Techniques avancées pour transformer vos visiteurs en clients avec l'aide de nos agents IA.",
    category: "Optimisation",
    difficulty: "Intermédiaire",
    duration: "45 min",
    steps: 8,
    icon: Target,
    color: "from-green-500 to-teal-600"
  },
  {
    id: "marketing-strategy",
    title: "Créer une stratégie marketing gagnante",
    description: "Guide étape par étape pour développer votre présence en ligne et attirer plus de clients.",
    category: "Marketing",
    difficulty: "Intermédiaire",
    duration: "60 min",
    steps: 10,
    icon: TrendingUp,
    color: "from-purple-500 to-pink-600",
    popular: true
  },
  {
    id: "ecommerce-setup",
    title: "Lancer votre boutique en ligne",
    description: "De la création à la première vente : tout ce qu'il faut savoir pour réussir en e-commerce.",
    category: "E-commerce",
    difficulty: "Intermédiaire",
    duration: "90 min",
    steps: 12,
    icon: Building2,
    color: "from-orange-500 to-red-600"
  },
  {
    id: "seo-mastery",
    title: "Maîtriser le SEO avec Ezia",
    description: "Comment nos agents IA optimisent votre référencement pour dominer Google.",
    category: "SEO",
    difficulty: "Avancé",
    duration: "75 min",
    steps: 15,
    icon: Globe,
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "brand-identity",
    title: "Construire votre identité de marque",
    description: "Créez une marque mémorable avec l'aide de nos agents spécialisés en design et branding.",
    category: "Branding",
    difficulty: "Débutant",
    duration: "40 min",
    steps: 6,
    icon: Palette,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "content-creation",
    title: "Créer du contenu qui convertit",
    description: "Les secrets de nos agents IA pour rédiger des textes qui captivent et vendent.",
    category: "Contenu",
    difficulty: "Intermédiaire",
    duration: "50 min",
    steps: 7,
    icon: PenTool,
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "analytics-insights",
    title: "Analyser et améliorer vos performances",
    description: "Utilisez les données pour prendre de meilleures décisions business.",
    category: "Analytics",
    difficulty: "Avancé",
    duration: "60 min",
    steps: 9,
    icon: BarChart3,
    color: "from-yellow-500 to-orange-600"
  }
];

const categories = [
  "Tous",
  "Démarrage",
  "Marketing",
  "E-commerce",
  "SEO",
  "Optimisation",
  "Branding",
  "Contenu",
  "Analytics"
];

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || guide.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const popularGuides = guides.filter(guide => guide.popular);

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30 pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Guides & Tutoriels
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent"> Ezia</span>
            </h1>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Apprenez à maîtriser tous les aspects de votre présence en ligne avec nos guides détaillés
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un guide..."
                className="pl-12 pr-4 py-3 text-lg bg-white shadow-md border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Guides disponibles", value: guides.length, icon: BookOpen },
            { label: "Heures de contenu", value: "15+", icon: Clock },
            { label: "Étapes détaillées", value: "80+", icon: CheckCircle2 },
            { label: "Succès garantis", value: "100%", icon: Sparkles }
          ].map((stat, index) => (
            <Card key={index} className="text-center p-6 border-0 shadow-lg">
              <stat.icon className="w-8 h-8 text-[#6D3FC8] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#1E1E1E]">{stat.value}</p>
              <p className="text-sm text-[#666666]">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#6D3FC8] text-white shadow-md"
                    : "bg-white text-[#666666] hover:bg-purple-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {["Débutant", "Intermédiaire", "Avancé"].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  selectedDifficulty === level
                    ? "bg-purple-100 text-[#6D3FC8]"
                    : "bg-gray-100 text-[#666666] hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      {!searchQuery && !selectedDifficulty && selectedCategory === "Tous" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#6D3FC8]" />
            Guides populaires
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {popularGuides.map((guide) => (
              <Card key={guide.id} className="overflow-hidden hover:shadow-xl transition-shadow border-0">
                <div className={`h-2 bg-gradient-to-r ${guide.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${guide.color} rounded-lg flex items-center justify-center`}>
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Populaire
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                  <p className="text-[#666666] mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {guide.duration}
                      </span>
                      <span>{guide.steps} étapes</span>
                      <Badge variant="outline">{guide.difficulty}</Badge>
                    </div>
                    <Link href={`/guides/${guide.id}`}>
                      <Button size="sm" className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                        Commencer
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Guides Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery || selectedCategory !== "Tous" || selectedDifficulty
            ? "Résultats"
            : "Tous les guides"}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="group hover:shadow-xl transition-all border-0">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${guide.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <guide.icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="outline">{guide.category}</Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-[#6D3FC8] transition-colors">
                  {guide.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {guide.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 text-sm text-[#666666]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {guide.duration}
                    </span>
                    <span>{guide.steps} étapes</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      guide.difficulty === "Débutant" ? "bg-green-100 text-green-800" :
                      guide.difficulty === "Intermédiaire" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {guide.difficulty}
                  </Badge>
                </div>
                <Link href={`/guides/${guide.id}`} className="block">
                  <Button className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                    <PlayCircle className="mr-2 w-4 h-4" />
                    Suivre le guide
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#666666]">Aucun guide trouvé pour vos critères de recherche.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'aide personnalisée ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discutez directement avec Ezia pour un accompagnement sur mesure
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-[#6D3FC8] hover:bg-gray-100 shadow-lg">
              Parler à Ezia maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}