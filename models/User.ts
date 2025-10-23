import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'pro' | 'beta';
  isEmailVerified: boolean;
  businesses: string[];
  projects: string[];
  subscription?: {
    plan: 'free' | 'creator' | 'pro' | 'enterprise';
    validUntil?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  usage?: {
    imagesGenerated: number;
    imagesQuota: number;
    lastImageReset?: Date;
  };
  betaTester?: {
    isBetaTester: boolean;
    invitedAt?: Date;
    invitedBy?: string;
    hasUnlimitedAccess: boolean;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  fullName: {
    type: String,
    trim: true,
  },
  avatarUrl: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'pro', 'beta'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'creator', 'pro', 'enterprise'],
      default: 'free',
    },
    validUntil: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  usage: {
    imagesGenerated: {
      type: Number,
      default: 0,
    },
    imagesQuota: {
      type: Number,
      default: 0,
    },
    lastImageReset: Date,
  },
  betaTester: {
    isBetaTester: {
      type: Boolean,
      default: false,
    },
    invitedAt: Date,
    invitedBy: String,
    hasUnlimitedAccess: {
      type: Boolean,
      default: false,
    },
    notes: String,
  },
  lastLoginAt: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);