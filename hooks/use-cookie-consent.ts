'use client';

import { useState, useEffect } from 'react';

export type ConsentType = 'all' | 'essential' | null;

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent') as ConsentType;
    setConsent(storedConsent);
    setIsLoading(false);
  }, []);

  const updateConsent = (newConsent: ConsentType) => {
    if (newConsent === null) {
      localStorage.removeItem('cookie-consent');
      localStorage.removeItem('cookie-consent-date');
    } else {
      localStorage.setItem('cookie-consent', newConsent);
      localStorage.setItem('cookie-consent-date', new Date().toISOString());
    }
    setConsent(newConsent);

    // Mettre à jour Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': newConsent === 'all' ? 'granted' : 'denied'
      });
    }
  };

  const hasAnalyticsConsent = () => {
    return consent === 'all';
  };

  const resetConsent = () => {
    updateConsent(null);
    window.location.reload(); // Recharger pour afficher la bannière
  };

  return {
    consent,
    isLoading,
    updateConsent,
    hasAnalyticsConsent,
    resetConsent
  };
};