"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  ArrowRight,
  MessageSquare,
  ChartBar,
  Building2,
  Users,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
  HeartHandshake,
  Puzzle,
  Brain,
  Activity,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/landing-navbar";
import { Footer } from "@/components/ui/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HomeEnterpriseClient() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedIntegration, setSelectedIntegration] = useState<number | null>(null);

  const benefits = [
    {
      icon: Puzzle,
      title: "Vos données enfin réunies",
      description: "Ezia connecte vos outils préférés (Stripe, Asana, Zendesk...) pour vous raconter l'histoire complète de votre entreprise."
    },
    {
      icon: Brain,
      title: "Des insights qui comptent",
      description: "Plus besoin de jongler entre 10 tableaux de bord. Ezia analyse tout et vous dit ce qui est vraiment important."
    },
    {
      icon: MessageSquare,
      title: "Simple comme une conversation",
      description: "Posez vos questions en français, obtenez des réponses claires. Pas de graphiques compliqués, juste ce dont vous avez besoin."
    },
    {
      icon: Shield,
      title: "Vos données restent vôtres",
      description: "100% sécurisé, 100% français. Vos données ne quittent jamais nos serveurs et vous gardez le contrôle total."
    }
  ];

  const testimonials = [
    {
      name: "Julie M.",
      role: "Directrice d'une agence digitale",
      content: "L'idée de centraliser tous nos outils dans une seule interface est exactement ce dont nous avons besoin. J'ai hâte de tester Ezia !",
      metrics: "Gain de temps attendu"
    },
    {
      name: "Marc L.",
      role: "Fondateur SaaS B2B",
      content: "Pouvoir poser des questions en français sur nos données business, c'est le rêve. Fini les tableaux de bord compliqués !",
      metrics: "Simplicité prometteuse"
    },
    {
      name: "Camille D.",
      role: "CEO E-commerce",
      content: "Une solution française qui comprend nos enjeux locaux, c'est rare et précieux. Vivement le lancement d'Ezia Analytics !",
      metrics: "Solution adaptée"
    }
  ];


  const integrations = [
    {
      emoji: "💳",
      category: "Paiements",
      tools: ["Stripe", "PayPal", "Mollie", "Square", "Adyen"]
    },
    {
      emoji: "✅",
      category: "Gestion de projets",
      tools: ["Asana", "Trello", "Notion", "Monday.com", "ClickUp"]
    },
    {
      emoji: "🎧",
      category: "Support client",
      tools: ["Zendesk", "Intercom", "Freshdesk", "HelpScout", "Crisp"]
    },
    {
      emoji: "📧",
      category: "Email marketing",
      tools: ["Mailchimp", "SendinBlue", "ActiveCampaign", "ConvertKit", "Klaviyo"]
    },
    {
      emoji: "📊",
      category: "Analytics",
      tools: ["Google Analytics", "Mixpanel", "Amplitude", "Segment", "Hotjar"]
    },
    {
      emoji: "💬",
      category: "Communication",
      tools: ["Slack", "Microsoft Teams", "Discord", "Zoom", "Google Meet"]
    },
    {
      emoji: "📝",
      category: "CRM",
      tools: ["HubSpot", "Salesforce", "Pipedrive", "Zoho CRM", "Copper"]
    },
    {
      emoji: "🛍️",
      category: "E-commerce",
      tools: ["Shopify", "WooCommerce", "PrestaShop", "BigCommerce", "Magento"]
    },
    {
      emoji: "💼",
      category: "Comptabilité",
      tools: ["QuickBooks", "Xero", "FreshBooks", "Wave", "Sage"]
    },
    {
      emoji: "☁️",
      category: "Stockage",
      tools: ["Google Drive", "Dropbox", "OneDrive", "Box", "AWS S3"]
    }
  ];

  const faqs = [
    {
      question: "Comment Ezia se connecte à mes outils ?",
      answer: "Vous autorisez Ezia à accéder à vos outils (Stripe, Asana, etc.) via une connexion sécurisée. C'est aussi simple que de se connecter à un site avec Google. Tout est sécurisé et vous pouvez révoquer l'accès à tout moment."
    },
    {
      question: "Est-ce que mes données sont en sécurité ?",
      answer: "Absolument ! Vos données sont chiffrées et stockées en France. Nous ne les partageons avec personne, nous ne les vendons pas, et vous pouvez tout supprimer quand vous voulez. C'est votre business, vos données, vos règles."
    },
    {
      question: "Combien de temps avant de voir des résultats ?",
      answer: "Une fois vos outils connectés, Ezia commence immédiatement à collecter et analyser vos données. La profondeur des analyses s'enrichit au fil du temps : plus Ezia apprend de vos données, plus ses recommandations deviennent pertinentes."
    },
    {
      question: "C'est différent de Google Analytics ou Tableau ?",
      answer: "Complètement ! Pas de courbes compliquées ou de tableaux à configurer. Vous posez des questions simples comme 'Pourquoi mes ventes baissent ?' et Ezia vous répond en analysant TOUS vos outils, pas juste votre site web."
    },
    {
      question: "Et si je n'ai pas tous ces outils ?",
      answer: "Pas de problème ! Ezia s'adapte à ce que vous avez. Même avec juste Stripe et un Google Sheet, elle peut déjà vous donner des insights précieux. Plus vous connectez d'outils, plus elle devient intelligente."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ebe7e1] via-white to-purple-50/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>L'IA qui comprend vraiment votre business</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
              Vos données racontent une histoire.
              <span className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent block mt-2">
                Ezia vous la révèle.
              </span>
            </h1>
            
            <p className="text-xl text-[#333333] mb-8 max-w-3xl mx-auto">
              Connectez vos outils business (Stripe, Asana, Zendesk...) et laissez Ezia transformer 
              vos données éparpillées en décisions éclairées. Simple comme une conversation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => router.push("/waitlist-enterprise")}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#764BA2] text-white shadow-lg"
              >
                Découvrir votre histoire
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('comment')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-[#6D3FC8] text-[#6D3FC8] hover:bg-purple-50"
              >
                Voir comment ça marche
              </Button>
            </div>
            
            <div className="flex items-center gap-6 justify-center text-sm text-[#333333]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Connexion simple à vos outils</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Analyses détaillées</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>100% français</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ces galères vous parlent ?
            </h2>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto">
              Si oui, vous n'êtes pas seul(e). C'est le quotidien de nombreuses entreprises.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Situation 1 */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-5xl flex-shrink-0">📊</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-red-600">
                    "Je perds 3h par semaine à faire des copier-coller"
                  </h3>
                  <p className="text-[#666666] mb-4">
                    Vos données sont éparpillées : Stripe pour les paiements, Asana pour les projets, 
                    Zendesk pour le support... Résultat ? Vous passez des heures à compiler des rapports 
                    au lieu de développer votre business.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-medium text-[#1E1E1E]">
                      💡 Avec Ezia : Toutes vos données au même endroit, analysées automatiquement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Situation 2 */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-5xl flex-shrink-0">🤯</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-amber-600">
                    "J'ai plein de data mais aucune idée de ce qui marche vraiment"
                  </h3>
                  <p className="text-[#666666] mb-4">
                    Vous avez des tableaux de bord partout, mais impossible de voir les connections. 
                    Pourquoi ce client est parti ? D'où viennent les meilleurs ? Quels projets sont rentables ? 
                    Les réponses sont là, mais invisibles.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-medium text-[#1E1E1E]">
                      💡 Avec Ezia : Posez vos questions en français, obtenez des réponses claires
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Situation 3 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-5xl flex-shrink-0">⏰</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-blue-600">
                    "Je découvre les problèmes quand c'est trop tard"
                  </h3>
                  <p className="text-[#666666] mb-4">
                    Un client mécontent qui part, un projet qui dérape, des ventes qui chutent... 
                    Vous le voyez dans vos chiffres 3 semaines après. Trop tard pour réagir. 
                    Si seulement vous aviez été prévenu avant...
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-medium text-[#1E1E1E]">
                      💡 Avec Ezia : Des alertes intelligentes pour agir avant qu'il soit trop tard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ezia transforme vos données en conversations
            </h2>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">
              Plus besoin d'être data scientist pour comprendre votre business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-[#E0E0E0] hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-7 h-7 text-[#6D3FC8]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-[#666666] text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-[#333333]">Aussi simple que de discuter avec un collègue</p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Connectez vos outils",
                description: "Stripe pour les paiements, Asana pour les projets, Zendesk pour le support... Connectez les outils que vous utilisez déjà au quotidien.",
                emoji: "🔌"
              },
              {
                step: "2",
                title: "Posez vos questions",
                description: "'Comment vont mes ventes ?', 'Qui sont mes meilleurs clients ?', 'Où perdons-nous du temps ?'... Demandez ce qui vous intéresse vraiment.",
                emoji: "💬"
              },
              {
                step: "3",
                title: "Agissez sur les insights",
                description: "Ezia analyse tout et vous dit exactement quoi faire. Pas de graphiques complexes, juste des recommandations claires et actionnables.",
                emoji: "🚀"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="text-5xl flex-shrink-0">{item.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <span className="text-[#6D3FC8]">Étape {item.step}:</span> {item.title}
                  </h3>
                  <p className="text-[#666666]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-lg text-[#333333] mb-6">
              Plus de 50 intégrations disponibles
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {integrations.map((integration, index) => (
                <div 
                  key={index} 
                  className="relative group"
                >
                  <button
                    onClick={() => setSelectedIntegration(selectedIntegration === index ? null : index)}
                    className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-lg transition-all hover:scale-110 cursor-pointer"
                  >
                    <span className="text-3xl">{integration.emoji}</span>
                  </button>
                  
                  {/* Tooltip for desktop */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block z-10">
                    <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
                      <p className="font-semibold mb-1">{integration.category}</p>
                      <p className="text-xs text-gray-300">{integration.tools.slice(0, 3).join(", ")}...</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Click detail for mobile and desktop */}
                  {selectedIntegration === index && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20 md:hidden">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px]">
                        <p className="font-semibold text-[#1E1E1E] mb-2">{integration.category}</p>
                        <div className="text-xs text-[#666666] space-y-1">
                          {integration.tools.map((tool, toolIndex) => (
                            <div key={toolIndex} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{tool}</span>
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-8 border-transparent border-t-white"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Full details panel for desktop when clicked */}
            {selectedIntegration !== null && (
              <div className="hidden md:block mt-8 max-w-2xl mx-auto">
                <Card className="border-[#E0E0E0] bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{integrations[selectedIntegration].emoji}</span>
                        <h3 className="text-xl font-semibold text-[#1E1E1E]">
                          {integrations[selectedIntegration].category}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedIntegration(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {integrations[selectedIntegration].tools.map((tool, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-[#333333]">{tool}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-[#666666] mt-4">
                      Et bien d'autres outils de la catégorie {integrations[selectedIntegration].category.toLowerCase()}...
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <p className="text-sm text-[#666666] mt-6">
              <span className="hidden md:inline">Survolez ou cliquez</span>
              <span className="md:hidden">Touchez</span> sur une icône pour voir les outils disponibles
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils ont découvert leur histoire avec Ezia
            </h2>
          </div>
          
          <Card className="border-[#E0E0E0] bg-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl">💬</div>
                <div className="flex-1">
                  <p className="text-lg mb-4 text-[#333333] italic">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E1E1E]">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-sm text-[#666666]">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {testimonials[activeTestimonial].metrics}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-2">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              On répond à vos questions
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#666666]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à découvrir l'histoire que racontent vos données ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les entreprises qui comprennent enfin leur business
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/waitlist-enterprise")}
              className="bg-white text-[#6D3FC8] hover:bg-gray-100 shadow-lg"
            >
              Demander un accès prioritaire
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <p className="mt-6 text-sm opacity-80">
            ✓ Accès prioritaire • ✓ Updates exclusives • ✓ 100% français
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}