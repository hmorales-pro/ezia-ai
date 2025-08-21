"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Globe, Target, FileText, TrendingUp, 
  Calendar, Users, BarChart3, Sparkles, ChevronRight,
  Building2, Package, Lightbulb, MessageSquare
} from "lucide-react";

interface ProjectType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  route: string;
  available: boolean;
}

const projectTypes: ProjectType[] = [
  {
    id: 'business',
    title: 'Nouveau Business',
    description: 'Démarrez un nouveau projet entrepreneurial avec l\'accompagnement complet d\'Ezia',
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    route: '/business/new',
    available: true
  },
  {
    id: 'website',
    title: 'Site Web',
    description: 'Créez un site web professionnel pour votre business avec l\'IA',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    route: '/sites/new',
    available: true
  },
  {
    id: 'marketing',
    title: 'Campagne Marketing',
    description: 'Lancez une stratégie marketing complète avec nos agents spécialisés',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    route: '/marketing/new',
    available: false
  },
  {
    id: 'content',
    title: 'Calendrier de Contenu',
    description: 'Planifiez et créez du contenu engageant pour vos réseaux sociaux',
    icon: Calendar,
    color: 'from-orange-500 to-red-500',
    route: '/content/new',
    available: false
  },
  {
    id: 'analysis',
    title: 'Analyse de Marché',
    description: 'Obtenez une analyse approfondie de votre marché et de vos concurrents',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
    route: '/analysis/new',
    available: false
  },
  {
    id: 'consultation',
    title: 'Consultation IA',
    description: 'Discutez directement avec Ezia pour obtenir des conseils personnalisés',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-500',
    route: '/chat',
    available: true
  }
];

export default function WorkspaceNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const businessId = searchParams.get('businessId');
  const focus = searchParams.get('focus');
  
  useEffect(() => {
    // Si un focus est spécifié et que c'est website, rediriger directement
    if (focus === 'website' && businessId) {
      const prompt = encodeURIComponent(`Développe la présence en ligne pour ce business`);
      router.push(`/sites/new?businessId=${businessId}&prompt=${prompt}`);
    }
  }, [focus, businessId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Créer un nouveau projet</h1>
              <p className="text-sm text-[#666666]">
                Choisissez le type de projet que vous souhaitez démarrer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-[#1E1E1E] mb-4">
            Que souhaitez-vous créer aujourd'hui ?
          </h2>
          <p className="text-xl text-[#666666] max-w-3xl mx-auto">
            Ezia et son équipe d'agents IA sont prêts à vous accompagner dans tous vos projets business
          </p>
        </div>

        {/* Project Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectTypes.map((type) => {
            const Icon = type.icon;
            const isHovered = hoveredCard === type.id;

            return (
              <Card
                key={type.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  type.available 
                    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onMouseEnter={() => setHoveredCard(type.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => type.available && router.push(type.route)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5 ${
                  isHovered && type.available ? 'opacity-10' : ''
                } transition-opacity`} />
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {!type.available && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Bientôt
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{type.title}</CardTitle>
                  <CardDescription className="text-[#666666]">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {type.available ? (
                    <div className="flex items-center text-[#6D3FC8] font-medium">
                      <span>Commencer</span>
                      <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                        isHovered ? 'translate-x-1' : ''
                      }`} />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Cette fonctionnalité sera bientôt disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-purple-50 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-[#6D3FC8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                Conseil d'Ezia
              </h3>
              <p className="text-[#666666]">
                Si c'est votre première visite, je vous recommande de commencer par créer votre business. 
                Cela me permettra de mieux comprendre vos besoins et de personnaliser tous les autres 
                projets en fonction de votre activité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}