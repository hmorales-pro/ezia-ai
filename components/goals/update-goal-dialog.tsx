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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UpdateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  goalId: string;
  currentProgress: number;
  currentStatus: string;
  onSuccess: () => void;
}

export function UpdateGoalDialog({
  open,
  onOpenChange,
  businessId,
  goalId,
  currentProgress,
  currentStatus,
  onSuccess
}: UpdateGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(currentProgress);
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note.trim()) {
      toast.error("Veuillez ajouter une note sur votre progression");
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/api/me/business/${businessId}/goals`, {
        goal_id: goalId,
        progress,
        status,
        note
      });

      if (response.data.ok) {
        toast.success("Objectif mis à jour avec succès");
        onSuccess();
        onOpenChange(false);
        setNote("");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Mettre à jour l'objectif</DialogTitle>
          <DialogDescription>
            Enregistrez votre progression et ajoutez une note
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Progression */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Progression</Label>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    En cours
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Complété
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-500" />
                    En pause
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note de progression *</Label>
            <Textarea
              id="note"
              placeholder="Qu'avez-vous accompli ? Quels sont les prochains steps ?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              required
            />
          </div>

          {/* Suggestion automatique si 100% */}
          {progress === 100 && status !== 'completed' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">
                🎉 Félicitations ! Voulez-vous marquer cet objectif comme complété ?
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 text-green-400 hover:text-green-300"
                onClick={() => setStatus('completed')}
              >
                Marquer comme complété
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}