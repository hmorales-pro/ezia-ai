"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditBusinessModalProps {
  open: boolean;
  onClose: () => void;
  business: any;
  onSuccess: () => void;
}

const industries = [
  "Technology",
  "E-commerce",
  "Services",
  "Santé",
  "Education",
  "Finance",
  "Immobilier",
  "Restauration",
  "Art & Culture",
  "Sport & Bien-être",
  "Consulting",
  "Autre"
];

const stages = [
  { value: "idea", label: "Idée", description: "J'ai une idée mais pas encore commencé" },
  { value: "startup", label: "Startup", description: "Je démarre mon activité" },
  { value: "growth", label: "Croissance", description: "Mon business est en développement" },
  { value: "established", label: "Établi", description: "Mon business est mature" }
];

export function EditBusinessModal({ open, onClose, business, onSuccess }: EditBusinessModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "",
    hasWebsite: "no",
    wantsWebsite: "yes",
    existingWebsiteUrl: ""
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        description: business.description || "",
        industry: business.industry || "",
        stage: business.stage || "",
        hasWebsite: business.website_url ? "yes" : "no",
        wantsWebsite: business.wantsWebsite || "yes",
        existingWebsiteUrl: business.website_url || ""
      });
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.industry || !formData.stage) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/me/business-simple/${business.business_id}`, formData);
      
      if (response.data.ok) {
        toast.success("Business mis à jour avec succès");
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Erreur lors de la mise à jour du business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le business</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre business
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du business</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mon entreprise"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre activité..."
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industrie</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une industrie" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Étape de développement</Label>
              <RadioGroup
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value })}
                disabled={loading}
              >
                {stages.map((stage) => (
                  <div key={stage.value} className="flex items-start space-x-2 mb-2">
                    <RadioGroupItem value={stage.value} id={`stage-${stage.value}`} className="mt-1" />
                    <div>
                      <Label htmlFor={`stage-${stage.value}`} className="font-medium">
                        {stage.label}
                      </Label>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid gap-4 pt-4 border-t">
              <div className="grid gap-2">
                <Label>Avez-vous déjà un site web ?</Label>
                <RadioGroup
                  value={formData.hasWebsite}
                  onValueChange={(value) => setFormData({ ...formData, hasWebsite: value })}
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasWebsite-yes" />
                    <Label htmlFor="hasWebsite-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasWebsite-no" />
                    <Label htmlFor="hasWebsite-no">Non</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.hasWebsite === "yes" && (
                <div className="grid gap-2">
                  <Label htmlFor="existingWebsiteUrl">URL de votre site actuel</Label>
                  <Input
                    id="existingWebsiteUrl"
                    type="url"
                    value={formData.existingWebsiteUrl}
                    onChange={(e) => setFormData({ ...formData, existingWebsiteUrl: e.target.value })}
                    placeholder="https://mon-site.com"
                    disabled={loading}
                  />
                </div>
              )}

              {formData.hasWebsite === "no" && (
                <div className="grid gap-2">
                  <Label>Souhaitez-vous créer un site web avec Ezia ?</Label>
                  <RadioGroup
                    value={formData.wantsWebsite}
                    onValueChange={(value) => setFormData({ ...formData, wantsWebsite: value })}
                    disabled={loading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="wantsWebsite-yes" />
                      <Label htmlFor="wantsWebsite-yes">Oui, créons-le ensemble !</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="later" id="wantsWebsite-later" />
                      <Label htmlFor="wantsWebsite-later">Plus tard</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}