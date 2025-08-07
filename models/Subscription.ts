import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user_id: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  features: {
    max_businesses: number;
    max_analyses_per_month: number;
    max_websites: number;
    priority_support: boolean;
    custom_domain: boolean;
    white_label: boolean;
    api_access: boolean;
  };
  billing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    next_billing_date?: Date;
  };
  usage: {
    businesses_created: number;
    analyses_this_month: number;
    websites_created: number;
  };
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_ends_at?: Date;
  created_at: Date;
  updated_at: Date;
  cancelled_at?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user_id: { type: String, required: true, unique: true },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trialing'],
    default: 'active',
    required: true
  },
  features: {
    max_businesses: { type: Number, default: 1 },
    max_analyses_per_month: { type: Number, default: 5 },
    max_websites: { type: Number, default: 1 },
    priority_support: { type: Boolean, default: false },
    custom_domain: { type: Boolean, default: false },
    white_label: { type: Boolean, default: false },
    api_access: { type: Boolean, default: false }
  },
  billing: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    interval: { 
      type: String, 
      enum: ['monthly', 'yearly'],
      default: 'monthly' 
    },
    next_billing_date: Date
  },
  usage: {
    businesses_created: { type: Number, default: 0 },
    analyses_this_month: { type: Number, default: 0 },
    websites_created: { type: Number, default: 0 }
  },
  stripe_customer_id: String,
  stripe_subscription_id: String,
  trial_ends_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  cancelled_at: Date
});

// Plans Ezia
export const EZIA_PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    features: {
      max_businesses: 1,
      max_analyses_per_month: 5,
      max_websites: 1,
      priority_support: false,
      custom_domain: false,
      white_label: false,
      api_access: false
    },
    description: 'Parfait pour découvrir Ezia'
  },
  starter: {
    name: 'Starter',
    price: 29,
    price_yearly: 290, // 2 mois offerts
    features: {
      max_businesses: 3,
      max_analyses_per_month: 50,
      max_websites: 3,
      priority_support: false,
      custom_domain: false,
      white_label: false,
      api_access: false
    },
    description: 'Pour les entrepreneurs qui démarrent'
  },
  pro: {
    name: 'Pro',
    price: 79,
    price_yearly: 790, // 2 mois offerts
    features: {
      max_businesses: 10,
      max_analyses_per_month: -1, // illimité
      max_websites: 10,
      priority_support: true,
      custom_domain: true,
      white_label: false,
      api_access: true
    },
    description: 'Pour les professionnels ambitieux'
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    price_yearly: 2990, // 2 mois offerts
    features: {
      max_businesses: -1, // illimité
      max_analyses_per_month: -1, // illimité
      max_websites: -1, // illimité
      priority_support: true,
      custom_domain: true,
      white_label: true,
      api_access: true
    },
    description: 'Pour les grandes organisations'
  }
};

// Middleware pour mettre à jour updated_at
SubscriptionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);