'use client';

import { WebAnalyzerTool } from '@/components/business/web-analyzer-tool';
import { Card } from '@/components/ui/card';
import { Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WebAnalyzerPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Globe className="h-8 w-8 text-[#6D3FC8]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analyseur de Sites Web</h1>
            <p className="text-gray-600">
              Obtenez des insights instantanés sur n'importe quel site web
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WebAnalyzerTool />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#6D3FC8]" />
              Comment ça marche ?
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#6D3FC8]">1.</span>
                <span>Entrez l'URL du site à analyser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#6D3FC8]">2.</span>
                <span>Ezia extrait et analyse le contenu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#6D3FC8]">3.</span>
                <span>Recevez des insights business détaillés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#6D3FC8]">4.</span>
                <span>Exploitez les recommandations</span>
              </li>
            </ol>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="font-semibold mb-3">Ce que vous obtenez</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Type de business identifié
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Services et offres principales
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Audience cible détectée
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Forces et faiblesses
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Opportunités de marché
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Recommandations stratégiques
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-[#6D3FC8] bg-[#6D3FC8]/5">
            <h3 className="font-semibold mb-3 text-[#6D3FC8]">
              💡 Cas d'usage
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Analyser vos concurrents</li>
              <li>• S'inspirer des leaders du marché</li>
              <li>• Identifier des opportunités</li>
              <li>• Améliorer votre propre site</li>
              <li>• Comprendre les tendances</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}