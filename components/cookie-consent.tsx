'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Activer Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Désactiver Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  };

  const customizeConsent = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <Cookie className="w-8 h-8 text-[#6D3FC8] shrink-0" />
          
          <div className="flex-1">
            <h3 className="font-semibold text-[#1E1E1E] mb-1">
              Nous utilisons des cookies 🍪
            </h3>
            <p className="text-sm text-[#666666]">
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
              En continuant, vous acceptez notre utilisation des cookies.
            </p>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Types de cookies :</h4>
                <ul className="space-y-2 text-sm text-[#666666]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6D3FC8]">•</span>
                    <div>
                      <strong>Essentiels</strong> : Nécessaires au fonctionnement du site (toujours actifs)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6D3FC8]">•</span>
                    <div>
                      <strong>Analytics</strong> : Google Analytics pour comprendre comment vous utilisez le site
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6D3FC8]">•</span>
                    <div>
                      <strong>Marketing</strong> : Pour vous proposer du contenu pertinent (actuellement désactivés)
                    </div>
                  </li>
                </ul>
                <p className="mt-3 text-xs">
                  Pour plus d'informations, consultez notre{' '}
                  <Link href="/privacy" className="text-[#6D3FC8] hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={customizeConsent}
              className="text-[#666666] hover:text-[#6D3FC8]"
            >
              {showDetails ? 'Masquer' : 'Personnaliser'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={acceptEssential}
            >
              Essentiels uniquement
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
            >
              Tout accepter
            </Button>
          </div>
          
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 lg:static text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}