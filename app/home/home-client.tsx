"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
  Building2,
  Globe,
  BarChart3,
  Rocket,
  Shield,
  Clock,
  HeartHandshake
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LandingChat from "@/components/landing-chat";
import LandingNavbar from "@/components/landing-navbar";
import { Footer } from "@/components/ui/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HomePage() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const benefits = [
    {
      icon: Clock,
      title: "Assistant IA disponible",
      description: "Ezia analyse votre marché, définit votre stratégie et gère votre présence digitale. Tout en conversant naturellement."
    },
    {
      icon: Target,
      title: "Stratégie sur mesure",
      description: "Analyse concurrentielle, positionnement, plan marketing, calendrier éditorial... Une approche globale pour votre succès."
    },
    {
      icon: TrendingUp,
      title: "Croissance pilotée",
      description: "Suivi des KPIs, optimisation continue, recommandations basées sur vos données. Ezia pilote votre croissance."
    },
    {
      icon: Shield,
      title: "Tout-en-un inclus",
      description: "Sites web, réseaux sociaux, SEO, publicités, emailing... Tous les outils digitaux dont vous avez besoin."
    }
  ];

  const useCases = [
    {
      title: "Entrepreneurs",
      icon: Rocket,
      description: "Validez votre idée, analysez votre marché et lancez votre business avec une stratégie claire"
    },
    {
      title: "Commerçants",
      icon: Building2,
      description: "Développez votre clientèle avec des stratégies marketing locales et une présence digitale forte"
    },
    {
      title: "Freelances",
      icon: HeartHandshake,
      description: "Positionnez-vous comme expert, trouvez des clients et gérez votre activité efficacement"
    },
    {
      title: "PME",
      icon: BarChart3,
      description: "Optimisez vos processus, analysez vos données et accélérez votre croissance"
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "Fondatrice d'une startup",
      content: "Ezia m'a aidée à structurer mon idée et comprendre mon marché. L'équipe d'agents IA est vraiment utile pour avancer pas à pas.",
      rating: 5
    },
    {
      name: "Thomas B.",
      role: "Consultant indépendant",
      content: "La création de mon site web avec Ezia a été simple et rapide. Je peux me concentrer sur mon métier plutôt que sur la technique.",
      rating: 5
    },
    {
      name: "Sophie M.",
      role: "Restaurant local",
      content: "L'analyse de marché d'Ezia m'a donné des insights précieux sur ma clientèle et mes concurrents. Un vrai gain de temps !",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />
      
      {/* Hero Section with Chat */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>IA conversationnelle pour votre business</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Votre partenaire business
                <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent">
                  {" "}IA tout-en-un
                </span>
              </h1>
              
              <p className="text-xl text-[#333333] mb-8">
                Ezia et son équipe d'experts IA vous accompagnent dans tous les aspects de votre business : 
                stratégie, marketing, développement commercial, présence digitale et bien plus.
              </p>

              <div className="flex items-center gap-4 mb-8">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Nouveau
                </Badge>
                <p className="text-sm text-[#333333]">
                  Découvrez Ezia en avant-première
                </p>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap text-sm text-[#333333]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>100% gratuit pour commencer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Sans code requis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Accompagnement sur-mesure</span>
                </div>
              </div>
            </div>

            {/* Right side - Chat */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl"></div>
              <div className="relative">
                <LandingChat />
              </div>
              <p className="text-center text-sm text-[#333333] mt-4">
                👆 Essayez maintenant ! Posez vos questions à Ezia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment Ezia transforme votre business</h2>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">
              Plus qu'un simple outil digital, Ezia est votre équipe business complète propulsée par l'IA
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group hover:shadow-lg transition-shadow rounded-2xl p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-[#333333]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ezia s'adapte à vos besoins</h2>
            <p className="text-xl text-[#333333]">Quelle que soit votre situation, nous avons la solution</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-[#6D3FC8]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-[#333333] text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Une équipe d'experts IA à votre service</h2>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">
              Ezia coordonne une équipe complète d'agents spécialisés pour garantir votre succès
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-8 flex-wrap mb-12">           
            {[
              { name: "Lex", role: "Développeur", image: "/img/mascottes/Lex.png", priority: false },
              { name: "Kiko", role: "Designer", image: "/img/mascottes/Kiko.png", priority: false },
              { name: "Ezia", role: "Cheffe d'équipe", image: "/img/mascottes/Ezia.png", priority: true },
              { name: "Yuna", role: "Marketing", image: "/img/mascottes/Yuna.png", priority: false },
              { name: "Milo", role: "SEO", image: "/img/mascottes/Milo.png", priority: false }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-40 h-48 mx-auto mb-3 opacity-80 hover:opacity-100 transition-opacity">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 160px, 160px"
                    priority={member.priority}
                    loading={member.priority ? "eager" : "lazy"}
                  />
                </div>
                <h4 className="font-medium">{member.name}</h4>
                <p className="text-sm text-[#333333]">{member.role}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/equipe">
              <Button className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white shadow-lg hover:shadow-xl transition-all">
                Découvrir toute l'équipe
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ils ont réussi avec Ezia</h2>
            <p className="text-xl text-[#333333]">Découvrez leurs histoires inspirantes</p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="flex items-start gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-lg mb-6 text-[#1E1E1E] italic">
                "{testimonials[activeTestimonial].content}"
              </p>
              
              <div>
                <p className="font-semibold text-[#1E1E1E]">{testimonials[activeTestimonial].name}</p>
                <p className="text-sm text-[#333333]">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial 
                      ? 'bg-[#6D3FC8] w-8' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Simplified */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple comme une conversation</h2>
            <p className="text-xl text-[#333333]">3 étapes pour transformer votre idée en réalité</p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Discutez avec Ezia",
                description: "Partagez vos objectifs business. Ezia analyse votre marché et élabore votre stratégie complète.",
                icon: MessageSquare
              },
              {
                step: "2",
                title: "L'équipe IA travaille",
                description: "Nos agents créent votre présence digitale, optimisent votre marketing et pilotent votre croissance.",
                icon: Sparkles
              },
              {
                step: "3",
                title: "Développez votre activité",
                description: "Ezia suit vos performances, ajuste votre stratégie et vous accompagne dans toutes vos décisions.",
                icon: Rocket
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-6 bg-white rounded-2xl p-6 shadow-md">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {item.title}
                    <item.icon className="w-5 h-5 text-[#6D3FC8]" />
                  </h3>
                  <p className="text-[#333333]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-xl text-[#333333]">Tout ce que vous devez savoir sur Ezia</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Qu'est-ce qu'Ezia exactement ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Ezia est votre partenaire business propulsé par l'IA. C'est une équipe complète d'agents IA spécialisés 
                (développement, design, marketing, SEO...) qui travaillent ensemble pour créer et développer votre présence 
                en ligne. Vous discutez avec Ezia, et elle coordonne toute l'équipe pour vous.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Combien coûte Ezia ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Ezia propose un plan gratuit pour commencer, sans carte bancaire requise. Vous pouvez créer votre premier 
                site et tester toutes les fonctionnalités. Des plans payants sont disponibles pour des besoins plus avancés 
                avec plus de projets, des fonctionnalités premium et un support prioritaire.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Ai-je besoin de compétences techniques ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Absolument pas ! Ezia est conçue pour être utilisée par tout le monde. Vous discutez simplement avec elle 
                en langage naturel, comme avec un collègue. Elle s'occupe de toute la partie technique pour vous.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Combien de temps pour lancer mon business avec Ezia ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Ezia vous aide à structurer votre business dès le premier jour. Au fil de vos conversations, elle vous guide 
                dans l'analyse de votre marché, la définition de votre stratégie et la création de votre présence en ligne.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Puis-je modifier mon site après sa création ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Oui, bien sûr ! Vous pouvez modifier votre site à tout moment. Demandez simplement à Ezia les changements 
                que vous souhaitez, et elle les appliquera pour vous. Vous gardez toujours le contrôle total sur votre site.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Ezia peut-elle m'aider avec le marketing ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Absolument ! Ezia coordonne une équipe complète incluant des agents spécialisés en marketing, SEO, analyse 
                de marché et stratégie commerciale. Elle vous aide à créer du contenu, planifier vos campagnes, analyser 
                vos concurrents et optimiser votre présence en ligne.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Mes données sont-elles sécurisées ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                La sécurité est notre priorité. Toutes vos données sont chiffrées et stockées de manière sécurisée. 
                Nous respectons le RGPD et ne partageons jamais vos informations avec des tiers. Vous restez propriétaire 
                de tout votre contenu.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Quel support est disponible ?
              </AccordionTrigger>
              <AccordionContent className="text-[#666666]">
                Ezia, votre assistant IA, est toujours disponible pour répondre à vos questions et vous guider. 
                Pour les besoins plus complexes, notre équipe humaine est là pour vous accompagner.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre business ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Lancez votre business avec l'aide d'Ezia
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-[#6D3FC8] hover:bg-gray-100 shadow-lg">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm opacity-80">
            ✓ Sans carte bancaire • ✓ Sans engagement • ✓ Support inclus
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}