"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BlogManager } from "@/components/editor/blog-manager";
import { BlogEditor } from "@/components/editor/blog-editor";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
}

export default function BlogPostsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchProjectId();
  }, [businessId]);

  const fetchProjectId = async () => {
    try {
      // Récupérer le projet web associé au business
      // Pour l'instant, on cherche dans UserProject
      const response = await api.get('/api/user-projects-db');

      if (response.data.projects && response.data.projects.length > 0) {
        // Trouver le projet associé à ce business
        const project = response.data.projects.find((p: any) =>
          p.businessId === businessId || p.metadata?.businessId === businessId
        );

        if (project) {
          setProjectId(project.projectId);
        } else {
          // Prendre le premier projet par défaut
          setProjectId(response.data.projects[0].projectId);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setCurrentPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: any) => {
    setCurrentPost(post);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setCurrentPost(null);
  };

  const handleSavePost = async (postData: any) => {
    try {
      if (currentPost) {
        // Update existing post
        await api.put(`/api/projects/${projectId}/blog/${currentPost.slug}`, postData);
        toast.success('Article mis à jour avec succès');
      } else {
        // Create new post
        await api.post(`/api/projects/${projectId}/blog`, postData);
        toast.success('Article créé avec succès');
      }
      handleCloseEditor();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erreur lors de la sauvegarde de l\'article');
    }
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

  if (!projectId) {
    return (
      <Card className="p-12 text-center">
        <h2 className="text-xl font-bold text-[#1E1E1E] mb-3">
          Aucun site web trouvé
        </h2>
        <p className="text-[#666666] mb-6">
          Vous devez d'abord créer un site web pour gérer votre blog.
        </p>
        <button
          onClick={() => router.push(`/sites/new?businessId=${businessId}`)}
          className="px-6 py-2 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] text-white rounded-lg hover:from-[#5A35A5] hover:to-[#6D3FC8] transition-all"
        >
          Créer un site web
        </button>
      </Card>
    );
  }

  if (showEditor) {
    return (
      <BlogEditor
        projectId={projectId}
        post={currentPost}
        onClose={handleCloseEditor}
        onSave={handleSavePost}
      />
    );
  }

  return (
    <div>
      <BlogManager
        projectId={projectId}
        onCreateNew={handleCreatePost}
        onEditPost={handleEditPost}
      />
    </div>
  );
}
