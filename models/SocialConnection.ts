import mongoose from 'mongoose';

const socialConnectionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  platform: {
    type: String,
    enum: ['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'],
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
    select: false, // Don't include by default for security
  },
  refreshToken: {
    type: String,
    select: false,
  },
  expiresAt: Date,
  scope: String,
  username: String,
  userId: String,
  profileUrl: String,
  profileImageUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    autoPost: {
      type: Boolean,
      default: false,
    },
    reviewBeforePost: {
      type: Boolean,
      default: true,
    },
    addHashtags: {
      type: Boolean,
      default: true,
    },
    adaptContent: {
      type: Boolean,
      default: true,
    },
  },
  lastPostAt: Date,
  totalPosts: {
    type: Number,
    default: 0,
  },
  metrics: {
    totalImpressions: {
      type: Number,
      default: 0,
    },
    totalEngagements: {
      type: Number,
      default: 0,
    },
    avgEngagementRate: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Compound index for unique business-platform combination
socialConnectionSchema.index({ businessId: 1, platform: 1 }, { unique: true });

// Instance method to check if token is expired
socialConnectionSchema.methods.isTokenExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static method to get all active connections for a business
socialConnectionSchema.statics.getActiveConnections = function(businessId) {
  return this.find({ businessId, isActive: true });
};

// Virtual for display name
socialConnectionSchema.virtual('displayName').get(function() {
  return this.username || this.userId || 'Connected Account';
});

const SocialConnection = mongoose.models.SocialConnection || mongoose.model('SocialConnection', socialConnectionSchema);

export default SocialConnection;