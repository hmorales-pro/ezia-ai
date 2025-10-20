import Stripe from 'stripe';

// Initialiser Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Prix Stripe (à créer dans le dashboard Stripe)
export const STRIPE_PRICES = {
  creator_monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY!,
  creator_yearly: process.env.STRIPE_PRICE_CREATOR_YEARLY!,
} as const;

// Plans disponibles
export const PLANS = {
  free: {
    name: 'Gratuit',
    limits: {
      businesses: 1,
      analyses: 5,
      contentPublications: 10,
    },
  },
  creator: {
    name: 'Creator',
    limits: {
      businesses: 3,
      analyses: -1, // illimité
      contentPublications: -1, // illimité
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
