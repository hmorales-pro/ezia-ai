"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Video,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function WebinairePage() {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    position: "",
    phone: "",
    interests: [] as string[],
    challenges: [] as string[],
    projectDescription: "",
    expectations: "",
  });

  const webinarDate = new Date("2025-11-04T19:30:00");
  const interestOptions = [
    { id: "automation_ai", label: "Automatisation & IA" },
    { id: "website_creation", label: "Création de site web" },
    { id: "marketing_strategy", label: "Stratégie marketing" },
    { id: "market_analysis", label: "Analyse de marché" },
    { id: "content_generation", label: "Génération de contenu" },
    { id: "other", label: "Autre" }
  ];

  const challengeOptions = [
    { id: "time", label: "Manque de temps" },
    { id: "content", label: "Création de contenu" },
    { id: "market_analysis", label: "Analyse de marché" },
    { id: "marketing_strategy", label: "Stratégie marketing" },
    { id: "other", label: "Autre" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/webinar/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "website"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistered(true);
        toast.success("Inscription réussie !", {
          description: "Un email de confirmation vous a été envoyé."
        });
      } else {
        if (data.alreadyRegistered) {
          toast.info("Déjà inscrit", {
            description: "Cet email est déjà enregistré pour le webinaire."
          });
        } else {
          toast.error("Erreur", {
            description: data.error || "Une erreur est survenue lors de l'inscription."
          });
        }
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de s'inscrire pour le moment."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId)
    }));
  };

  const handleChallengeChange = (challengeId: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        // Maximum 3 défis
        if (prev.challenges.length >= 3) {
          return prev;
        }
        return {
          ...prev,
          challenges: [...prev.challenges, challengeId]
        };
      } else {
        return {
          ...prev,
          challenges: prev.challenges.filter(id => id !== challengeId)
        };
      }
    });
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Inscription confirmée !</CardTitle>
            <CardDescription className="text-lg mt-2">
              Vous êtes inscrit au webinaire Ezia.ai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">4 novembre 2025</p>
                  <p className="text-sm text-gray-600">Mardi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">19h30 (heure de Paris)</p>
                  <p className="text-sm text-gray-600">Durée: 1h30</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Webinaire en ligne</p>
                  <p className="text-sm text-gray-600">Lien envoyé par email</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Un email de confirmation avec le lien de connexion vous a été envoyé à <strong>{formData.email}</strong>
              </p>
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Ezia Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-semibold text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">Ezia</span>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Partie gauche - Informations du webinaire */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Webinaire gratuit
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Webinaire Gratuit :<br />
                Automatisez et Accélérez votre Business avec l'IA
              </h1>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">
                Entrepreneur, freelance ou dirigeant : combien d'heures perdez-vous chaque semaine sur des tâches répétitives — <strong>sans réel impact sur votre chiffre d'affaires</strong> ?
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                👉 Selon une étude récente, <strong>68 % des entrepreneurs passent plus de 15 heures par semaine</strong> à gérer des emails, créer du contenu, faire des recherches ou analyser leurs résultats.<br />
                Du temps qui ne sert ni la croissance, ni la vision de leur entreprise.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                🚀 <strong>Bonne nouvelle : vous pouvez changer ça.</strong>
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Les entrepreneurs les plus performants ont un point commun :<br />
                <strong className="text-[#6D3FC8]">ils utilisent l'intelligence artificielle pour automatiser, analyser et créer plus vite</strong> — sans perdre leur authenticité ni leur contrôle.
              </p>
              <p className="text-xl font-semibold bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] bg-clip-text text-transparent">
                Et si vous faisiez de même ?
              </p>
            </div>

            {/* Date et heure */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mardi</p>
                    <p className="text-xl font-bold">4 novembre 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Début à</p>
                    <p className="text-xl font-bold">19h30 (heure de Paris)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="text-xl font-bold">1h30</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Présentation de l'intervenant */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3">🧠 Découvrez comment l'IA peut devenir votre copilote business</h2>
                <p className="text-gray-700 mb-4">
                  Un webinaire <strong>100 % concret</strong>, animé par <strong className="text-[#6D3FC8]">Hugo Morales</strong>, fondateur d'EZIA, la première IA française pensée pour accompagner les entrepreneurs dans leur stratégie, leur communication et leur organisation.
                </p>
                <div className="bg-white rounded-lg p-4 border-l-4 border-[#6D3FC8] space-y-3">
                  <h3 className="font-semibold text-lg">Intervenant : Hugo Morales</h3>
                  <p className="text-gray-700">
                    Expert en transformation digitale et fondateur d'EZIOM & EZIA.ai
                  </p>
                  <p className="text-gray-700">
                    Depuis plus de <strong>10 ans</strong>, Hugo aide des centaines d'entrepreneurs à :
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>gagner du temps grâce à l'automatisation,</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>structurer leurs projets plus efficacement,</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>et transformer leurs idées en business durables.</span>
                    </li>
                  </ul>
                  <p className="text-gray-700">
                    Aujourd'hui, il vous dévoile <strong className="text-[#6D3FC8]">EZIA, votre copilote IA capable de penser, structurer et produire à vos côtés.</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ce que vous allez découvrir */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">💡 Au programme du webinaire</h2>
              <p className="text-gray-600">En <strong>90 minutes</strong>, vous allez découvrir comment l'IA peut transformer votre quotidien d'entrepreneur :</p>
              <div className="space-y-3">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Voir EZIA en action",
                    description: "Démonstration en direct des fonctionnalités clés"
                  },
                  {
                    icon: Target,
                    title: "Créer et structurer un projet business en moins de 15 minutes",
                    description: "Diagnostic, plan d'action et positionnement générés automatiquement"
                  },
                  {
                    icon: TrendingUp,
                    title: "Analyser votre marché sans passer des heures sur Google",
                    description: "Concurrence, tendances et opportunités révélées instantanément"
                  },
                  {
                    icon: Sparkles,
                    title: "Concevoir une stratégie marketing personnalisée et actionnable",
                    description: "Stratégie complète adaptée à votre activité"
                  },
                  {
                    icon: Zap,
                    title: "Produire un mois de contenu en une seule session",
                    description: "Articles, posts, newsletters, scripts vidéo : tout est prêt à publier"
                  },
                  {
                    icon: Globe,
                    title: "Session Q&A en direct",
                    description: "Posez vos questions et découvrez comment EZIA peut s'intégrer à votre activité"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white rounded-lg border">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus participants */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  🎁 Pack Early Bird offert aux participants
                </h2>
                <p className="text-gray-700 mb-4">Tous les inscrits recevront :</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700">
                        <strong>Guide PDF exclusif</strong> : "5 Prompts IA pour Entrepreneurs Pressés"
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Des prompts ChatGPT prêts à l'emploi pour gagner 10h/semaine
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700">
                        <strong>Accès prioritaire VIP</strong> à la waiting list EZIA
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Statut Early Bird + notification avant tout le monde au lancement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700">
                        <strong>Code promo exclusif -30%</strong> sur EZIA
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Valable 3 mois - réservé uniquement aux participants du webinaire
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Code promo valable 7 jours après le webinaire
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partie droite - Formulaire d'inscription */}
          <div className="lg:sticky lg:top-24">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">🔐 Inscription Gratuite</CardTitle>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    <Clock className="w-3 h-3" />
                    Places limitées
                  </div>
                </div>
                <CardDescription>
                  Réservez votre place maintenant 👇
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="jean.dupont@entreprise.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Fonction</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Directeur, Chef de projet, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Vos centres d'intérêt</Label>
                    <div className="space-y-2">
                      {interestOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={formData.interests.includes(option.id)}
                            onCheckedChange={(checked) =>
                              handleInterestChange(option.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={option.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Vos principaux défis actuels (max 3) :</Label>
                    <div className="space-y-2">
                      {challengeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`challenge-${option.id}`}
                            checked={formData.challenges.includes(option.id)}
                            disabled={!formData.challenges.includes(option.id) && formData.challenges.length >= 3}
                            onCheckedChange={(checked) =>
                              handleChallengeChange(option.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`challenge-${option.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.challenges.length >= 3 && (
                      <p className="text-xs text-orange-600">Maximum 3 défis sélectionnés</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">✏️ Décrivez brièvement votre projet (optionnel)</Label>
                    <textarea
                      id="projectDescription"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="Ex: Agence de marketing digital spécialisée dans les startups..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectations">💬 Qu'aimeriez-vous découvrir lors du webinaire ? (optionnel)</Label>
                    <textarea
                      id="expectations"
                      value={formData.expectations}
                      onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                      placeholder="Ex: Comment automatiser ma création de contenu..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        Réserver ma place gratuite
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    En vous inscrivant, vous acceptez de recevoir des communications de Ezia.ai.
                    Vous pouvez vous désabonner à tout moment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">🔎 Pourquoi participer ?</h2>
            <div className="space-y-2 text-gray-700 text-lg">
              <p>Parce que votre projet mérite les meilleurs outils.</p>
              <p>Parce qu'une IA peut vraiment devenir votre alliée — pas juste un gadget.</p>
              <p>Et parce que ce webinaire pourrait bien changer votre façon de travailler.</p>
            </div>
            <div className="pt-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] bg-clip-text text-transparent">
                🎯 Offrez-vous l'IA qui fait grandir votre business.
              </p>
              <p className="text-lg text-gray-600 mt-2">
                EZIA : votre partenaire digital, intelligent et éthique.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Ezia.ai - Tous droits réservés</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/privacy" className="hover:text-purple-600">Confidentialité</Link>
              <Link href="/terms" className="hover:text-purple-600">Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
