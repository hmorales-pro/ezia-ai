import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  projectId: { type: String, required: true }, // Lien vers le site UserProject
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  slug: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  author: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
  tags: [{ type: String }],
  keywords: [{ type: String }],
  tone: { 
    type: String,
    enum: ['professional', 'casual', 'academic', 'enthusiastic']
  },
  seoTitle: { type: String },
  seoDescription: { type: String },
  wordCount: { type: Number },
  readTime: { type: Number }, // en minutes
  calendarItemId: { type: String }, // Lien avec l'élément du calendrier
  metadata: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  aiGenerated: { type: Boolean, default: false },
  lastEditedBy: { type: String },
  userId: { type: String, required: true }
}, {
  timestamps: true
});

// Index pour améliorer les performances
blogPostSchema.index({ businessId: 1, status: 1 });
blogPostSchema.index({ projectId: 1, status: 1 }); // Pour récupérer articles d'un site
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);