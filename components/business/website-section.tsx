"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, ExternalLink, Edit, Share2, Sparkles, 
  Loader2, Eye, RefreshCw, Copy, Check
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface WebsiteSectionProps {
  business: any;
  onRefresh: () => void;
}

export function WebsiteSection({ business, onRefresh }: WebsiteSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (business.websiteGeneratedAt || business.hasWebsite === 'yes') {
      fetchWebsite();
    }
  }, [business.business_id]);
  
  const fetchWebsite = async () => {
    try {
      const response = await api.get(`/api/business/${business.business_id}/website`);
      if (response.data.ok) {
        setWebsite(response.data.website);
      }
    } catch (error) {
      console.error("Error fetching website:", error);
    }
  };
  
  const generateWebsite = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/business/${business.business_id}/generate-website`);
      
      if (response.data.success) {
        toast.success("Site web généré avec succès !");
        onRefresh();
        fetchWebsite();
      } else {
        throw new Error(response.data.error || "Erreur lors de la génération");
      }
    } catch (error: any) {
      console.error("Error generating website:", error);
      toast.error(error.response?.data?.error || "Erreur lors de la génération du site");
    } finally {
      setLoading(false);
    }
  };
  
  const copyPublicLink = () => {
    if (website) {
      const publicUrl = `${window.location.origin}/sites/public/${website._id}`;
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Lien copié dans le presse-papier !");
    }
  };
  
  const openEditor = () => {
    if (website) {
      router.push(`/sites/${website._id}/edit`);
    }
  };
  
  const openPublicSite = () => {
    if (website) {
      window.open(`/sites/public/${website._id}`, '_blank');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Site Web
            </CardTitle>
            <CardDescription>
              Votre présence en ligne professionnelle
            </CardDescription>
          </div>
          {website && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              Publié
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!website && !business.websiteGeneratedAt ? (
          // Pas encore de site web
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              {business.wantsWebsite === 'yes' ? 
                "Votre site web sera généré automatiquement après les analyses" :
                business.wantsWebsite === 'later' ?
                "Génération du site web différée - à décider après les analyses" :
                "Aucun site web n'a été créé pour ce business"
              }
            </p>
            {business.website_prompt && (
              <Button 
                onClick={generateWebsite}
                disabled={loading}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer le site maintenant
                  </>
                )}
              </Button>
            )}
          </div>
        ) : website ? (
          // Site web existant
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-600">Nom du site</h4>
                <p className="text-gray-900">{website.name}</p>
              </div>
              
              {website.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Description</h4>
                  <p className="text-gray-900">{website.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Créé le</h4>
                <p className="text-gray-900">
                  {format(new Date(website.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
              
              {website.updatedAt && website.updatedAt !== website.createdAt && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Dernière modification</h4>
                  <p className="text-gray-900">
                    {format(new Date(website.updatedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              )}
              
              {website.version > 1 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Version</h4>
                  <p className="text-gray-900">v{website.version}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={openPublicSite}
                variant="outline"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir le site
              </Button>
              
              <Button
                onClick={openEditor}
                variant="outline"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              
              <Button
                onClick={copyPublicLink}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </>
                )}
              </Button>
              
              <Button
                onClick={generateWebsite}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Régénérer
              </Button>
            </div>
            
            {website.metadata?.websiteUrl && (
              <div className="text-center pt-2">
                <a 
                  href={website.metadata.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#6D3FC8] hover:text-[#5A35A5] hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {website.metadata.websiteUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          // En cours de chargement ou état intermédiaire
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des informations du site...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}