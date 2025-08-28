"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, Plus, Edit2, Trash2, Globe, 
  ChevronRight, Copy, Eye, Settings
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  isHomePage: boolean;
  order: number;
}

interface MultipageNavigatorProps {
  pages: Page[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: (pageData: Partial<Page>) => void;
  onPageUpdate: (pageId: string, updates: Partial<Page>) => void;
  onPageDelete: (pageId: string) => void;
  onPageDuplicate: (pageId: string) => void;
}

export function MultipageNavigator({
  pages,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageUpdate,
  onPageDelete,
  onPageDuplicate
}: MultipageNavigatorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPageData, setNewPageData] = useState({
    name: "",
    slug: "",
    title: ""
  });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const handleAddPage = () => {
    if (!newPageData.name || !newPageData.slug) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    // Vérifier que le slug est unique
    if (pages.some(p => p.slug === newPageData.slug)) {
      toast.error("Cette URL existe déjà");
      return;
    }
    
    onPageAdd({
      name: newPageData.name,
      slug: newPageData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      title: newPageData.title || newPageData.name,
      isHomePage: pages.length === 0
    });
    
    setNewPageData({ name: "", slug: "", title: "" });
    setShowAddDialog(false);
    toast.success("Page ajoutée avec succès");
  };

  const handleDeletePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page?.isHomePage) {
      toast.error("Impossible de supprimer la page d'accueil");
      return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer cette page ?")) {
      onPageDelete(pageId);
      toast.success("Page supprimée");
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pages du site
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle page
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pages.sort((a, b) => a.order - b.order).map((page) => (
            <div
              key={page.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                currentPageId === page.id
                  ? "bg-purple-50 border-purple-300"
                  : "hover:bg-gray-50 border-gray-200"
              )}
              onClick={() => onPageSelect(page.id)}
            >
              <div className="flex items-center gap-3">
                {page.isHomePage && (
                  <Home className="w-4 h-4 text-purple-600" />
                )}
                <div>
                  <p className="font-medium">{page.name}</p>
                  <p className="text-xs text-gray-500">/{page.slug}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/preview/${page.slug}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingPageId(page.id);
                    setNewPageData({
                      name: page.name,
                      slug: page.slug,
                      title: page.title
                    });
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPageDuplicate(page.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {!page.isHomePage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePage(page.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {pages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune page créée</p>
            <p className="text-sm">Commencez par ajouter votre première page</p>
          </div>
        )}
      </CardContent>
      
      {/* Dialog d'ajout/édition */}
      <Dialog open={showAddDialog || !!editingPageId} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingPageId(null);
          setNewPageData({ name: "", slug: "", title: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPageId ? "Modifier la page" : "Ajouter une nouvelle page"}
            </DialogTitle>
            <DialogDescription>
              Configurez les informations de base de votre page
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la page</Label>
              <Input
                id="name"
                value={newPageData.name}
                onChange={(e) => {
                  setNewPageData({
                    ...newPageData,
                    name: e.target.value,
                    slug: !editingPageId ? generateSlug(e.target.value) : newPageData.slug
                  });
                }}
                placeholder="Ex: À propos"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">URL de la page</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <Input
                  id="slug"
                  value={newPageData.slug}
                  onChange={(e) => setNewPageData({
                    ...newPageData,
                    slug: e.target.value
                  })}
                  placeholder="a-propos"
                />
              </div>
              <p className="text-xs text-gray-500">
                L'URL doit contenir uniquement des lettres minuscules, chiffres et tirets
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Titre SEO (optionnel)</Label>
              <Input
                id="title"
                value={newPageData.title}
                onChange={(e) => setNewPageData({
                  ...newPageData,
                  title: e.target.value
                })}
                placeholder="Ex: À propos de notre entreprise"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingPageId(null);
                setNewPageData({ name: "", slug: "", title: "" });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editingPageId) {
                  onPageUpdate(editingPageId, newPageData);
                  setEditingPageId(null);
                  toast.success("Page modifiée");
                } else {
                  handleAddPage();
                }
              }}
            >
              {editingPageId ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}