"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestAIService() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAIService = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test/ai-service");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du test");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEAE3] p-8">
      <div className="max-width mx-auto">
        <h1 className="text-3xl font-bold text-[#1E1E1E] mb-8">Test du Service AI</h1>

        <Card className="bg-white p-6 shadow-sm border border-[#E0E0E0]">
          <h2 className="text-xl font-semibold text-[#1E1E1E] mb-4">
            Tester la compatibilité des modèles AI
          </h2>
          
          <p className="text-[#666666] mb-6">
            Ce test vérifie que le nouveau service AI peut utiliser différents modèles
            selon leur disponibilité et compatibilité.
          </p>

          <Button
            onClick={testAIService}
            disabled={loading}
            className="bg-gradient-to-r from-[#C837F4] to-[#B028F2] text-white hover:from-[#B028F2] hover:to-[#A020E0]"
          >
            {loading ? "Test en cours..." : "Lancer le test"}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Test réussi</h3>
              <div className="space-y-2 text-sm">
                <p className="text-[#666666]">
                  <strong>Modèle utilisé :</strong> {result.model || "Non spécifié"}
                </p>
                <div className="text-[#666666]">
                  <strong>Réponse :</strong>
                  <p className="mt-1 whitespace-pre-wrap">{result.content}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ Erreur</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-[#666666] mt-2">
                Vérifiez que votre token HuggingFace est correctement configuré.
              </p>
            </div>
          )}
        </Card>

        <Card className="bg-white p-6 mt-6 shadow-sm border border-[#E0E0E0]">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-3">
            Modèles AI disponibles
          </h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li>• <strong>FLAN-T5</strong> - Modèle polyvalent pour diverses tâches</li>
            <li>• <strong>DialoGPT</strong> - Optimisé pour les conversations</li>
            <li>• <strong>Phi-3 Mini</strong> - Modèle compact de Microsoft</li>
            <li>• <strong>GPT-2</strong> - Génération de texte classique</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}