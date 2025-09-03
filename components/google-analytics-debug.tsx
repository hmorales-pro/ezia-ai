'use client';

import { useEffect } from 'react';

export default function GoogleAnalyticsDebug() {
  useEffect(() => {
    // Add debug info to window for easy access
    if (typeof window !== 'undefined') {
      (window as any).checkGA = () => {
        console.log('=== Google Analytics Debug Info ===');
        console.log('GA Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
        console.log('dataLayer exists:', !!(window as any).dataLayer);
        console.log('dataLayer contents:', (window as any).dataLayer);
        console.log('gtag function exists:', typeof (window as any).gtag === 'function');
        
        // Check if GA script is loaded
        const gaScripts = Array.from(document.scripts).filter(script => 
          script.src.includes('googletagmanager.com')
        );
        console.log('GA scripts loaded:', gaScripts.length);
        gaScripts.forEach((script, index) => {
          console.log(`  Script ${index + 1}: ${script.src}`);
        });
        
        // Try to send a test event
        if (typeof (window as any).gtag === 'function') {
          console.log('Sending test event...');
          (window as any).gtag('event', 'page_view_debug', {
            page_title: 'Debug Test',
            page_location: window.location.href,
            debug_mode: true
          });
        }
      };
      
      console.log('Google Analytics Debug Helper loaded. Run window.checkGA() in console to debug.');
    }
  }, []);

  return null;
}