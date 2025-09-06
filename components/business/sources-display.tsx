import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Building2, ChartBar, Shield, FileText, ExternalLink } from 'lucide-react';

interface Source {
  name: string;
  type: string;
  date: string;
  credibility?: string;
  url?: string;
}

interface SourcesDisplayProps {
  sources?: Source[];
  analysisType: 'market' | 'competitor' | 'marketing';
}

export function SourcesDisplay({ sources, analysisType }: SourcesDisplayProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const getIcon = (credibility: string) => {
    switch (credibility) {
      case 'officiel':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'sectoriel':
        return <ChartBar className="w-4 h-4 text-green-500" />;
      case 'référence':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'participatif':
        return <Building2 className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCredibilityLabel = (credibility: string) => {
    switch (credibility) {
      case 'officiel':
        return 'Source officielle';
      case 'sectoriel':
        return 'Étude sectorielle';
      case 'référence':
        return 'Référence reconnue';
      case 'participatif':
        return 'Données participatives';
      case 'estimation':
        return 'Estimation analytique';
      default:
        return 'Source';
    }
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'market':
        return 'Sources de l\'analyse de marché';
      case 'competitor':
        return 'Sources de l\'analyse concurrentielle';
      case 'marketing':
        return 'Sources de la stratégie marketing';
      default:
        return 'Sources';
    }
  };

  return (
    <Card className="p-6 border-blue-100">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          {getAnalysisTitle()}
        </h3>
        
        <div className="grid gap-3">
          {sources.map((source, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="mt-0.5">
                {getIcon(source.credibility || 'estimation')}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <span className="text-sm text-gray-500">({source.date})</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{source.type}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{getCredibilityLabel(source.credibility || 'estimation')}</span>
                </div>
                
                {source.url && (
                  <a 
                    href={source.url.startsWith('http') ? source.url : `https://${source.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Consulter la source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Cette analyse synthétise des données provenant de sources 
            vérifiées et actualisées. Les chiffres et tendances sont basés sur les dernières 
            études disponibles du secteur.
          </p>
        </div>
      </div>
    </Card>
  );
}