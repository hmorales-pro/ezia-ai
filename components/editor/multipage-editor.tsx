"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Code, Eye, Save, Loader2, 
  RefreshCw, Download, Share2, Settings,
  Plus, Home, FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MultipageNavigator } from "./multipage-navigator";
import { ResponsivePreview } from "./responsive-preview";
import { EziaPageSuggestions } from "./ezia-page-suggestions";
import { api } from "@/lib/api";
import { buildContextualModification } from "@/lib/ai-prompts-multipage";

interface MultipageEditorProps {
  projectId: string;
  businessId?: string;
  businessName?: string;
}

export function MultipageEditor({ 
  projectId, 
  businessId, 
  businessName 
}: MultipageEditorProps) {
  const [project, setProject] = useState<any>(null);
  const [currentPageId, setCurrentPageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Charger le projet
  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/api/multipage/${projectId}`);
      if (response.data.ok) {
        setProject(response.data.project);
        // Sélectionner la page d'accueil par défaut
        const homePage = response.data.project.pages.find((p: any) => p.isHomePage);
        if (homePage) {
          setCurrentPageId(homePage.id);
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Erreur lors du chargement du projet");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPage = () => {
    if (!project || !currentPageId) return null;
    return project.pages.find((p: any) => p.id === currentPageId);
  };

  const getPageHtml = () => {
    const page = getCurrentPage();
    if (!page) return "";
    
    // Construire le HTML complet avec navigation
    const navHtml = generateNavigationHtml();
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        ${project.globalCss || ''}
        ${page.css || ''}
    </style>
</head>
<body>
    ${navHtml}
    ${page.html}
    <script>
        ${project.globalJs || ''}
        ${page.js || ''}
    </script>
</body>
</html>`;
  };

  const generateNavigationHtml = () => {
    if (!project.navigation || !project.navigation.items.length) return '';
    
    const navItems = project.navigation.items
      .sort((a: any, b: any) => a.order - b.order)
      .map((item: any) => {
        const page = project.pages.find((p: any) => p.id === item.pageId);
        if (!page) return '';
        const isActive = page.id === currentPageId;
        return `
          <a href="#" 
             onclick="event.preventDefault(); window.parent.postMessage({type: 'navigate', pageId: '${page.id}'}, '*')"
             class="nav-link ${isActive ? 'active' : ''}">
            ${item.label}
          </a>
        `;
      })
      .join('');
    
    return `
      <nav class="site-navigation ${project.navigation.type} bg-white shadow-md p-4">
        <div class="container mx-auto flex items-center justify-between">
          <div class="font-bold text-xl">${project.name}</div>
          <div class="flex space-x-6">
            ${navItems}
          </div>
        </div>
      </nav>
    `;
  };

  // Écouter les messages de navigation depuis l'iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate' && event.data.pageId) {
        setCurrentPageId(event.data.pageId);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Mettre à jour l'iframe quand la page change
  useEffect(() => {
    if (iframeRef.current && project) {
      iframeRef.current.srcdoc = getPageHtml();
    }
  }, [currentPageId, project]);

  const handlePageAdd = async (pageData: any) => {
    try {
      setIsGenerating(true);
      const response = await api.post(`/api/multipage/${projectId}/pages`, {
        pageType: pageData.name,
        pageData
      });
      
      if (response.data.ok) {
        await loadProject();
        toast.success("Page ajoutée avec succès");
      }
    } catch (error) {
      console.error("Error adding page:", error);
      toast.error("Erreur lors de l'ajout de la page");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePageUpdate = async (pageId: string, updates: any) => {
    try {
      setIsSaving(true);
      const response = await api.put(`/api/multipage/${projectId}/pages/${pageId}`, updates);
      
      if (response.data.ok) {
        await loadProject();
        toast.success("Page mise à jour");
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleModification = async () => {
    if (!modificationPrompt || !currentPageId) return;
    
    try {
      setIsGenerating(true);
      const currentPage = getCurrentPage();
      
      const response = await api.post(`/api/multipage/${projectId}/modify`, {
        pageId: currentPageId,
        modification: modificationPrompt,
        context: {
          currentPage,
          allPages: project.pages,
          theme: project.theme
        }
      });
      
      if (response.data.ok) {
        await loadProject();
        toast.success("Modifications appliquées");
        setModificationPrompt("");
      }
    } catch (error) {
      console.error("Error modifying page:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      setIsSaving(true);
      const response = await api.put(`/api/multipage/${projectId}`, {
        status: 'published'
      });
      
      if (response.data.ok) {
        toast.success("Projet sauvegardé et publié");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Projet non trouvé</p>
      </div>
    );
  }

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{project.name}</h1>
              {currentPage && (
                <Badge variant="secondary">
                  <FileText className="w-3 h-3 mr-1" />
                  {currentPage.name}
                </Badge>
              )}
              {project.subdomain && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  {project.subdomain}.ezia.ai
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {project.subdomain && project.status === 'published' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${project.subdomain}.ezia.ai`, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Voir le site
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="w-4 h-4 mr-2" />
                {showCode ? "Masquer" : "Voir"} le code
              </Button>
              
              <Button
                size="sm"
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Publier le site
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Navigation des pages */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <MultipageNavigator
              pages={project.pages}
              currentPageId={currentPageId}
              onPageSelect={setCurrentPageId}
              onPageAdd={handlePageAdd}
              onPageUpdate={handlePageUpdate}
              onPageDelete={async (pageId) => {
                try {
                  const response = await api.delete(`/api/multipage/${projectId}/pages/${pageId}`);
                  if (response.data.ok) {
                    await loadProject();
                    toast.success("Page supprimée");
                  }
                } catch (error) {
                  console.error("Error deleting page:", error);
                  toast.error("Erreur lors de la suppression");
                }
              }}
              onPageDuplicate={async (pageId) => {
                try {
                  const response = await api.post(`/api/multipage/${projectId}/duplicate/${pageId}`);
                  if (response.data.ok) {
                    await loadProject();
                    setCurrentPageId(response.data.page.id);
                    toast.success("Page dupliquée avec succès");
                  }
                } catch (error) {
                  console.error("Error duplicating page:", error);
                  toast.error("Erreur lors de la duplication");
                }
              }}
            />
            
            {/* Suggestions d'Ezia */}
            <div className="mt-4">
              <EziaPageSuggestions
                projectId={projectId}
                businessInfo={{
                  name: businessName || project.businessName,
                  description: project.description,
                  industry: project.metadata?.industry,
                  targetAudience: project.metadata?.targetAudience
                }}
                existingPages={project.pages.map((p: any) => p.slug)}
                onPageAdded={loadProject}
              />
            </div>
            
            {/* Zone de modification */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Modifier cette page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    placeholder="Ex: Ajouter une section témoignages"
                    value={modificationPrompt}
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && modificationPrompt) {
                        handleModification();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleModification}
                    disabled={!modificationPrompt || isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Appliquer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <ResponsivePreview
                html={getPageHtml()}
                iframeRef={iframeRef}
              />
            </CardContent>
          </Card>
        </div>

        {/* Code editor (if visible) */}
        {showCode && (
          <div className="w-1/3 bg-white border-l p-4 overflow-y-auto">
            <Tabs defaultValue="html">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JS</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{currentPage?.html || ''}</code>
                </pre>
              </TabsContent>
              <TabsContent value="css">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`/* Global CSS */\n${project.globalCss || ''}\n\n/* Page CSS */\n${currentPage?.css || ''}`}</code>
                </pre>
              </TabsContent>
              <TabsContent value="js">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// Global JS\n${project.globalJs || ''}\n\n// Page JS\n${currentPage?.js || ''}`}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}