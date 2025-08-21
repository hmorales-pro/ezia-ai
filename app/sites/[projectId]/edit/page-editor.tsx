"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectsApi } from "@/lib/api-projects";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Save, Eye, Share2, Globe, 
  Code, Palette, Loader2, RefreshCw, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Importer Monaco Editor dynamiquement
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditSitePage() {
  const router = useRouter();
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/user-projects-db/${projectId}/get`);
      
      if (response.data.ok && response.data.project) {
        const proj = response.data.project;
        setProject(proj);
        
        // Si le HTML contient déjà la structure complète, extraire le body
        if (proj.html && proj.html.includes('<!DOCTYPE')) {
          // Extraire le contenu du body
          const bodyMatch = proj.html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          if (bodyMatch) {
            setHtml(bodyMatch[1].trim());
          } else {
            setHtml(proj.html);
          }
        } else {
          setHtml(proj.html || "");
        }
        
        setCss(proj.css || "");
        setJs(proj.js || "");
      } else {
        toast.error("Projet non trouvé");
        router.push("/workspace");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Erreur lors du chargement du projet");
      router.push("/workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await projectsApi.updateProject(projectId as string, {
        html,
        css,
        js,
        prompt: project?.prompt
      });
      
      if (response.ok) {
        toast.success("Site web sauvegardé avec succès");
        setProject(response.project);
      } else {
        throw new Error(response.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  const getPreviewContent = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project?.name || 'Aperçu'}</title>
    <style>${css}</style>
</head>
<body>
${html}
<script>${js}</script>
</body>
</html>`;
  };

  const handleShare = () => {
    const publicUrl = `${window.location.origin}/sites/public/${projectId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Lien copié dans le presse-papier !");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workspace">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">{project?.name}</h1>
                <p className="text-sm text-[#666666]">{project?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/sites/public/${projectId}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir public
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-200px)]">
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="html">
              <Code className="w-4 h-4 mr-2" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="css">
              <Palette className="w-4 h-4 mr-2" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="js">
              <Code className="w-4 h-4 mr-2" />
              JavaScript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-full">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-lg">Aperçu en temps réel</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshPreview}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <iframe
                  key={iframeKey}
                  srcDoc={getPreviewContent()}
                  className="w-full h-full border-0"
                  title="Aperçu du site"
                  sandbox="allow-scripts"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="html" className="h-full">
            <Card className="h-full">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Code HTML</CardTitle>
                <CardDescription>Modifiez le contenu HTML de votre site</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <MonacoEditor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={html}
                  onChange={(value) => setHtml(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css" className="h-full">
            <Card className="h-full">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Styles CSS</CardTitle>
                <CardDescription>Personnalisez l'apparence de votre site</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <MonacoEditor
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  value={css}
                  onChange={(value) => setCss(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="js" className="h-full">
            <Card className="h-full">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">JavaScript</CardTitle>
                <CardDescription>Ajoutez de l'interactivité à votre site</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <MonacoEditor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={js}
                  onChange={(value) => setJs(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}