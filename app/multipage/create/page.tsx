"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Globe, FileText, Info, Mail, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";

export default function CreateMultipagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    description: "",
    industry: "",
    targetAudience: ""
  });
  const [selectedPages, setSelectedPages] = useState({
    accueil: true,
    services: true,
    apropos: true,
    contact: true,
    blog: false,
    portfolio: false,
    boutique: false
  });
  const [customRequirements, setCustomRequirements] = useState("");

  const pageTypes = [
    { id: 'accueil', label: 'Accueil', icon: Globe, required: true },
    { id: 'services', label: 'Services/Produits', icon: ShoppingBag },
    { id: 'apropos', label: 'À propos', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'portfolio', label: 'Portfolio', icon: FileText },
    { id: 'boutique', label: 'Boutique', icon: ShoppingBag }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessInfo.name || !businessInfo.description) {
      toast.error("Veuillez remplir les informations requises");
      return;
    }

    const selectedPageTypes = Object.entries(selectedPages)
      .filter(([_, selected]) => selected)
      .map(([type, _]) => type);

    if (selectedPageTypes.length === 0) {
      toast.error("Veuillez sélectionner au moins une page");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/multipage/create', {
        businessName: businessInfo.name,
        businessInfo,
        pageTypes: selectedPageTypes,
        customRequirements
      });

      if (response.data.ok) {
        toast.success("Site multipage créé avec succès !");
        router.push(`/multipage/${response.data.project.id}/edit`);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error: any) {
      console.error('Error creating multipage site:', error);
      toast.error(error.message || "Erreur lors de la création du site");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Créer un site multipage</h1>
          <p className="text-gray-600">
            Configurez votre site web professionnel avec plusieurs pages
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({
                    ...businessInfo,
                    name: e.target.value
                  })}
                  placeholder="Ex: Restaurant Le Gourmet"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description de l'entreprise *</Label>
                <Textarea
                  id="description"
                  value={businessInfo.description}
                  onChange={(e) => setBusinessInfo({
                    ...businessInfo,
                    description: e.target.value
                  })}
                  placeholder="Décrivez votre entreprise, vos services, votre mission..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Secteur d'activité</Label>
                  <Input
                    id="industry"
                    value={businessInfo.industry}
                    onChange={(e) => setBusinessInfo({
                      ...businessInfo,
                      industry: e.target.value
                    })}
                    placeholder="Ex: Restauration"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Public cible</Label>
                  <Input
                    id="targetAudience"
                    value={businessInfo.targetAudience}
                    onChange={(e) => setBusinessInfo({
                      ...businessInfo,
                      targetAudience: e.target.value
                    })}
                    placeholder="Ex: Familles, professionnels"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection des pages */}
          <Card>
            <CardHeader>
              <CardTitle>Pages à inclure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {pageTypes.map((pageType) => {
                  const Icon = pageType.icon;
                  return (
                    <div
                      key={pageType.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <Checkbox
                        id={pageType.id}
                        checked={selectedPages[pageType.id as keyof typeof selectedPages]}
                        onCheckedChange={(checked) => {
                          if (!pageType.required) {
                            setSelectedPages({
                              ...selectedPages,
                              [pageType.id]: checked as boolean
                            });
                          }
                        }}
                        disabled={pageType.required}
                      />
                      <Label
                        htmlFor={pageType.id}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        {pageType.label}
                        {pageType.required && (
                          <span className="text-xs text-gray-500">(Requis)</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Exigences personnalisées */}
          <Card>
            <CardHeader>
              <CardTitle>Exigences personnalisées (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="Décrivez des besoins spécifiques pour votre site (couleurs, style, fonctionnalités particulières...)"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Bouton de soumission */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Créer le site multipage
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}