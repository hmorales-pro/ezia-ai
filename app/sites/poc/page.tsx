"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Eye, 
  Code, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Palette,
  PenTool,
  Globe
} from "lucide-react";
import Link from "next/link";

interface GenerationStatus {
  phase: string;
  agent: string;
  progress: number;
  message: string;
}

export default function SiteGeneratorPOC() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const industries = [
    { value: "restaurant", label: "Restaurant / Alimentation" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "consulting", label: "Consulting / Services" },
    { value: "health", label: "Santé / Bien-être" },
    { value: "education", label: "Éducation / Formation" },
    { value: "tech", label: "Technologie / SaaS" },
    { value: "realestate", label: "Immobilier" },
    { value: "fitness", label: "Sport / Fitness" },
    { value: "beauty", label: "Beauté / Esthétique" },
    { value: "travel", label: "Voyage / Tourisme" }
  ];

  const generateSite = async () => {
    if (!businessName || !industry) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedHTML("");

    try {
      const response = await fetch("/api/sites/generate-poc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          industry,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setGeneratedHTML(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
      setStatus(null);
    }
  };

  const downloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, "-")}-site.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate status updates
  if (isGenerating && !status) {
    setTimeout(() => {
      setStatus({
        phase: "Analyse",
        agent: "Site Architect",
        progress: 25,
        message: "Analyse du business et création de la structure..."
      });
    }, 1000);

    setTimeout(() => {
      setStatus({
        phase: "Design",
        agent: "Kiko",
        progress: 50,
        message: "Création du système de design et de l'identité visuelle..."
      });
    }, 3000);

    setTimeout(() => {
      setStatus({
        phase: "Construction",
        agent: "Lex",
        progress: 75,
        message: "Construction du site avec HTML/CSS/JS..."
      });
    }, 5000);

    setTimeout(() => {
      setStatus({
        phase: "Contenu",
        agent: "Milo",
        progress: 90,
        message: "Génération du contenu et optimisation SEO..."
      });
    }, 7000);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Générateur de Sites POC Ezia
            </h1>
            <p className="text-gray-600 mt-2">
              Système multi-agent pour la création de sites web professionnels
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Version POC
          </Badge>
        </div>

        <Alert className="bg-purple-50 border-purple-200">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertTitle>Proof of Concept</AlertTitle>
          <AlertDescription>
            Ce générateur utilise notre système multi-agent propriétaire avec Kiko (Design), 
            Lex (Développement), Milo (Copywriting) et un architecte de site pour créer 
            des sites adaptés à votre industrie.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Business</CardTitle>
            <CardDescription>
              Décrivez votre business pour générer un site personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Nom du Business *</Label>
              <Input
                id="businessName"
                placeholder="Ex: Restaurant Le Gourmet"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industrie *</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={isGenerating}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Sélectionnez une industrie" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre business, vos services, votre clientèle cible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={generateSite} 
              disabled={isGenerating || !businessName || !industry}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Générer le Site
                </>
              )}
            </Button>

            {/* Status */}
            {status && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{status.phase}</span>
                  <span className="text-sm text-gray-600">{status.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-medium">{status.agent}:</span>
                  {status.message}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Link href="/sites/poc/debug">
                <Button variant="outline" size="sm" className="w-full">
                  <Code className="mr-2 h-4 w-4" />
                  Mode Debug
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
            <CardDescription>
              Visualisez votre site généré
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedHTML ? (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="mr-2 h-4 w-4" />
                    Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={generatedHTML}
                      className="w-full h-[500px]"
                      title="Site Preview"
                    />
                  </div>
                  <Button 
                    onClick={downloadHTML} 
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le HTML
                  </Button>
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs">
                      <code>{generatedHTML}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun site généré</p>
                  <p className="text-sm mt-2">
                    Remplissez le formulaire et cliquez sur "Générer"
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Architecture Intelligente</h3>
            <p className="text-sm text-gray-600">
              Notre agent architecte analyse votre business et crée une structure optimale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold mb-2">Design Professionnel</h3>
            <p className="text-sm text-gray-600">
              Kiko crée un système de design unique adapté à votre industrie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Code Optimisé</h3>
            <p className="text-sm text-gray-600">
              Lex génère du code HTML/CSS/JS propre et responsive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <PenTool className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Contenu Pertinent</h3>
            <p className="text-sm text-gray-600">
              Milo rédige du contenu SEO-friendly spécifique à votre secteur
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}