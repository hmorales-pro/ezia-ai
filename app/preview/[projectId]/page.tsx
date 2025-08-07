"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Download, Edit, Rocket } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Project {
  project_id: string;
  name: string;
  type: string;
  description: string;
  code: string;
  agents_contributions: {
    kiko?: string;
    milo?: string;
    yuna?: string;
    vera?: string;
  };
  created_at: string;
  analytics?: {
    views: number;
  };
}

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error("Impossible de charger le projet");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!project) return;
    
    const blob = new Blob([project.code], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeploy = () => {
    // TODO: Implémenter le déploiement vers Netlify/Vercel
    alert("Le déploiement sera bientôt disponible !");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-lg font-semibold">Aperçu du projet</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/preview/${projectId}/full`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Plein écran
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                size="sm"
                onClick={handleDeploy}
                className="bg-[#6D3FC8] hover:bg-[#5d35a8] text-white"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Déployer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Détails du projet</h2>
          
          <Card className="p-4 mb-4">
            <h3 className="font-medium mb-2">Nom du projet</h3>
            <p className="text-sm text-gray-600">{project?.name || 'Chargement...'}</p>
          </Card>
          
          <Card className="p-4 mb-4">
            <h3 className="font-medium mb-2">Type</h3>
            <p className="text-sm text-gray-600 capitalize">{project?.type || 'Chargement...'}</p>
          </Card>
          
          {project?.description && (
            <Card className="p-4 mb-4">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </Card>
          )}
          
          {project?.analytics && (
            <Card className="p-4 mb-4">
              <h3 className="font-medium mb-2">Statistiques</h3>
              <p className="text-sm text-gray-600">{project.analytics.views} vues</p>
            </Card>
          )}
          
          <Card className="p-4 mb-4">
            <h3 className="font-medium mb-2">Créé par</h3>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">👩‍💼 Ezia</span>
                <span className="text-xs text-gray-500">Coordination</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🧑‍💻 Kiko</span>
                <span className="text-xs text-gray-500">Développement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🎨 Milo</span>
                <span className="text-xs text-gray-500">Design</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🎯 Yuna</span>
                <span className="text-xs text-gray-500">UX</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">✍️ Vera</span>
                <span className="text-xs text-gray-500">Contenu</span>
              </div>
            </div>
          </Card>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => alert("L'édition sera bientôt disponible !")}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier le projet
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-gray-100 p-8">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={project?.code || '<div style="text-align: center; padding: 50px;">Chargement...</div>'}
              className="w-full h-full"
              title="Project Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}