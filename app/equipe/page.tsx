"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import LandingNavbar from "@/components/landing-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Code2,
  Palette,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Headphones,
  ArrowRight,
  TrendingUp,
  Search,
  Brain,
  Zap,
  CheckCircle2,
  Crown,
  Handshake
} from "lucide-react";
import { Footer } from "@/components/ui/footer";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  responsibilities: string[];
  icon: any;
  color: string;
  primaryColor?: string;
  image: string;
  isLeader?: boolean;
}

const teamMembers: TeamMember[] = [
  {
    name: "Ezia",
    role: "Chef de Projet IA",
    description: "La cheffe d'orchestre du projet. Toujours à l'écoute, elle coordonne les talents de l'équipe, anticipe les besoins et veille à ce que chaque idée prenne vie dans les meilleures conditions. Elle assure la fluidité des échanges, aide chacun à avancer sereinement et s'assure que tout reste aligné avec la vision globale.",
    responsibilities: [
      "Planifier et organiser le travail de l'équipe",
      "Faciliter la communication et la collaboration",
      "Suivre les avancées et lever les obstacles",
      "Adapter les priorités en fonction des objectifs et des opportunités"
    ],
    icon: Sparkles,
    color: "from-[#6D3FC8] to-[#8B5CF6]",
    primaryColor: "#b88ac5",
    image: "/img/mascottes/Ezia.png",
    isLeader: true
  },
  {
    name: "Lex",
    role: "Développeur & Architecte Technique",
    description: "L'expert en développement et en architecture technique. Il analyse les besoins, choisit les technologies adaptées et veille à la cohérence du code.",
    responsibilities: [
      "Mise en place des bases du projet",
      "Optimisation des performances",
      "Sécurité des applications",
      "Intégration d'API et services"
    ],
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
    primaryColor: "#373534",
    image: "/img/mascottes/Lex.png"
  },
  {
    name: "Kiko",
    role: "Designer UI/UX",
    description: "Le créateur d'expériences visuelles et interactives fluides. Il conçoit les interfaces et s'assure qu'elles soient esthétiques, ergonomiques et adaptées à la cible.",
    responsibilities: [
      "Création de maquettes et prototypes",
      "Définition de chartes graphiques",
      "Conception d'interfaces responsive",
      "Tests utilisateurs et amélioration de l'expérience"
    ],
    icon: Palette,
    color: "from-purple-500 to-pink-600",
    primaryColor: "#ffaf88",
    image: "/img/mascottes/Kiko.png"
  },
  {
    name: "Mira",
    role: "Analyste Données & Business Intelligence",
    description: "Collecte, analyse et interprète les données pour orienter les décisions. Elle identifie les opportunités et les axes d'amélioration.",
    responsibilities: [
      "Mise en place de tableaux de bord",
      "Analyse comportementale des utilisateurs",
      "Suivi des KPI",
      "Recommandations basées sur les données"
    ],
    icon: BarChart3,
    color: "from-indigo-500 to-purple-600",
    primaryColor: "#374757",
    image: "/img/mascottes/Mira.png"
  },
  {
    name: "Lina",
    role: "Community Manager & Réseaux Sociaux",
    description: "En charge de la communication sur les réseaux sociaux et de l'animation des communautés. Elle entretient le lien avec le public et favorise l'engagement.",
    responsibilities: [
      "Création et publication de contenus",
      "Animation et modération des communautés",
      "Veille des tendances social media",
      "Partenariats et collaborations avec influenceurs"
    ],
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-600",
    primaryColor: "#7db684",
    image: "/img/mascottes/Lina.png"
  },
  {
    name: "Vera",
    role: "Support Client & Formation",
    description: "La responsable de l'assistance et de la formation des utilisateurs. Elle veille à ce que les clients soient accompagnés et satisfaits.",
    responsibilities: [
      "Support technique et fonctionnel",
      "Création de tutoriels et guides d'utilisation",
      "Formation en ligne ou en présentiel",
      "Recueil des retours utilisateurs pour améliorer le produit"
    ],
    icon: Headphones,
    color: "from-pink-500 to-rose-600",
    primaryColor: "#83bfd8",
    image: "/img/mascottes/Vera.png"
  },
  {
    name: "Milo",
    role: "Expert SEO & Contenu",
    description: "Le spécialiste du référencement naturel et de la rédaction optimisée. Il s'assure que les contenus soient visibles, pertinents et bien positionnés sur les moteurs de recherche.",
    responsibilities: [
      "Analyse SEO technique et sémantique",
      "Recherche de mots-clés stratégiques",
      "Optimisation des contenus",
      "Suivi des performances SEO"
    ],
    icon: Search,
    color: "from-green-500 to-teal-600",
    primaryColor: "#ffb243",
    image: "/img/mascottes/Milo.png"
  },
  {
    name: "Yuna",
    role: "Stratégie Marketing & Communication",
    description: "Définit la stratégie marketing globale du projet et assure la cohérence du message. Elle gère la visibilité, l'image de marque et les campagnes publicitaires.",
    responsibilities: [
      "Analyse du marché et des tendances",
      "Définition du positionnement",
      "Création et diffusion des campagnes",
      "Suivi des performances marketing"
    ],
    icon: Target,
    color: "from-orange-500 to-red-600",
    primaryColor: "#f7d04c",
    image: "/img/mascottes/Yuna.png"
  }
];

export default function TeamPage() {
  // Ajouter les styles pour les animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gentle-wave {
        0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.3; }
        25% { transform: translateX(30px) translateY(-30px) scale(1.1); opacity: 0.4; }
        50% { transform: translateX(-20px) translateY(20px) scale(0.95); opacity: 0.35; }
        75% { transform: translateX(40px) translateY(-10px) scale(1.05); opacity: 0.45; }
      }
      
      @keyframes morph {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
        25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(90deg); }
        50% { border-radius: 70% 30% 40% 60% / 30% 70% 60% 40%; transform: rotate(180deg); }
        75% { border-radius: 40% 70% 60% 30% / 70% 40% 30% 60%; transform: rotate(270deg); }
      }
      
      @keyframes subtle-glow {
        0%, 100% { filter: blur(40px) brightness(1); transform: scale(1); }
        50% { filter: blur(60px) brightness(1.1); transform: scale(1.1); }
      }
      
      @keyframes drift {
        0% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fonction pour calculer la luminance d'une couleur
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Formule de luminance relative
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Fonction pour ajuster la couleur pour une meilleure lisibilité
  const getReadableColor = (color: string, isBackground: boolean = false) => {
    if (isBackground) {
      // Pour les backgrounds de badges, on retourne la couleur telle quelle
      return color;
    } else {
      // Pour le texte
      const lightColors = ['#7db684', '#f7d04c', '#ffaf88', '#ffb243'];
      const darkColors = ['#373534', '#374757'];
      
      if (lightColors.includes(color)) {
        // Assombrir les couleurs claires pour le texte
        if (color === '#7db684') return '#4CAF50';
        if (color === '#f7d04c') return '#F59E0B';
        if (color === '#ffaf88') return '#EA580C';
        if (color === '#ffb243') return '#F97316';
      }
      if (darkColors.includes(color)) {
        // Éclaircir les couleurs foncées pour le texte
        if (color === '#373534') return '#6B7280';
        if (color === '#374757') return '#64748B';
      }
      return color;
    }
  };


  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30 pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              L'équipe d'
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent">Ezia</span>
            </h1>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Une équipe d'agents IA spécialisés, chacun expert dans son domaine, 
              travaillant ensemble pour faire réussir votre business
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Agents IA", value: "8", icon: Users },
              { label: "Domaines d'expertise", value: "8", icon: Brain },
              { label: "Disponibilité", value: "24/7", icon: Zap }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <stat.icon className="w-8 h-8 text-[#6D3FC8] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#1E1E1E]">{stat.value}</p>
                <p className="text-sm text-[#666666]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leader Section - Ezia */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#b88ac5]/10 via-transparent to-[#b88ac5]/5"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 opacity-30"
            style={{ 
              background: `radial-gradient(circle, ${teamMembers[0].primaryColor}40 0%, transparent 70%)`,
              animation: 'gentle-wave 8s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] opacity-25"
            style={{ 
              background: `radial-gradient(circle, ${teamMembers[0].primaryColor}30 0%, transparent 60%)`,
              animation: 'gentle-wave 10s ease-in-out infinite reverse',
              animationDelay: '2s'
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
            style={{ 
              background: `radial-gradient(ellipse, ${teamMembers[0].primaryColor}20 0%, transparent 50%)`,
              animation: 'morph 15s ease-in-out infinite',
              filter: 'blur(40px)'
            }}
          ></div>
          <div 
            className="absolute top-1/3 right-1/4 w-80 h-80"
            style={{ 
              background: `radial-gradient(circle, ${teamMembers[0].primaryColor}25 0%, transparent 70%)`,
              animation: 'subtle-glow 6s ease-in-out infinite',
              animationDelay: '1s'
            }}
          ></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-[450px] h-[600px]">
                <Image
                  src={teamMembers[0].image}
                  alt={teamMembers[0].name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge 
                  className="px-4 py-2 text-white font-semibold tracking-wider inline-flex items-center gap-1.5"
                  style={{ 
                    background: `linear-gradient(135deg, ${teamMembers[0].primaryColor} 0%, ${teamMembers[0].primaryColor}DD 50%, ${teamMembers[0].primaryColor} 100%)`,
                    border: 'none',
                    boxShadow: `0 4px 15px ${teamMembers[0].primaryColor}40`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Crown className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10 uppercase text-xs">Cheffe d'équipe</span>
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)`,
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                </Badge>
                <Badge 
                  className="px-4 py-2 text-white font-semibold tracking-wider inline-flex items-center gap-1.5"
                  style={{ 
                    background: `linear-gradient(135deg, ${teamMembers[0].primaryColor} 0%, ${teamMembers[0].primaryColor}DD 50%, ${teamMembers[0].primaryColor} 100%)`,
                    border: 'none',
                    boxShadow: `0 4px 15px ${teamMembers[0].primaryColor}40`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Handshake className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10 uppercase text-xs">Partenaire business</span>
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)`,
                      animation: 'shimmer 3s infinite',
                      animationDelay: '1.5s'
                    }}
                  />
                </Badge>
              </div>
              <h2 className="text-4xl font-bold">{teamMembers[0].name}</h2>
              <p className="text-2xl font-medium" style={{ color: getReadableColor(teamMembers[0].primaryColor || '', false) }}>{teamMembers[0].role}</p>
              <p className="text-lg text-[#666666] leading-relaxed">{teamMembers[0].description}</p>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Responsabilités principales :</h3>
                <ul className="space-y-3">
                  {teamMembers[0].responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getReadableColor(teamMembers[0].primaryColor || '', false) }} />
                      <span className="text-[#666666]">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <Link href="/home">
                <Button size="lg" className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white shadow-lg">
                  Discuter avec Ezia
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members - Alternating Layout */}
      <section className="">
        <div className="space-y-0">
          {teamMembers.slice(1).map((member, index) => (
            <div 
              key={member.name}
              className="py-20 relative overflow-hidden"
            >
              <div className="absolute inset-0" style={{ backgroundColor: `${member.primaryColor}08` }}></div>
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute -top-32 -right-32 w-[400px] h-[400px]"
                  style={{ 
                    background: `radial-gradient(circle, ${member.primaryColor}25 0%, transparent 70%)`,
                    animation: 'gentle-wave 12s ease-in-out infinite',
                    animationDelay: `${index * 0.5}s`
                  }}
                ></div>
                <div 
                  className="absolute -bottom-24 -left-24 w-[350px] h-[350px]"
                  style={{ 
                    background: `radial-gradient(circle, ${member.primaryColor}20 0%, transparent 60%)`,
                    animation: 'gentle-wave 15s ease-in-out infinite reverse',
                    animationDelay: `${index * 0.7 + 1}s`
                  }}
                ></div>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px]"
                  style={{ 
                    background: `radial-gradient(ellipse at center, ${member.primaryColor}15 0%, transparent 50%)`,
                    animation: 'morph 20s ease-in-out infinite',
                    filter: 'blur(50px)',
                    animationDelay: `${index * 0.3}s`
                  }}
                ></div>
                {index % 2 === 0 && (
                  <div 
                    className="absolute top-1/4 right-1/3 w-60 h-60"
                    style={{ 
                      background: `radial-gradient(circle, ${member.primaryColor}18 0%, transparent 70%)`,
                      animation: 'drift 18s linear infinite',
                      filter: 'blur(30px)'
                    }}
                  ></div>
                )}
              </div>
              <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } items-center gap-12`}>
              {/* Mascotte */}
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative w-96 h-[550px]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Contenu */}
              <div className="lg:w-1/2 space-y-6">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold tracking-wider relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${member.primaryColor} 0%, ${member.primaryColor}DD 50%, ${member.primaryColor} 100%)`,
                    border: 'none',
                    boxShadow: `0 4px 15px ${member.primaryColor}40`
                  }}
                >
                  <member.icon className="w-5 h-5 relative z-10" />
                  <span className="text-xs uppercase relative z-10">Expert</span>
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)`,
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                </div>
                
                <h3 className="text-3xl font-bold">{member.name}</h3>
                <p className="text-xl font-medium" style={{ color: getReadableColor(member.primaryColor || '', false) }}>
                  {member.role}
                </p>
                <p className="text-lg text-[#666666] leading-relaxed">{member.description}</p>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3">Expertise :</h4>
                  <ul className="space-y-3">
                    {member.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: getReadableColor(member.primaryColor || '', false) }} />
                        <span className="text-[#666666]">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>
      </section>

      {/* How We Work Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment nous travaillons ensemble</h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Notre équipe fonctionne en synergie pour vous offrir une solution complète
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Coordination parfaite",
                description: "Ezia orchestre l'équipe en assignant les tâches selon les expertises de chacun",
                icon: Sparkles
              },
              {
                title: "Expertise spécialisée",
                description: "Chaque agent apporte ses compétences uniques pour un résultat optimal",
                icon: Brain
              },
              {
                title: "Résultats rapides",
                description: "Le travail en équipe permet de livrer des projets complets en un temps record",
                icon: Zap
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[#666666]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à rencontrer votre équipe ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discutez avec Ezia et découvrez comment notre équipe peut transformer votre business
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-[#6D3FC8] hover:bg-gray-100 shadow-lg">
              Commencer maintenant
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