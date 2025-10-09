"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Globe,
  Sparkles,
  MoreVertical,
  Home,
  Users,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";

interface WebPage {
  pageId: string;
  slug: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdBy: 'user' | 'ai';
  updatedAt: string;
  views?: number;
}

export default function SitePagesPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<WebPage[]>([]);

  useEffect(() => {
    fetchPages();
  }, [businessId]);

  const fetchPages = async () => {
    try {
      const response = await api.get(`/api/web-projects/${businessId}/pages`);

      if (response.data.success) {
        setPages(response.data.pages);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching pages:', error);
        toast.error('Erreur lors du chargement des pages');
      }
      // Si 404, c'est normal (pas encore de projet web)
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    router.push(`/sites/new?businessId=${businessId}`);
  };

  const handleEditPage = (pageId: string) => {
    // TODO: Ouvrir l'éditeur de page
    toast.info('Éditeur de page - bientôt disponible');
  };

  const handlePreviewPage = (slug: string) => {
    // TODO: Ouvrir la prévisualisation
    toast.info('Prévisualisation - bientôt disponible');
  };

  const handleDeletePage = (pageId: string) => {
    // TODO: Implémenter la suppression
    toast.info('Suppression - bientôt disponible');
  };

  const getPageIcon = (slug: string) => {
    if (slug === '/') return Home;
    if (slug === '/about' || slug === '/equipe') return Users;
    if (slug === '/contact') return Mail;
    return FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement des pages...</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-[#E0E0E0]">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
              Créez votre première page
            </h2>
            <p className="text-[#666666] max-w-md mx-auto mb-8">
              Utilisez l'IA pour générer des pages professionnelles en quelques secondes.
              Décrivez ce que vous voulez et laissez Ezia créer la page pour vous.
            </p>
            <Button
              size="lg"
              onClick={handleCreatePage}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Créer avec l'IA
            </Button>
          </CardContent>
        </Card>

        {/* Templates suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">
            Suggestions de pages
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCreatePage}>
              <CardHeader>
                <Home className="w-8 h-8 text-[#6D3FC8] mb-2" />
                <CardTitle className="text-base">Page d'accueil</CardTitle>
                <CardDescription className="text-sm">
                  Créez une page d'accueil engageante
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCreatePage}>
              <CardHeader>
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="text-base">À propos</CardTitle>
                <CardDescription className="text-sm">
                  Présentez votre équipe et vos valeurs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCreatePage}>
              <CardHeader>
                <Mail className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle className="text-base">Contact</CardTitle>
                <CardDescription className="text-sm">
                  Formulaire de contact et coordonnées
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E1E1E]">Pages du site</h2>
          <p className="text-sm text-[#666666] mt-1">
            Gérez toutes les pages de votre site web
          </p>
        </div>
        <Button
          onClick={handleCreatePage}
          className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle page
        </Button>
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        {pages.map((page) => {
          const PageIcon = getPageIcon(page.slug);

          return (
            <Card key={page.pageId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left: Page info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6D3FC8]/10 to-[#8B5CF6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PageIcon className="w-6 h-6 text-[#6D3FC8]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-[#1E1E1E]">
                          {page.title}
                        </h3>
                        {page.isPublished ? (
                          <Badge variant="default" className="text-xs">
                            Publié
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Brouillon
                          </Badge>
                        )}
                        {page.createdBy === 'ai' && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Généré par l'IA
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-[#666666] mb-2">
                        {page.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#666666]">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {page.slug === '/' ? '/' : page.slug}
                        </span>
                        {page.views !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {page.views} vues
                          </span>
                        )}
                        <span>
                          Modifié {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewPage(page.slug)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEditPage(page.pageId)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Éditer
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPage(page.pageId)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Éditer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePreviewPage(page.slug)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Prévisualiser
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.pageId)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#6D3FC8]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1E1E1E] mb-2">
                Besoin d'aide pour créer une page ?
              </h3>
              <p className="text-sm text-[#666666] mb-3">
                Ezia peut vous aider à créer n'importe quelle page. Décrivez simplement ce que vous voulez :
                page d'accueil, services, équipe, contact, etc.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="bg-white hover:bg-gray-50"
                onClick={handleCreatePage}
              >
                Créer une page avec l'IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
