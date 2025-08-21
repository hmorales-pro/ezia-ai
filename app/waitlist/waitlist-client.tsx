"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Users, 
  Zap, 
  Globe,
  TrendingUp,
  MessageSquare,
  Loader2
} from "lucide-react";

export default function WaitlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post("/api/waitlist", formData);
      
      if (response.data.success) {
        setSubmitted(true);
        setPosition(response.data.position);
        toast.success("Inscription réussie !");
      } else {
        toast.error(response.data.error || "Erreur lors de l'inscription");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Cet email est déjà inscrit sur la liste d'attente");
      } else {
        toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E0E0E0] shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">
              Inscription confirmée !
            </h2>
            
            <p className="text-[#666666] mb-6">
              Merci de votre intérêt pour Ezia. Nous vous contacterons dès que votre accès sera disponible.
            </p>
            
            {position && (
              <Badge variant="secondary" className="mb-6">
                Position #{position} sur la liste d'attente
              </Badge>
            )}
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
              >
                Retour à l'accueil
              </Button>
              
              <p className="text-sm text-[#666666]">
                En attendant, suivez-nous sur nos réseaux sociaux pour rester informé des dernières actualités.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1]">
      {/* Header */}
      <header className="border-b border-[#E0E0E0] backdrop-blur-xl bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo avec lien retour */}
            <div className="flex items-center gap-4">
              <Link href="/home" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Ezia Logo"
                    width={40}
                    height={40}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <h1 className="text-xl font-bold text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">Ezia</h1>
              </Link>
              <span className="text-sm text-[#666666] hidden sm:inline">|</span>
              <span className="text-sm text-[#666666] hidden sm:inline">Liste d'attente</span>
            </div>
            
            {/* Actions à droite */}
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors hidden sm:inline">
                Retour à l'accueil
              </Link>
              <Link href="/auth/ezia">
                <Button size="sm" className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero */}
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-2">
              <Sparkles className="w-3 h-3" />
              Accès limité
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] leading-tight">
              Rejoignez la liste d'attente d'
              <span className="text-[#6D3FC8]">Ezia</span>
            </h1>
            
            <p className="text-xl text-[#666666]">
              Ezia est actuellement en phase de développement avec un accès limité. 
              Inscrivez-vous pour être parmi les premiers à découvrir notre plateforme 
              révolutionnaire propulsée par l'IA.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#6D3FC8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#6D3FC8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1E1E]">Partenaire business IA</h3>
                  <p className="text-sm text-[#666666]">Conversez naturellement avec Ezia pour développer votre activité</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#6D3FC8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#6D3FC8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1E1E]">Stratégie complète</h3>
                  <p className="text-sm text-[#666666]">Analyse de marché, positionnement, marketing et croissance</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#6D3FC8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#6D3FC8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1E1E]">Présence digitale</h3>
                  <p className="text-sm text-[#666666]">Sites web, réseaux sociaux, SEO et publicité en ligne</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#666666]">
                <span className="font-semibold text-[#1E1E1E]">+100</span> professionnels déjà inscrits
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <Card className="border-[#E0E0E0] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Inscrivez-vous</CardTitle>
              <CardDescription>
                Soyez informé dès que votre accès sera disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Entreprise (optionnel)</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Votre entreprise"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Parlez-nous de votre projet..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Rejoindre la liste d'attente
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-[#666666] mt-4">
                  En vous inscrivant, vous acceptez de recevoir des emails concernant 
                  l'ouverture de votre accès à Ezia.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}