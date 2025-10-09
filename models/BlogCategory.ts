import mongoose from 'mongoose';

const blogCategorySchema = new mongoose.Schema({
  projectId: { type: String, required: true, index: true },
  businessId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6D3FC8' },
  order: { type: Number, default: 0 }, // Pour l'ordre d'affichage
  metadata: {
    postCount: { type: Number, default: 0 },
    lastPostAt: { type: Date }
  }
}, {
  timestamps: true
});

// Index composés pour requêtes fréquentes
blogCategorySchema.index({ projectId: 1, slug: 1 }, { unique: true });
blogCategorySchema.index({ businessId: 1, projectId: 1 });

// Méthode pour générer un slug unique
blogCategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export default mongoose.models.BlogCategory || mongoose.model('BlogCategory', blogCategorySchema);
