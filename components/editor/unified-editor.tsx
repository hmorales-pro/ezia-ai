"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code, Layers, Sparkles, Globe, Settings,
  ArrowRight, Zap, Eye, Download
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Import des composants existants
import { EziaSimpleEditor } from "./ezia-simple-editor";
import { MultipageEditor } from "./multipage-editor";
import { EziaEcosystemPanel } from "./ezia-ecosystem-panel";
import { ResponsivePreview } from "./responsive-preview";
import { CompleteSiteExportModal } from "./complete-site-export-modal";

interface UnifiedEditorProps {
  projectId?: string;
  businessId?: string;
  businessName?: string;
  initialPrompt?: string;
  onProjectSaved?: (projectId: string) => void;
}

type ProjectType = 'simple' | 'multipage';
type EditorView = 'editor' | 'ecosystem' | 'preview';

export function UnifiedEditor({
  projectId,
  businessId,
  businessName,
  initialPrompt,
  onProjectSaved
}: UnifiedEditorProps) {
  const [projectType, setProjectType] = useState<ProjectType>('simple');
  const [currentView, setCurrentView] = useState<EditorView>('editor');
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [html, setHtml] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Vérifier si l'écosystème est désactivé
  const isEcosystemDisabled = process.env.NEXT_PUBLIC_DISABLE_ECOSYSTEM_FEATURE === 'true';

  // Charger les données du projet
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // Essayer d'abord comme projet multipage
      const multipageResponse = await api.get(`/api/multipage/${projectId}`).catch(() => null);
      if (multipageResponse && multipageResponse.data && multipageResponse.data.ok) {
        setProjectData(multipageResponse.data.project);
        setProjectType('multipage');
        setSubdomain(multipageResponse.data.project.subdomain || '');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // Si ce n'est pas un projet multipage, essayer comme projet simple
      try {
        const simpleResponse = await api.get(`/api/user-projects-db/${projectId}`);
        if (simpleResponse.data && simpleResponse.data.project) {
          setProjectData(simpleResponse.data.project);
          setProjectType('simple');
          setHtml(simpleResponse.data.project.html || '');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error loading simple project:', error);
      }
    }
    
    setIsLoading(false);
  };

  const handleConvertToMultipage = async () => {
    if (projectType === 'multipage') return;
    
    const confirmed = confirm(
      "Voulez-vous convertir ce site en site multipage ? Cela permettra d'ajouter de nouvelles pages et fonctionnalités avancées."
    );
    
    if (!confirmed) return;

    try {
      const response = await api.post('/api/multipage/convert', {
        simpleProjectId: projectId,
        businessId,
        businessName
      });

      if (response.data.ok) {
        toast.success("Site converti en multipage avec succès !");
        setProjectType('multipage');
        setProjectData(response.data.project);
        setSubdomain(response.data.project.subdomain || '');
        // Recharger complètement les données
        window.location.reload();
      }
    } catch (error) {
      console.error('Error converting to multipage:', error);
      toast.error("Erreur lors de la conversion");
    }
  };

  const handleFeatureAdded = () => {
    // Recharger les données après ajout de fonctionnalité
    loadProjectData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-8 h-8 animate-pulse text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {projectData?.name || businessName || 'Nouveau site'}
              </h1>
              <Badge variant={projectType === 'multipage' ? 'default' : 'secondary'}>
                <Layers className="w-3 h-3 mr-1" />
                {projectType === 'multipage' ? 'Multipage' : 'Simple'}
              </Badge>
              {subdomain && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  {subdomain}.ezia.ai
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Boutons de vue */}

              {!isEcosystemDisabled && (
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={currentView === 'editor' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('editor')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Éditeur
                </Button>
                <Button
                  size="sm"
                  variant={currentView === 'ecosystem' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('ecosystem')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Écosystème
                </Button>
                <Button
                  size="sm"
                  variant={currentView === 'preview' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('preview')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
              </div>
              )}

              {/* Actions */}
              {projectType === 'simple' && currentView === 'ecosystem' && !isEcosystemDisabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConvertToMultipage}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Passer en multipage
                </Button>
              )}

              {/* Bouton Télécharger ZIP complet */}
              {businessName && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger ZIP
                </Button>
              )}

              {subdomain && projectData?.status === 'published' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${subdomain}.ezia.ai`, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Voir le site
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1">
        {/* Vue Éditeur */}
        {currentView === 'editor' && (
          <>
            {projectType === 'simple' ? (
              <EziaSimpleEditor
                projectId={projectId}
                businessId={businessId}
                businessName={businessName}
                initialPrompt={initialPrompt}
                onProjectSaved={onProjectSaved}
              />
            ) : (
              <MultipageEditor
                projectId={projectId || ''}
                businessId={businessId}
                businessName={businessName}
              />
            )}
          </>
        )}

        {/* Vue Écosystème */}
        {currentView === 'ecosystem' && !isEcosystemDisabled && (
          <div className="container max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Faites évoluer votre site</h2>
              <p className="text-gray-600">
                Ajoutez de nouvelles pages et fonctionnalités pour développer votre présence en ligne
              </p>
            </div>

            <EziaEcosystemPanel
              projectId={projectId || ''}
              businessId={businessId}
              businessInfo={{
                name: businessName || projectData?.businessName,
                description: projectData?.description,
                industry: projectData?.metadata?.industry,
                targetAudience: projectData?.metadata?.targetAudience
              }}
              currentSiteType={projectType}
              onFeatureAdded={handleFeatureAdded}
            />

            {/* Message d'information pour site simple */}
            {projectType === 'simple' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Limitations du mode simple
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Votre site actuel est en mode simple (une seule page). Pour ajouter des pages supplémentaires 
                    comme un blog ou une boutique, vous devez passer en mode multipage.
                  </p>
                  <Button onClick={handleConvertToMultipage}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Convertir en site multipage
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Vue Aperçu */}
        {currentView === 'preview' && (
          <div className="h-[calc(100vh-64px)]">
            <ResponsivePreview 
              html={projectType === 'simple' ? html : getMultipageHtml()} 
            />
          </div>
        )}
      </div>

      {/* Modal de téléchargement ZIP complet */}
      <CompleteSiteExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        businessName={businessName || projectData?.name || "Mon Business"}
        industry={projectData?.industry || "Services professionnels"}
        description={projectData?.description}
      />
    </div>
  );

  function getMultipageHtml(): string {
    if (!projectData || projectType !== 'multipage') return '';
    
    // Pour un projet multipage, afficher la page d'accueil
    const homePage = projectData.pages?.find((p: any) => p.isHomePage);
    if (!homePage) return '<p>Aucune page d\'accueil définie</p>';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${homePage.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${projectData.globalCss || ''}\n${homePage.css || ''}</style>
</head>
<body>
    ${homePage.html}
    <script>${projectData.globalJs || ''}\n${homePage.js || ''}</script>
</body>
</html>`;
  }
}