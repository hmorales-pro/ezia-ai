"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Settings2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface PublicationRule {
  id: string;
  platform: string;
  contentType: string;
  frequency: number; // nombre par période
  period: "day" | "week" | "month";
}

interface ContentCalendarSettingsProps {
  businessId: string;
  onSettingsSaved: (rules: PublicationRule[]) => void;
  existingRules?: PublicationRule[];
}

const platformOptions = [
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "facebook", label: "Facebook", icon: "👥" },
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "youtube", label: "YouTube", icon: "📺" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "website", label: "Blog/Site Web", icon: "🌐" },
  { value: "email", label: "Newsletter", icon: "📧" },
];

const contentTypeOptions = [
  { value: "article", label: "Article", icon: "📝" },
  { value: "video", label: "Vidéo", icon: "🎥" },
  { value: "social", label: "Post social", icon: "📱" },
  { value: "image", label: "Image/Visuel", icon: "🎨" },
  { value: "story", label: "Story", icon: "📸" },
  { value: "reel", label: "Reel/Short", icon: "🎬" },
  { value: "carousel", label: "Carrousel", icon: "🎠" },
  { value: "email", label: "Email", icon: "✉️" },
];

const periodOptions = [
  { value: "day", label: "par jour" },
  { value: "week", label: "par semaine" },
  { value: "month", label: "par mois" },
];

export function ContentCalendarSettings({ businessId, onSettingsSaved, existingRules = [] }: ContentCalendarSettingsProps) {
  const [rules, setRules] = useState<PublicationRule[]>(
    existingRules.length > 0 ? existingRules : []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<PublicationRule>>({
    platform: "",
    contentType: "",
    frequency: 1,
    period: "week",
  });

  const addRule = () => {
    if (!newRule.platform || !newRule.contentType || !newRule.frequency) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const rule: PublicationRule = {
      id: `rule_${Date.now()}`,
      platform: newRule.platform!,
      contentType: newRule.contentType!,
      frequency: newRule.frequency!,
      period: newRule.period as "day" | "week" | "month",
    };

    setRules([...rules, rule]);
    setNewRule({ platform: "", contentType: "", frequency: 1, period: "week" });
    setIsAdding(false);
    toast.success("Règle ajoutée !");
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast.success("Règle supprimée");
  };

  const startEditing = (rule: PublicationRule) => {
    setEditingId(rule.id);
    setNewRule({
      platform: rule.platform,
      contentType: rule.contentType,
      frequency: rule.frequency,
      period: rule.period,
    });
    setIsAdding(false);
  };

  const updateRule = () => {
    if (!newRule.platform || !newRule.contentType || !newRule.frequency || !editingId) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setRules(rules.map(r =>
      r.id === editingId
        ? {
            ...r,
            platform: newRule.platform!,
            contentType: newRule.contentType!,
            frequency: newRule.frequency!,
            period: newRule.period as "day" | "week" | "month",
          }
        : r
    ));

    setNewRule({ platform: "", contentType: "", frequency: 1, period: "week" });
    setEditingId(null);
    toast.success("Règle modifiée !");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewRule({ platform: "", contentType: "", frequency: 1, period: "week" });
  };

  const saveSettings = () => {
    if (rules.length === 0) {
      toast.error("Ajoutez au moins une règle de publication");
      return;
    }

    onSettingsSaved(rules);
    toast.success("Paramètres sauvegardés !");
  };

  const getPlatformLabel = (value: string) =>
    platformOptions.find(p => p.value === value)?.label || value;

  const getPlatformIcon = (value: string) =>
    platformOptions.find(p => p.value === value)?.icon || "📌";

  const getContentTypeLabel = (value: string) =>
    contentTypeOptions.find(c => c.value === value)?.label || value;

  const getContentTypeIcon = (value: string) =>
    contentTypeOptions.find(c => c.value === value)?.icon || "📄";

  const getPeriodLabel = (value: string) =>
    periodOptions.find(p => p.value === value)?.label || value;

  const getTotalPerWeek = () => {
    return rules.reduce((total, rule) => {
      if (rule.period === "day") return total + rule.frequency * 7;
      if (rule.period === "week") return total + rule.frequency;
      if (rule.period === "month") return total + (rule.frequency / 4);
      return total;
    }, 0);
  };

  const getTotalPerMonth = () => {
    return rules.reduce((total, rule) => {
      if (rule.period === "day") return total + rule.frequency * 30;
      if (rule.period === "week") return total + rule.frequency * 4;
      if (rule.period === "month") return total + rule.frequency;
      return total;
    }, 0);
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-purple-600" />
              Paramètres du Calendrier
            </CardTitle>
            <CardDescription>
              Définissez vos règles de publication pour chaque plateforme
            </CardDescription>
          </div>
          {rules.length > 0 && (
            <Button onClick={saveSettings} className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5]">
              <Sparkles className="w-4 h-4 mr-2" />
              Générer le Calendrier
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Règles existantes */}
        {rules.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Règles de publication :</h3>
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(rule.platform)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{getPlatformLabel(rule.platform)}</span>
                      <Badge variant="outline" className="text-xs">
                        {getContentTypeIcon(rule.contentType)} {getContentTypeLabel(rule.contentType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {rule.frequency} publication{rule.frequency > 1 ? 's' : ''} {getPeriodLabel(rule.period)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(rule)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{Math.round(getTotalPerWeek())}</p>
                <p className="text-xs text-gray-600">publications / semaine</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(getTotalPerMonth())}</p>
                <p className="text-xs text-gray-600">publications / mois</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout ou d'édition */}
        {!isAdding && !editingId && (
          <Button
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full border-dashed border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une règle de publication
          </Button>
        )}

        {(isAdding || editingId) && (
          <div className="p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50/50 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              {editingId ? "Modifier la règle :" : "Nouvelle règle :"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Plateforme */}
              <div className="space-y-2">
                <Label>Plateforme</Label>
                <Select
                  value={newRule.platform}
                  onValueChange={(value) => setNewRule({ ...newRule, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de contenu */}
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <Select
                  value={newRule.contentType}
                  onValueChange={(value) => setNewRule({ ...newRule, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fréquence */}
              <div className="space-y-2">
                <Label>Fréquence</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={newRule.frequency}
                  onChange={(e) => setNewRule({ ...newRule, frequency: parseInt(e.target.value) || 1 })}
                  placeholder="Ex: 5"
                />
              </div>

              {/* Période */}
              <div className="space-y-2">
                <Label>Période</Label>
                <Select
                  value={newRule.period}
                  onValueChange={(value) => setNewRule({ ...newRule, period: value as "day" | "week" | "month" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              {editingId ? (
                <Button onClick={updateRule} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <Button onClick={addRule} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
              <Button variant="outline" onClick={cancelEdit}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Message si aucune règle */}
        {rules.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Aucune règle définie</p>
            <p className="text-xs text-gray-400">Commencez par ajouter une règle de publication</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
