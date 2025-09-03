'use client';

import { useEffect } from 'react';

export default function TestGAPage() {
  useEffect(() => {
    // Log GA status on mount
    if (typeof window !== 'undefined') {
      console.log('GA Test Page Loaded');
      console.log('window.dataLayer:', window.dataLayer);
      console.log('window.gtag:', window.gtag);
      
      // Send a test event
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: 'GA Test Page',
          page_location: window.location.href,
          page_path: '/test-ga'
        });
        console.log('Test event sent to GA');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Google Analytics Test Page</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">GA Configuration:</h2>
          <p>Measurement ID: <code className="bg-gray-200 px-2 py-1 rounded">G-T9XL833P0F</code></p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">To Verify GA is Working:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Chrome DevTools (F12)</li>
            <li>Go to Console tab</li>
            <li>Check for GA logs above</li>
            <li>Type: <code className="bg-gray-200 px-1">window.gtag</code> and press Enter</li>
            <li>You should see the gtag function</li>
          </ol>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Google Verification:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to Google Analytics</li>
            <li>Navigate to Admin → Data Streams → Web</li>
            <li>Click on your stream</li>
            <li>Check "Tagging Instructions"</li>
            <li>The tag should now be detected</li>
          </ol>
        </div>
        
        <button
          onClick={() => {
            if (window.gtag) {
              window.gtag('event', 'test_button_click', {
                event_category: 'engagement',
                event_label: 'test'
              });
              alert('Test event sent!');
            } else {
              alert('GA not loaded yet');
            }
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Send Test Event
        </button>
      </div>
    </div>
  );
}

// Add type declarations
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}