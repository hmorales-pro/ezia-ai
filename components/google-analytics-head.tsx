import Script from 'next/script';

interface GoogleAnalyticsHeadProps {
  measurementId: string;
}

export default function GoogleAnalyticsHead({ measurementId }: GoogleAnalyticsHeadProps) {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        id="google-analytics-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}