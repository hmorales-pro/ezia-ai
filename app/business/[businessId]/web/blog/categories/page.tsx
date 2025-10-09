"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  MoreVertical,
  Hash,
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  createdAt: string;
}

const DEFAULT_COLORS = [
  '#6D3FC8', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#8B5A2B', '#6366F1'
];

export default function BlogCategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0]
  });

  useEffect(() => {
    fetchProjectId();
  }, [businessId]);

  useEffect(() => {
    if (projectId) {
      fetchCategories();
    }
  }, [projectId]);

  const fetchProjectId = async () => {
    try {
      const response = await api.get(`/api/web-projects/${businessId}`);
      if (response.data.success) {
        setProjectId(response.data.webProject.projectId);
        setUserId(response.data.webProject.userId);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Aucun projet web trouvé');
        router.push(`/business/${businessId}/web/overview`);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/projects/${projectId}/blog/categories`);

      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching categories:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
    });
    setShowDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const response = await api.put(
          `/api/projects/${projectId}/blog/categories/${editingCategory._id}`,
          formData
        );

        if (response.data.success) {
          toast.success('Catégorie mise à jour avec succès');
          fetchCategories();
          setShowDialog(false);
        }
      } else {
        // Create new category
        const response = await api.post(
          `/api/projects/${projectId}/blog/categories`,
          {
            ...formData,
            businessId,
            userId
          }
        );

        if (response.data.success) {
          toast.success('Catégorie créée avec succès');
          fetchCategories();
          setShowDialog(false);
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error?.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await api.delete(
        `/api/projects/${projectId}/blog/categories/${categoryId}`
      );

      if (response.data.success) {
        toast.success('Catégorie supprimée avec succès');
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error?.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-dashed border-[#E0E0E0]">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
              Organisez votre contenu
            </h2>
            <p className="text-[#666666] max-w-md mx-auto mb-8">
              Créez des catégories pour organiser vos articles de blog et faciliter la navigation de vos lecteurs.
            </p>
            <Button
              size="lg"
              onClick={handleCreateCategory}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première catégorie
            </Button>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">
            Exemples de catégories
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {['Actualités', 'Tutoriels', 'Études de cas'].map((name) => (
              <Card
                key={name}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setFormData({
                    ...formData,
                    name,
                    description: `Articles sur ${name.toLowerCase()}`
                  });
                  setShowDialog(true);
                }}
              >
                <CardHeader>
                  <FolderOpen className="w-8 h-8 text-[#6D3FC8] mb-2" />
                  <CardTitle className="text-base">{name}</CardTitle>
                  <CardDescription className="text-sm">
                    Créer cette catégorie
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
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
          <h2 className="text-2xl font-bold text-[#1E1E1E]">Catégories</h2>
          <p className="text-sm text-[#666666] mt-1">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} créée{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleCreateCategory}
          className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Hash className="w-6 h-6" style={{ color: category.color }} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                {category.name}
              </h3>

              {category.description && (
                <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-[#666666]">
                  <FileText className="w-4 h-4" />
                  <span>{category.postCount || 0} article{(category.postCount || 0) !== 1 ? 's' : ''}</span>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color
                  }}
                >
                  {category.slug}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
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
                Organisez votre contenu efficacement
              </h3>
              <p className="text-sm text-[#666666] mb-3">
                Les catégories aident vos lecteurs à trouver facilement le contenu qui les intéresse.
                Créez 3-5 catégories principales pour commencer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifiez les informations de la catégorie'
                : 'Créez une nouvelle catégorie pour organiser vos articles'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom *</Label>
              <Input
                id="category-name"
                placeholder="Ex: Actualités, Tutoriels, Conseils..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Décrivez le type de contenu de cette catégorie..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: formData.color === color ? '#1E1E1E' : 'transparent'
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
