"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing-navbar";
import { useDebouncedValue } from "@/lib/performance/debounce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Clock,
  User,
  TrendingUp,
  Lightbulb,
  Target,
  Rocket,
  Building2,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/ui/footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Comment l'IA transforme la création de sites web en 2024",
    excerpt: "Découvrez comment Ezia et son équipe d'agents IA révolutionnent la façon dont les entrepreneurs créent leur présence en ligne.",
    category: "Innovation",
    author: "Ezia",
    date: "15 janvier 2024",
    readTime: "5 min",
    image: "/blog/ai-web-creation.jpg",
    featured: true
  },
  {
    id: "2",
    title: "10 stratégies marketing pour booster votre business en ligne",
    excerpt: "Les meilleures pratiques recommandées par nos agents IA pour attirer plus de clients et augmenter vos ventes.",
    category: "Marketing",
    author: "Agent Marketing",
    date: "12 janvier 2024",
    readTime: "8 min",
    image: "/blog/marketing-strategies.jpg"
  },
  {
    id: "3",
    title: "De l'idée au lancement : Guide complet pour entrepreneurs",
    excerpt: "Tout ce que vous devez savoir pour transformer votre idée en business florissant, avec l'aide de l'IA.",
    category: "Entrepreneuriat",
    author: "Ezia",
    date: "8 janvier 2024",
    readTime: "12 min",
    image: "/blog/entrepreneur-guide.jpg"
  },
  {
    id: "4",
    title: "SEO en 2024 : Les secrets d'un référencement réussi",
    excerpt: "Comment nos agents IA optimisent votre site pour les moteurs de recherche et attirent du trafic qualifié.",
    category: "SEO",
    author: "Agent SEO",
    date: "5 janvier 2024",
    readTime: "7 min",
    image: "/blog/seo-secrets.jpg"
  },
  {
    id: "5",
    title: "Créer une boutique en ligne rentable : Le guide Ezia",
    excerpt: "Étapes essentielles pour lancer votre e-commerce et générer vos premières ventes rapidement.",
    category: "E-commerce",
    author: "Agent E-commerce",
    date: "2 janvier 2024",
    readTime: "10 min",
    image: "/blog/ecommerce-guide.jpg"
  },
  {
    id: "6",
    title: "L'importance du design dans la conversion client",
    excerpt: "Comment un design professionnel peut multiplier vos conversions et fidéliser vos clients.",
    category: "Design",
    author: "Agent Design",
    date: "28 décembre 2023",
    readTime: "6 min",
    image: "/blog/design-conversion.jpg"
  }
];

const categories = [
  { name: "Tous", icon: Sparkles, count: blogPosts.length },
  { name: "Marketing", icon: TrendingUp, count: 2 },
  { name: "Entrepreneuriat", icon: Rocket, count: 1 },
  { name: "E-commerce", icon: Building2, count: 1 },
  { name: "Innovation", icon: Lightbulb, count: 1 },
  { name: "SEO", icon: Target, count: 1 },
  { name: "Design", icon: Users, count: 1 }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  
  // Debounce the search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tous" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchQuery, selectedCategory]);

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30 pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Le Blog d'
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent">Ezia</span>
            </h1>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Conseils, stratégies et actualités pour faire grandir votre business avec l'IA
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="pl-12 pr-4 py-3 text-lg bg-white shadow-md border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-full bg-gradient-to-br from-purple-100 to-pink-100 p-12 flex items-center justify-center">
                <div className="w-full h-64 bg-white/50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-[#6D3FC8]" />
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <Badge className="mb-4 bg-[#6D3FC8] text-white">Article vedette</Badge>
                <h2 className="text-3xl font-bold mb-4 hover:text-[#6D3FC8] transition-colors">
                  <Link href={`/blog/${featuredPost.id}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-[#666666] mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-[#666666] mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.id}`}>
                  <Button className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                    Lire l'article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                selectedCategory === category.name
                  ? "bg-[#6D3FC8] text-white shadow-lg"
                  : "bg-white text-[#666666] hover:bg-purple-50"
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
              <span className="text-sm opacity-70">({category.count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow border-0">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-[#6D3FC8] opacity-50" />
              </div>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                <h3 className="text-xl font-semibold mb-2 hover:text-[#6D3FC8] transition-colors line-clamp-2">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-[#666666] mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-[#666666]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.id}`}
                    className="text-[#6D3FC8] hover:text-[#5A35A5] flex items-center gap-1"
                  >
                    Lire
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#666666]">Aucun article trouvé pour votre recherche.</p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Restez informé des dernières tendances
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Recevez nos meilleurs conseils directement dans votre boîte mail
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre email..."
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            />
            <Button className="bg-white text-[#6D3FC8] hover:bg-gray-100">
              S'abonner
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}