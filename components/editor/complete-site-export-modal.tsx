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
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface CompleteSiteExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  industry: string;
  description?: string;
}

type GenerationPhase = {
  name: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "failed";
};

export function CompleteSiteExportModal({
  open,
  onOpenChange,
  businessName,
  industry,
  description
}: CompleteSiteExportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [phases, setPhases] = useState<GenerationPhase[]>([
    { name: "architecture", label: "Analyse du business", status: "pending" },
    { name: "design", label: "Système de design", status: "pending" },
    { name: "content", label: "Génération du contenu", status: "pending" },
    { name: "blog", label: "Articles de blog", status: "pending" },
    { name: "pages", label: "Génération des pages", status: "pending" },
    { name: "assets", label: "CSS & JavaScript", status: "pending" },
    { name: "export", label: "Package final", status: "pending" },
  ]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    try {
      // Simuler la progression pendant la génération
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 2000);

      // Animation des phases
      updatePhaseProgress("architecture", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("architecture", "completed");

      updatePhaseProgress("design", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("design", "completed");

      updatePhaseProgress("content", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("content", "completed");

      updatePhaseProgress("blog", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("blog", "completed");

      updatePhaseProgress("pages", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("pages", "completed");

      updatePhaseProgress("assets", "in_progress");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePhaseProgress("assets", "completed");

      updatePhaseProgress("export", "in_progress");

      // Téléchargement direct via l'API serveur (génération + ZIP en une seule requête)
      const downloadUrl = `/api/sites/download-zip?name=${encodeURIComponent(businessName)}&industry=${encodeURIComponent(industry)}&description=${encodeURIComponent(description || "")}`;

      // Créer un lien invisible pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-site-complet.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearInterval(progressInterval);
      setProgress(100);
      updatePhaseProgress("export", "completed");
      setDownloadUrl(downloadUrl);

    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du ZIP");
      setProgress(0);
      // Marquer toutes les phases comme échouées
      setPhases(prev => prev.map(p => ({
        ...p,
        status: p.status === "completed" ? "completed" : "failed"
      })));
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePhaseProgress = (phaseName: string, status: "in_progress" | "completed" | "failed") => {
    setPhases(prev => prev.map(p =>
      p.name === phaseName ? { ...p, status } : p
    ));
    if (status === "in_progress") {
      setCurrentPhase(phases.find(p => p.name === phaseName)?.label || "");
    }
  };

  const getPhaseIcon = (status: GenerationPhase["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Télécharger site complet (ZIP)</DialogTitle>
          <DialogDescription>
            Génération d'un site multi-pages professionnel avec toutes les pages, articles blog, et assets prêts à déployer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations du site */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Business:</span>
              <span className="font-medium">{businessName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Industrie:</span>
              <span className="font-medium">{industry}</span>
            </div>
          </div>

          {/* Barre de progression */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                {currentPhase || "Initialisation..."}
              </p>
            </div>
          )}

          {/* Liste des phases */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {phases.map((phase) => (
              <div
                key={phase.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                {getPhaseIcon(phase.status)}
                <span className={`text-sm flex-1 ${
                  phase.status === "completed" ? "text-gray-500 line-through" :
                  phase.status === "in_progress" ? "text-blue-600 font-medium" :
                  "text-gray-700"
                }`}>
                  {phase.label}
                </span>
              </div>
            ))}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}

          {/* Message de succès */}
          {downloadUrl && !isGenerating && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                ✅ Site généré avec succès ! Le téléchargement devrait commencer automatiquement.
              </p>
            </div>
          )}

          {/* Informations sur le contenu */}
          {!isGenerating && !downloadUrl && !error && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">📦 Contenu du ZIP :</p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>8-12 pages HTML (accueil, blog, services, contact...)</li>
                <li>3 articles de blog complets (1500-2000 mots)</li>
                <li>CSS & JavaScript partagés</li>
                <li>Sitemap.xml + robots.txt</li>
                <li>README avec instructions de déploiement</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                ⏱️ Temps estimé : 3-4 minutes
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : downloadUrl ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Terminé
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Générer le ZIP
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
