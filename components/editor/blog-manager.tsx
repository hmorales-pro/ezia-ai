"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Search,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  List,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ContentCalendar } from "./content-calendar";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  tags: string[];
  readTime: number;
  metadata: {
    views: number;
    likes: number;
    shares: number;
  };
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogManagerProps {
  projectId: string;
  onEditPost: (post: BlogPost) => void;
  onCreateNew: () => void;
}

export function BlogManager({ projectId, onEditPost, onCreateNew }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Charger les articles
  useEffect(() => {
    loadPosts();
  }, [projectId, statusFilter]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/api/projects/${projectId}/blog?${params.toString()}`);

      if (response.data.success) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${postTitle}" ?`);
    if (!confirmed) return;

    try {
      setIsDeleting(postId);
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      await api.delete(`/api/projects/${projectId}/blog/${post.slug}`);
      toast.success('Article supprimé avec succès');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      await api.put(`/api/projects/${projectId}/blog/${post.slug}`, {
        status: 'published',
        publishedAt: new Date().toISOString()
      });
      toast.success('Article publié avec succès');
      loadPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const handleArchive = async (post: BlogPost) => {
    try {
      await api.put(`/api/projects/${projectId}/blog/${post.slug}`, {
        status: 'archived'
      });
      toast.success('Article archivé');
      loadPosts();
    } catch (error) {
      console.error('Error archiving post:', error);
      toast.error('Erreur lors de l\'archivage');
    }
  };

  // Filtrer les posts par recherche
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'archived':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((sum, p) => sum + (p.metadata?.views || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête avec statistiques */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
            <p className="text-gray-600 mt-1">
              Créez et gérez vos articles de blog
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.open(`/${projectId}`, '_blank')}
              variant="outline"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Voir le site
            </Button>
            <Button
              onClick={() => window.open(`/${projectId}/blog`, '_blank')}
              variant="outline"
              size="lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Prévisualiser
            </Button>
            <Button onClick={onCreateNew} size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Nouvel Article
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendrier
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Publiés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vues totales</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="scheduled">Programmés</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des articles */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun article trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Aucun article ne correspond à votre recherche"
                    : "Commencez par créer votre premier article"}
                </p>
                {!searchQuery && (
                  <Button onClick={onCreateNew}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Créer un article
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {post.aiGenerated && (
                          <Badge variant="outline" className="text-xs">
                            AI
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(post.status)}
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getStatusColor(post.status))}
                          >
                            {post.status === 'published' && 'Publié'}
                            {post.status === 'draft' && 'Brouillon'}
                            {post.status === 'scheduled' && 'Programmé'}
                            {post.status === 'archived' && 'Archivé'}
                          </Badge>
                        </div>

                        {post.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min
                        </div>

                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.metadata?.views || 0} vues
                        </div>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditPost(post)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Éditer
                      </Button>

                      {post.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 hover:bg-green-50"
                          onClick={() => handlePublish(post)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Publier
                        </Button>
                      )}

                      {post.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(post)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Archiver
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(post._id, post.title)}
                        disabled={isDeleting === post._id}
                      >
                        {isDeleting === post._id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-1" />
                        )}
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="calendar">
            <ContentCalendar
              projectId={projectId}
              onArticleCreated={loadPosts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
