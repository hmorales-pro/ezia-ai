"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Sparkles } from "lucide-react";

export default function SiteBrandingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-[#E0E0E0]">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
            Gestion du Branding
          </h2>
          <p className="text-[#666666] max-w-md mx-auto mb-4">
            Gérez votre logo, images, icônes et éléments visuels de marque avec l'aide de l'IA.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>Bientôt disponible</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
