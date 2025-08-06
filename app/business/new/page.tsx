"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function NewBusinessPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "idea"
  });

  const industries = [
    "Technology",
    "E-commerce",
    "Services",
    "Santé",
    "Education",
    "Finance",
    "Immobilier",
    "Restauration",
    "Art & Culture",
    "Sport & Bien-être",
    "Consulting",
    "Autre"
  ];

  const stages = [
    { value: "idea", label: "Idée", description: "J'ai une idée mais pas encore commencé" },
    { value: "startup", label: "Startup", description: "Je démarre mon activité" },
    { value: "growth", label: "Croissance", description: "Mon business est en développement" },
    { value: "established", label: "Établi", description: "Mon business est mature" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      router.push("/dashboard");
      return;
    }

    if (!formData.name || !formData.description || !formData.industry) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Submitting to:", "/me/business");
      console.log("FormData:", formData);
      console.log("API base URL:", api.defaults.baseURL);
      
      const response = await api.post("/me/business", formData);
      
      if (response.data.ok) {
        toast.success("Business créé avec succès !");
        router.push(`/business/${response.data.business.business_id}`);
      } else {
        toast.error(response.data.error || "Erreur lors de la création");
      }
    } catch (error: any) {
      console.error("Error creating business:", error);
      console.error("Error response:", error.response);
      console.error("Error config:", error.config);
      
      if (error.response?.status === 404) {
        console.error("404 URL attempted:", error.config?.url);
        console.error("Full URL:", error.config?.baseURL + error.config?.url);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du business";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-500" />
                <h1 className="text-xl font-semibold">Nouveau Business</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl">Créer votre business</CardTitle>
            <CardDescription>
              Commençons par les informations de base. Ezia utilisera ces données 
              pour personnaliser son accompagnement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du business *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Ma Super Startup"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre business en quelques phrases..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d&apos;activité *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stade de développement *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {stages.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, stage: stage.value })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.stage === stage.value
                          ? "bg-violet-600/20 border-violet-600"
                          : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                      }`}
                      disabled={loading}
                    >
                      <div className="font-medium mb-1">{stage.label}</div>
                      <div className="text-xs text-zinc-400">{stage.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer et continuer avec Ezia
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-violet-900/20 rounded-lg border border-violet-600/30">
          <p className="text-sm text-violet-200">
            <strong>💡 Astuce :</strong> Plus vous donnez d&apos;informations précises, 
            mieux Ezia pourra vous accompagner. Vous pourrez toujours modifier 
            ces informations plus tard.
          </p>
        </div>
      </main>
    </div>
  );
}