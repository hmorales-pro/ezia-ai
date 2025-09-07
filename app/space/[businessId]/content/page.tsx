"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import BlogEditor from "@/components/business/blog-editor";
import ContentCalendar from "@/components/business/content-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, PlusCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ContentPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("blog");

  useEffect(() => {
    fetchBusinessInfo();
    
    // Vérifier si on doit charger un article depuis le calendrier
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'blog' && urlParams.get('edit') === 'true') {
      setActiveTab('blog');
    }
  }, [businessId]);

  const fetchBusinessInfo = async () => {
    try {
      // Pour l'instant, on simule les données du business
      // Plus tard, on récupérera depuis l'API
      setBusiness({
        business_id: businessId,
        name: "Mon Business",
        description: "Description du business",
        industry: "commerce"
      });
    } catch (err) {
      setError("Impossible de charger les informations du business");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Business non trouvé"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion du contenu</h1>
        <p className="text-muted-foreground mt-2">
          Créez et gérez votre contenu marketing et vos articles de blog
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blog">
            <FileText className="h-4 w-4 mr-2" />
            Articles de blog
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendrier éditorial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="mt-6">
          <BlogEditor 
            businessId={businessId} 
            businessInfo={{
              name: business.name,
              description: business.description,
              industry: business.industry
            }} 
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ContentCalendar businessId={businessId} />
        </TabsContent>
      </Tabs>

      {/* Statistiques de contenu */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Articles publiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Prochaine publication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Aucune programmée</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}