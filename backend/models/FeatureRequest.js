const mongoose = require('mongoose');

const featureRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['UI/UX', 'Feature', 'Integration', 'Performance', 'Other'],
      default: 'Feature',
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'implemented', 'rejected'],
      default: 'pending',
    },
    sentiment: {
      label: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
      score: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Trending score: combines popularity (votes) with recency.
// Exposed as a virtual so we can sort by it in code after fetching.
featureRequestSchema.virtual('trendingScore').get(function () {
  const ageHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  // Reddit-like "hot" formula — log votes with decay by age.
  return (this.votes + 1) / Math.pow(ageHours + 2, 1.5);
});

featureRequestSchema.set('toJSON', { virtuals: true });
featureRequestSchema.set('toObject', { virtuals: true });

featureRequestSchema.index({ votes: -1, createdAt: -1 });
featureRequestSchema.index({ status: 1 });
featureRequestSchema.index({ category: 1 });

module.exports = mongoose.model('FeatureRequest', featureRequestSchema);
