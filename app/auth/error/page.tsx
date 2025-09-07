'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  access_denied: "Vous avez refusé l'autorisation d'accès",
  missing_params: "Paramètres d'authentification manquants",
  callback_failed: "Échec de la connexion au réseau social",
  server_error: "Erreur serveur lors de l'authentification",
  invalid_state: "Session d'authentification invalide",
};

const platformNames: Record<string, string> = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown';
  const provider = searchParams.get('provider') || 'unknown';

  const errorMessage = errorMessages[error] || 'Une erreur inconnue est survenue';
  const platformName = platformNames[provider] || 'Réseau social';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Échec de la connexion
          </h1>
          
          <p className="text-gray-600 mb-6">
            {errorMessage} avec {platformName}.
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Si le problème persiste, contactez le support.
          </p>
        </div>
      </Card>
    </div>
  );
}