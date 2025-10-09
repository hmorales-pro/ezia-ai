"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileEdit, Sparkles, Check, Zap } from "lucide-react";

export default function CopywritingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-[#E0E0E0]">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileEdit className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
            Revue Copywriting & Branding
          </h2>
          <p className="text-[#666666] max-w-md mx-auto mb-8">
            Améliorez vos textes, titres et messages marketing avec l'analyse et les suggestions de l'IA.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Bientôt disponible</span>
          </div>

          {/* Fonctionnalités prévues */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-purple-100 bg-purple-50/50">
              <CardContent className="p-6 text-center">
                <FileEdit className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Analyse de Ton</h3>
                <p className="text-xs text-[#666666]">
                  Vérifiez la cohérence de votre voix de marque
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Suggestions IA</h3>
                <p className="text-xs text-[#666666]">
                  Obtenez des alternatives et améliorations
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/50">
              <CardContent className="p-6 text-center">
                <Check className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Correction Auto</h3>
                <p className="text-xs text-[#666666]">
                  Orthographe, grammaire et style
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
