'use client';

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      parameters?: {
        [key: string]: any;
      }
    ) => void;
  }
}

export const useAnalytics = () => {
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        page_path: url,
      });
    }
  };

  const trackWaitlistSignup = (source: string, profile?: string) => {
    trackEvent('waitlist_signup', 'engagement', source, 1);
    if (profile) {
      trackEvent('waitlist_profile', 'user_type', profile);
    }
  };

  const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent('button_click', 'interaction', `${buttonName}_${location}`);
  };

  return {
    trackEvent,
    trackPageView,
    trackWaitlistSignup,
    trackButtonClick,
  };
};