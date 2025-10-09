"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  FileText,
  ShoppingCart,
  TrendingUp,
  Eye,
  Users,
  ArrowUpRight,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { WebsiteCreationForm } from "@/components/web/website-creation-form";

interface WebProject {
  _id: string;
  projectId: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  features: {
    website: boolean;
    blog: boolean;
    shop: boolean;
  };
  analytics?: {
    views: number;
    uniqueVisitors: number;
  };
  pagesCount?: number;
  blogPostsCount?: number;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function WebOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [loading, setLoading] = useState(true);
  const [webProject, setWebProject] = useState<WebProject | null>(null);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    totalPages: 0,
    totalPosts: 0,
    totalProducts: 0
  });

  useEffect(() => {
    fetchWebProject();
  }, [businessId]);

  const fetchWebProject = async () => {
    try {
      const response = await api.get(`/api/web-projects/${businessId}`);

      if (response.data.success) {
        setWebProject(response.data.webProject);

        // Récupérer les stats du blog si activé
        let blogPostsCount = 0;
        if (response.data.webProject.features?.blog) {
          try {
            const blogResponse = await api.get(`/api/projects/${response.data.webProject.projectId}/blog?status=published`);
            if (blogResponse.data.success) {
              blogPostsCount = blogResponse.data.posts?.length || 0;
            }
          } catch (blogError) {
            console.log('No blog posts yet');
          }
        }

        setStats({
          totalViews: response.data.webProject.analytics?.views || 0,
          uniqueVisitors: response.data.webProject.analytics?.uniqueVisitors || 0,
          totalPages: response.data.stats?.totalPages || 0,
          totalPosts: blogPostsCount,
          totalProducts: 0
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setWebProject(null);
      } else {
        console.error('Error fetching web project:', error);
        toast.error('Erreur lors du chargement du projet web');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebsite = () => {
    setShowCreationForm(true);
  };

  const handleCreationSuccess = () => {
    setShowCreationForm(false);
    fetchWebProject(); // Recharger les données
  };

  const handleCancelCreation = () => {
    setShowCreationForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement...</p>
        </div>
      </div>
    );
  }

  // État : Pas encore de projet web
  if (!webProject) {
    // Afficher le formulaire de création si demandé
    if (showCreationForm) {
      return (
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleCancelCreation}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <WebsiteCreationForm
            businessId={businessId}
            onSuccess={handleCreationSuccess}
            onCancel={handleCancelCreation}
          />
        </div>
      );
    }

    // Afficher le CTA initial
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-[#E0E0E0]">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
              Développez votre présence en ligne
            </h2>
            <p className="text-[#666666] max-w-md mx-auto mb-8">
              Créez un site web professionnel, lancez votre blog et développez votre boutique en ligne
              avec l'aide de nos agents IA spécialisés.
            </p>
            <Button
              size="lg"
              onClick={handleCreateWebsite}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Créer mon site web
            </Button>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <Globe className="w-8 h-8 text-[#6D3FC8] mb-3" />
              <CardTitle className="text-lg">Site Web</CardTitle>
              <CardDescription>
                Créez un site professionnel en quelques minutes avec l'IA
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="w-8 h-8 text-blue-500 mb-3" />
              <CardTitle className="text-lg">Blog</CardTitle>
              <CardDescription>
                Générez et publiez des articles optimisés SEO automatiquement
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShoppingCart className="w-8 h-8 text-green-500 mb-3" />
              <CardTitle className="text-lg">Boutique</CardTitle>
              <CardDescription>
                Vendez vos produits en ligne avec Stripe (bientôt disponible)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // État : Projet web existe
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#666666]">
                Visiteurs
              </CardTitle>
              <Eye className="w-4 h-4 text-[#666666]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E1E1E]">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-[#666666] mt-1">
              {stats.totalViews.toLocaleString()} vues totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#666666]">
                Pages
              </CardTitle>
              <Globe className="w-4 h-4 text-[#666666]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E1E1E]">
              {stats.totalPages}
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-[#6D3FC8] mt-1"
              onClick={() => router.push(`/business/${businessId}/web/site/pages`)}
            >
              Gérer les pages →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#666666]">
                Articles
              </CardTitle>
              <FileText className="w-4 h-4 text-[#666666]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E1E1E]">
              {stats.totalPosts}
            </div>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-[#6D3FC8] mt-1"
              onClick={() => router.push(`/business/${businessId}/web/blog/posts`)}
            >
              Gérer le blog →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#666666]">
                Produits
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-[#666666]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E1E1E]">
              {stats.totalProducts}
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              Bientôt disponible
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Créez et gérez rapidement vos contenus web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:border-[#6D3FC8] hover:bg-[#6D3FC8]/5"
              onClick={() => router.push(`/business/${businessId}/web/site/pages`)}
            >
              <Plus className="w-5 h-5 mb-2 text-[#6D3FC8]" />
              <div className="text-left">
                <div className="font-medium text-sm">Nouvelle page</div>
                <div className="text-xs text-[#666666]">Créer une page avec l'IA</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:border-blue-500 hover:bg-blue-50"
              onClick={() => router.push(`/business/${businessId}/web/blog/posts`)}
            >
              <Plus className="w-5 h-5 mb-2 text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-sm">Nouvel article</div>
                <div className="text-xs text-[#666666]">Générer un article de blog</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 opacity-60 cursor-not-allowed"
              disabled
            >
              <Plus className="w-5 h-5 mb-2 text-green-500" />
              <div className="text-left">
                <div className="font-medium text-sm">Nouveau produit</div>
                <div className="text-xs text-[#666666]">Bientôt disponible</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">État du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {webProject.status === 'published' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
                <span className="text-sm">Statut du site</span>
              </div>
              <Badge variant={webProject.status === 'published' ? 'default' : 'secondary'}>
                {webProject.status === 'published' ? 'Publié' : 'Brouillon'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {webProject.features.website ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm">Site web</span>
              </div>
              <Badge variant={webProject.features.website ? 'default' : 'outline'}>
                {webProject.features.website ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {webProject.features.blog ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm">Blog</span>
              </div>
              <Badge variant={webProject.features.blog ? 'default' : 'outline'}>
                {webProject.features.blog ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Boutique</span>
              </div>
              <Badge variant="outline">Bientôt</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggestions Ezia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.totalPages === 0 && (
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                <div className="flex gap-2">
                  <Sparkles className="w-5 h-5 text-[#6D3FC8] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-[#1E1E1E]">
                      Créez votre première page
                    </div>
                    <div className="text-xs text-[#666666] mt-1">
                      Commencez par créer une page d'accueil avec l'IA
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 bg-[#6D3FC8] hover:bg-[#5A35A5]"
                      onClick={() => router.push(`/business/${businessId}/web/site/pages`)}
                    >
                      Créer maintenant
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {stats.totalPosts === 0 && webProject.features.blog && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-[#1E1E1E]">
                      Lancez votre blog
                    </div>
                    <div className="text-xs text-[#666666] mt-1">
                      Générez vos premiers articles avec l'IA
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                      onClick={() => router.push(`/business/${businessId}/web/blog/posts`)}
                    >
                      Créer un article
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {stats.totalPages > 0 && stats.totalPosts > 0 && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-[#1E1E1E]">
                  Tout va bien !
                </div>
                <div className="text-xs text-[#666666] mt-1">
                  Votre site est opérationnel
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
