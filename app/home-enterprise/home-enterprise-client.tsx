"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChartBar,
  Database,
  TrendingUp,
  Building2,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Activity,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  LineChart,
  PieChart,
  Globe,
  Layers,
  Target,
  Brain
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
  const [activeDemo, setActiveDemo] = useState(0);

  const benefits = [
    {
      icon: Database,
      title: "Unification des données",
      description: "Connectez tous vos outils (Stripe, Asana, Zendesk, HubSpot...) en un seul tableau de bord intelligent."
    },
    {
      icon: Brain,
      title: "IA prédictive",
      description: "Anticipez les tendances, identifiez les opportunités et prévenez les risques grâce à notre IA avancée."
    },
    {
      icon: LineChart,
      title: "Insights actionnables",
      description: "Transformez vos données brutes en recommandations concrètes pour accélérer votre croissance."
    },
    {
      icon: Shield,
      title: "100% sécurisé",
      description: "Vos données restent confidentielles. Conformité RGPD et hébergement français haute sécurité."
    }
  ];

  const integrations = [
    { name: "Stripe", icon: "💳", category: "Paiements" },
    { name: "Asana", icon: "✅", category: "Gestion de projet" },
    { name: "Zendesk", icon: "🎧", category: "Support client" },
    { name: "Salesforce", icon: "☁️", category: "CRM" },
    { name: "HubSpot", icon: "🧲", category: "Marketing" },
    { name: "Slack", icon: "💬", category: "Communication" },
    { name: "Google Analytics", icon: "📊", category: "Analytics" },
    { name: "Notion", icon: "📝", category: "Documentation" },
    { name: "Shopify", icon: "🛍️", category: "E-commerce" },
    { name: "LinkedIn", icon: "💼", category: "Social" },
    { name: "Mailchimp", icon: "📧", category: "Email" },
    { name: "QuickBooks", icon: "💰", category: "Comptabilité" }
  ];

  const useCases = [
    {
      title: "Direction générale",
      icon: Building2,
      points: [
        "Vue 360° de l'entreprise en temps réel",
        "KPIs consolidés et alertes intelligentes",
        "Rapports automatisés pour le board"
      ]
    },
    {
      title: "Marketing & Sales",
      icon: Target,
      points: [
        "ROI par canal d'acquisition",
        "Parcours client unifié",
        "Prédiction du churn"
      ]
    },
    {
      title: "Finance & Ops",
      icon: BarChart3,
      points: [
        "Cash flow prédictif",
        "Analyse de rentabilité par segment",
        "Optimisation des coûts"
      ]
    },
    {
      title: "Support & Success",
      icon: Users,
      points: [
        "Satisfaction client en temps réel",
        "Identification des clients à risque",
        "Automatisation des insights"
      ]
    }
  ];

  const demoScenarios = [
    {
      title: "Analyser le parcours client",
      description: "De la première visite à la fidélisation",
      metrics: ["Taux de conversion: +34%", "Panier moyen: +22%", "LTV: +45%"]
    },
    {
      title: "Optimiser les opérations",
      description: "Identifier les goulots d'étranglement",
      metrics: ["Temps de traitement: -40%", "Coûts opérationnels: -25%", "Satisfaction équipe: +30%"]
    },
    {
      title: "Prédire la croissance",
      description: "Anticiper les tendances du marché",
      metrics: ["Précision: 92%", "Horizon: 6 mois", "Opportunités identifiées: +60%"]
    }
  ];

  const faqs = [
    {
      question: "Comment Ezia Analytics protège-t-il mes données ?",
      answer: "Vos données sont chiffrées de bout en bout et hébergées en France. Nous sommes conformes RGPD et SOC 2. Vous gardez le contrôle total : connexions révocables à tout moment, données jamais partagées, audit trail complet."
    },
    {
      question: "Quels outils puis-je connecter ?",
      answer: "Ezia s'intègre avec plus de 50 outils : CRM (Salesforce, HubSpot), paiements (Stripe, PayPal), gestion (Asana, Notion), support (Zendesk, Intercom), marketing (Mailchimp, Google Ads), et bien plus. Nouvelles intégrations ajoutées chaque mois."
    },
    {
      question: "Combien de temps faut-il pour voir des résultats ?",
      answer: "La connexion prend 5 minutes par outil. Les premiers insights apparaissent en 24h. Après 1 semaine, l'IA commence à identifier des patterns. Après 1 mois, vous avez des prédictions fiables et des recommandations personnalisées."
    },
    {
      question: "Quelle est la différence avec un outil de BI classique ?",
      answer: "Contrairement aux outils BI qui nécessitent des compétences techniques, Ezia parle votre langue. Posez des questions en français, obtenez des réponses claires. L'IA identifie automatiquement les insights importants sans configuration complexe."
    },
    {
      question: "Puis-je essayer avant de m'engager ?",
      answer: "Oui ! Demandez une démo personnalisée où nous analyserons vos défis spécifiques. Nous offrons aussi un POC (Proof of Concept) de 30 jours pour valider la valeur sur vos vraies données."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <Badge variant="secondary" className="gap-2 mb-6">
            <Sparkles className="w-4 h-4" />
            L'IA française qui unifie vos données business
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Transformez vos données en
            <span className="text-blue-600 block mt-2">histoires de succès</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Ezia Analytics connecte tous vos outils business (Stripe, Asana, Zendesk...) 
            pour révéler les insights cachés qui feront croître votre entreprise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => router.push("/waitlist-enterprise")}
              className="bg-slate-900 hover:bg-slate-800 text-white gap-2"
            >
              Demander une démo
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Voir en action
            </Button>
          </div>
          
          <p className="text-sm text-slate-500">
            🔒 Vos données restent confidentielles • 🇫🇷 Hébergé en France
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">50+</p>
              <p className="text-sm text-slate-600">Intégrations disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">24h</p>
              <p className="text-sm text-slate-600">Pour vos premiers insights</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">92%</p>
              <p className="text-sm text-slate-600">Précision des prédictions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">100%</p>
              <p className="text-sm text-slate-600">Conforme RGPD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Vos données racontent une histoire
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Mais elle est éparpillée entre des dizaines d'outils
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Données fragmentées</h3>
              <p className="text-sm text-slate-600">
                Chaque outil a ses propres métriques, impossible d'avoir une vue globale
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Insights manqués</h3>
              <p className="text-sm text-slate-600">
                Les corrélations importantes restent invisibles entre les silos
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Décisions lentes</h3>
              <p className="text-sm text-slate-600">
                Trop de temps perdu en reporting manuel au lieu d'agir
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 mb-2">
            Résultat : Vous passez à côté d'opportunités de croissance
          </p>
          <p className="text-slate-600">
            Pendant ce temps, vos concurrents data-driven prennent de l'avance
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">La solution</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ezia Analytics unifie et analyse tout
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Une IA qui comprend votre business et vous guide vers la croissance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Connectez tous vos outils favoris
          </h2>
          <p className="text-xl text-slate-600">
            Plus de 50 intégrations disponibles, nouvelles ajoutées chaque mois
          </p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {integrations.map((tool, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">{tool.icon}</div>
              <p className="text-sm font-medium text-slate-900">{tool.name}</p>
              <p className="text-xs text-slate-500">{tool.category}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 mb-4">
            Votre outil n'est pas dans la liste ?
          </p>
          <Button variant="outline" onClick={() => router.push("/waitlist-enterprise")}>
            Demander une intégration
          </Button>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Une solution pour chaque équipe
            </h2>
            <p className="text-xl text-slate-600">
              Ezia s'adapte aux besoins spécifiques de chaque département
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <useCase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-4">{useCase.title}</h3>
                  <ul className="space-y-2">
                    {useCase.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Démo live</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Découvrez Ezia en action
          </h2>
          <p className="text-xl text-slate-600">
            Quelques exemples de ce que vous pourrez accomplir
          </p>
        </div>
        
        <div className="bg-slate-100 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {demoScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setActiveDemo(index)}
                className={`p-4 rounded-lg text-left transition-all ${
                  activeDemo === index 
                    ? 'bg-white shadow-lg border-2 border-blue-500' 
                    : 'bg-white/50 border border-slate-200 hover:bg-white'
                }`}
              >
                <h3 className="font-semibold mb-1">{scenario.title}</h3>
                <p className="text-sm text-slate-600">{scenario.description}</p>
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {demoScenarios[activeDemo].title}
              </h3>
              <Badge>Live</Badge>
            </div>
            
            <div className="space-y-4">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600">Visualisation interactive des données</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {demoScenarios[activeDemo].metrics.map((metric, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm font-semibold text-blue-900">{metric}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button 
            size="lg" 
            onClick={() => router.push("/waitlist-enterprise")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            Voir avec vos vraies données
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-slate-600">
            Tout ce que vous devez savoir sur Ezia Analytics
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer vos données en croissance ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les entreprises qui prennent des décisions éclairées avec Ezia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/waitlist-enterprise")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Demander une démo personnalisée
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://calendly.com/ezia-analytics/demo', '_blank')}
            >
              Planifier un appel
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            ✓ Sans engagement • ✓ Démo avec vos cas d'usage • ✓ POC possible
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}