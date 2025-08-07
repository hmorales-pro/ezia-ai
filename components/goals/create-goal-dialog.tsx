"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSuccess: () => void;
}

const categories = [
  { value: "revenue", label: "Revenus", description: "Objectifs financiers et chiffre d'affaires" },
  { value: "growth", label: "Croissance", description: "Expansion et développement" },
  { value: "product", label: "Produit", description: "Développement de produits ou services" },
  { value: "marketing", label: "Marketing", description: "Acquisition et visibilité" },
  { value: "operations", label: "Opérations", description: "Efficacité et processus" },
  { value: "other", label: "Autre", description: "Autres objectifs" }
];

export function CreateGoalDialog({
  open,
  onOpenChange,
  businessId,
  onSuccess
}: CreateGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    target_date: undefined as Date | undefined,
    metrics: {
      target_value: "",
      unit: ""
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.target_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/api/me/business/${businessId}/goals`, {
        ...formData,
        target_date: formData.target_date.toISOString()
      });

      if (response.data.ok) {
        toast.success("Objectif créé avec succès");
        onSuccess();
        onOpenChange(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          target_date: undefined,
          metrics: { target_value: "", unit: "" }
        });
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Erreur lors de la création de l'objectif");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white border-[#E0E0E0] shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Créer un nouvel objectif</DialogTitle>
          <DialogDescription className="text-[#666666]">
            Définissez un objectif mesurable pour votre business
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'objectif *</Label>
            <Input
              id="title"
              placeholder="Ex: Atteindre 10K€ de CA mensuel"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white border-[#E0E0E0] text-[#1E1E1E]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre objectif et comment vous comptez l'atteindre..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-[#E0E0E0] text-[#1E1E1E] min-h-[100px]"
              required
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger className="bg-white border-[#E0E0E0] text-[#1E1E1E]">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div>
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-xs text-[#666666]">{cat.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date cible */}
          <div className="space-y-2">
            <Label>Date cible *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white border-[#E0E0E0] text-[#1E1E1E]",
                    !formData.target_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? (
                    format(formData.target_date, "d MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionnez une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.target_date}
                  onSelect={(date) => setFormData({ ...formData, target_date: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Métriques (optionnel) */}
          <div className="space-y-2">
            <Label>Métriques (optionnel)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Valeur cible"
                value={formData.metrics.target_value}
                onChange={(e) => setFormData({
                  ...formData,
                  metrics: { ...formData.metrics, target_value: e.target.value }
                })}
                className="bg-white border-[#E0E0E0] text-[#1E1E1E]"
              />
              <Input
                placeholder="Unité (€, %, clients...)"
                value={formData.metrics.unit}
                onChange={(e) => setFormData({
                  ...formData,
                  metrics: { ...formData.metrics, unit: e.target.value }
                })}
                className="bg-white border-[#E0E0E0] text-[#1E1E1E]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#E0E0E0] text-[#666666] hover:text-[#1E1E1E]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'objectif"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}