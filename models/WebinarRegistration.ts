import mongoose, { Schema, Document } from 'mongoose';

export interface IWebinarRegistration extends Document {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  interests?: string[];
  mainChallenge?: string;
  projectDescription?: string;
  expectations?: string;
  source?: string;
  registeredAt: Date;
  confirmed: boolean;
  attended?: boolean;
  reminderSent?: boolean;
  followUpSent?: boolean;
}

const WebinarRegistrationSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  interests: [{
    type: String,
    enum: [
      'ai_business_automation',
      'website_creation',
      'marketing_strategy',
      'market_analysis',
      'content_generation',
      'other'
    ]
  }],
  mainChallenge: {
    type: String,
    enum: ['time', 'content', 'market_analysis', 'marketing_strategy', 'other'],
    trim: true
  },
  projectDescription: {
    type: String,
    trim: true
  },
  expectations: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'social_media', 'email', 'referral', 'other'],
    default: 'website'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  attended: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
WebinarRegistrationSchema.index({ email: 1 });
WebinarRegistrationSchema.index({ registeredAt: -1 });

export const WebinarRegistration = mongoose.models.WebinarRegistration ||
  mongoose.model<IWebinarRegistration>('WebinarRegistration', WebinarRegistrationSchema);
