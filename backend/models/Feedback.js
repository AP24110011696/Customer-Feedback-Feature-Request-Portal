const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
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
      enum: ['Bug', 'UI/UX', 'Performance', 'General', 'Other'],
      default: 'General',
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

// Indexes to accelerate common queries
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ category: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
