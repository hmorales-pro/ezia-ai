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
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    fetchWebsites();
  }, [business.business_id]);
  
  const fetchWebsites = async () => {
    try {
      const allWebsites = [];
      
      // Récupérer les projets simples
      try {
        const response = await api.get('/api/user-projects-db');
        if (response.data.ok) {
          const businessWebsites = response.data.projects.filter(
            (project: any) => project.businessId === business.business_id
          );
          allWebsites.push(...businessWebsites);
        }
      } catch (error) {
        console.log("Error fetching simple projects:", error);
      }
      
      
      // Trier par date de mise à jour
      allWebsites.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setWebsites(allWebsites);
      // Sélectionner le plus récent par défaut
      if (allWebsites.length > 0) {
        setSelectedWebsite(allWebsites[0]);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    }
  };
  
  const generateWebsite = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/business/${business.business_id}/generate-website`);
      
      if (response.data.ok || response.data.success) {
        toast.success("Site web généré avec succès !");
        onRefresh();
        // Attendre un peu avant de récupérer le site web pour s'assurer qu'il est bien enregistré
        setTimeout(() => {
          fetchWebsites();
        }, 1000);
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
    if (selectedWebsite) {
      const publicUrl = selectedWebsite.subdomain && selectedWebsite.status === 'published'
        ? `https://${selectedWebsite.subdomain}.ezia.ai`
        : `${window.location.origin}/sites/view/${selectedWebsite.projectId}`;
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Lien copié dans le presse-papier !");
    }
  };
  
  const openEditor = () => {
    if (selectedWebsite) {
      router.push(`/sites/${selectedWebsite.projectId}/edit`);
    }
  };
  
  const openPublicSite = () => {
    if (selectedWebsite) {
      if (selectedWebsite.subdomain && selectedWebsite.status === 'published') {
        window.open(`https://${selectedWebsite.subdomain}.ezia.ai`, '_blank');
      } else {
        window.open(`/sites/view/${selectedWebsite.projectId}`, '_blank');
      }
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
          {websites.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              {websites.length} site{websites.length > 1 ? 's' : ''} publié{websites.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {websites.length === 0 && !business.websiteGeneratedAt ? (
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
        ) : selectedWebsite ? (
          // Site web existant
          <div className="space-y-4">
            {/* Sélecteur de sites si plusieurs */}
            {websites.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600">Sites disponibles</label>
                <select 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D3FC8]"
                  value={selectedWebsite.projectId}
                  onChange={(e) => {
                    const site = websites.find(w => w.projectId === e.target.value);
                    setSelectedWebsite(site);
                  }}
                >
                  {websites.map((site) => (
                    <option key={site.projectId} value={site.projectId}>
                      {site.name} - {format(new Date(site.createdAt), "d MMM yyyy", { locale: fr })}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-sm text-gray-600">Nom du site</h4>
                <p className="text-gray-900">{selectedWebsite.name}</p>
              </div>
              
              {selectedWebsite.subdomain && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Adresse du site</h4>
                  <p className="text-[#6D3FC8] font-medium">
                    {selectedWebsite.subdomain}.ezia.ai
                  </p>
                </div>
              )}
              
              {selectedWebsite.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Description</h4>
                  <p className="text-gray-900">{selectedWebsite.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Créé le</h4>
                <p className="text-gray-900">
                  {format(new Date(selectedWebsite.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
              
              {selectedWebsite.updatedAt && selectedWebsite.updatedAt !== selectedWebsite.createdAt && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Dernière modification</h4>
                  <p className="text-gray-900">
                    {format(new Date(selectedWebsite.updatedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              )}
              
              {selectedWebsite.version > 1 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Version</h4>
                  <p className="text-gray-900">v{selectedWebsite.version}</p>
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
            
            {selectedWebsite.metadata?.websiteUrl && (
              <div className="text-center pt-2">
                <a 
                  href={selectedWebsite.metadata.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#6D3FC8] hover:text-[#5A35A5] hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {selectedWebsite.metadata.websiteUrl}
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