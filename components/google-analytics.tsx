import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configuration par défaut du consentement (RGPD)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'functionality_storage': 'granted',
              'personalization_storage': 'denied',
              'security_storage': 'granted'
            });
            
            // Configuration initiale
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
            
            // Vérifier le consentement après le chargement
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                try {
                  const consent = localStorage.getItem('cookie-consent');
                  if (consent !== 'all') {
                    // Si l'utilisateur n'a pas consenti, désactiver
                    gtag('consent', 'update', {
                      'analytics_storage': 'denied'
                    });
                  }
                } catch (e) {
                  console.error('Error checking consent:', e);
                }
              });
            }
          `,
        }}
      />
    </>
  );
}