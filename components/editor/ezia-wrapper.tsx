"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Info, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AppEditor } from "./index";
import { Badge } from "@/components/ui/badge";
import { AI_AGENTS } from "@/lib/ai-agents";

interface EziaEditorWrapperProps {
  initialPrompt?: string | null;
  businessId?: string | null;
}

export function EziaEditorWrapper({ initialPrompt, businessId }: EziaEditorWrapperProps) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Si on a un prompt initial, lancer la génération automatiquement
    if (initialPrompt) {
      setIsGenerating(true);
      // Le composant AppEditor gère la génération
      setTimeout(() => setIsGenerating(false), 3000);
    }
  }, [initialPrompt]);

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Header Ezia */}
      <div className="bg-white border-b border-[#E0E0E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-[#FAF9F5]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
                <h1 className="text-xl font-semibold text-[#1E1E1E]">
                  Création de site avec l'équipe Ezia
                </h1>
              </div>
            </div>
            
            {/* Agents actifs */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-[#666666] mr-2">Équipe active :</span>
              {Object.values(AI_AGENTS).slice(1).map((agent) => (
                <Badge
                  key={agent.id}
                  variant="outline"
                  className="text-xs border-[#E0E0E0]"
                >
                  {agent.emoji} {agent.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {showInfo && (
        <div className="bg-gradient-to-r from-[#6D3FC8]/10 to-[#8B5CF6]/10 border-b border-[#6D3FC8]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Info className="w-5 h-5 text-[#6D3FC8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E1E1E]">
                    Votre site est en cours de création par l'équipe
                  </p>
                  <p className="text-xs text-[#666666]">
                    Vous pouvez modifier le code directement ou utiliser le chat pour demander des changements
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(false)}
                className="text-[#666666] hover:text-[#1E1E1E]"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2">
            {[
              { step: 1, label: "Brief", done: true },
              { step: 2, label: "Création", done: isGenerating, active: !isGenerating },
              { step: 3, label: "Personnalisation", active: !isGenerating },
              { step: 4, label: "Publication" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${item.done ? 'bg-[#6D3FC8] text-white' : 
                        item.active ? 'bg-[#6D3FC8]/20 text-[#6D3FC8] border-2 border-[#6D3FC8]' : 
                        'bg-[#E0E0E0] text-[#666666]'}
                    `}
                  >
                    {item.done ? '✓' : item.step}
                  </div>
                  <span className={`text-sm ${item.active ? 'font-medium text-[#1E1E1E]' : 'text-[#666666]'}`}>
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <ChevronRight className="w-4 h-4 text-[#E0E0E0] mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Container avec style amélioré */}
      <div className="flex-1 bg-[#FAF9F5]">
        <div className="h-[calc(100vh-13rem)]">
          <AppEditor 
            initialPrompt={initialPrompt} 
            businessId={businessId}
          />
        </div>
      </div>

      {/* Optional: Quick tips */}
      {isGenerating && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6D3FC8]"></div>
            <div>
              <p className="font-medium text-[#1E1E1E]">L'équipe travaille...</p>
              <p className="text-sm text-[#666666] mt-1">
                Kiko code, Milo design, Yuna optimise l'UX et Vera rédige le contenu
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}