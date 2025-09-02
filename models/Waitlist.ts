import { Schema, model, models } from 'mongoose';

export interface IWaitlist {
  email: string;
  name: string;
  company?: string;
  message?: string;
  profile?: string;
  needs?: string;
  urgency?: string;
  source?: string;
  metadata?: {
    userAgent?: string;
    referer?: string;
    ip?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new Schema<IWaitlist>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  profile: {
    type: String,
    enum: ['startup', 'established', 'entrepreneur', 'association', 'tpe-pme', 'etudiant', 'other'],
    default: 'other'
  },
  needs: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['immediate', '3_months', 'exploring', 'now', 'soon', 'curious'],
    default: 'exploring'
  },
  source: {
    type: String,
    default: 'website'
  },
  metadata: {
    userAgent: String,
    referer: String,
    ip: String
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
waitlistSchema.index({ createdAt: -1 });
waitlistSchema.index({ profile: 1 });
waitlistSchema.index({ urgency: 1 });
waitlistSchema.index({ source: 1 });

const Waitlist = models.Waitlist || model<IWaitlist>('Waitlist', waitlistSchema);

export default Waitlist;