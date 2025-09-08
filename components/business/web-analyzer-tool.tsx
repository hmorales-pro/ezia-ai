'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface WebAnalyzerToolProps {
  businessId?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export function WebAnalyzerTool({ businessId, onAnalysisComplete }: WebAnalyzerToolProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour nettoyer le texte du formatage Markdown
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '') // Retirer les **
      .replace(/\*/g, '')   // Retirer les *
      .replace(/^[-–—]\s*/g, '') // Retirer les tirets en début
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await api.post('/api/ezia/analyze-url', {
        url: url.trim(),
        businessId
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        toast.success('Analyse terminée avec succès !');
        
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data.analysis);
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (error: any) {
      console.error('Erreur analyse:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de l\'analyse';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#6D3FC8]" />
            Analyseur de Site Web
          </CardTitle>
          <CardDescription>
            Analysez n'importe quel site web pour obtenir des insights business et marketing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              className="bg-[#6D3FC8] hover:bg-[#5A35A5]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyser
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {analysis.title || 'Site analysé'}
                  <a 
                    href={analysis.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#6D3FC8] hover:text-[#5A35A5]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
                <CardDescription className="mt-2">
                  {analysis.description || 'Aucune description disponible'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Analyse complète
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="strengths">Forces</TabsTrigger>
                <TabsTrigger value="weaknesses">Faiblesses</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#6D3FC8]" />
                      Type de business
                    </h4>
                    <p className="text-sm text-gray-600">
                      {analysis.businessType || 'Non identifié'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6D3FC8]" />
                      Audience cible
                    </h4>
                    <p className="text-sm text-gray-600">
                      {cleanText(analysis.targetAudience) || 'Non identifiée'}
                    </p>
                  </div>
                </div>

                {analysis.mainServices && analysis.mainServices.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#6D3FC8]" />
                      Services principaux
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.mainServices.map((service: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {cleanText(service)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.opportunities && analysis.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Opportunités identifiées
                    </h4>
                    <ul className="space-y-1">
                      {analysis.opportunities.slice(0, 3).map((opp: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {cleanText(opp)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strengths" className="space-y-4">
                <div className="space-y-3">
                  {analysis.strengths && analysis.strengths.length > 0 ? (
                    analysis.strengths.map((strength: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <p className="text-sm">{cleanText(strength)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune force identifiée</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="weaknesses" className="space-y-4">
                <div className="space-y-3">
                  {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                    analysis.weaknesses.map((weakness: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <p className="text-sm">{cleanText(weakness)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune faiblesse identifiée</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  {analysis.recommendations && analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm">{cleanText(rec)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune recommandation disponible</p>
                  )}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    💡 <strong>Conseil Ezia :</strong> Utilisez ces insights pour améliorer votre propre stratégie digitale 
                    et vous différencier de la concurrence.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}