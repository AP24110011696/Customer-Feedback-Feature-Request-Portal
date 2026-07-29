const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeatureRequest',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

commentSchema.index({ requestId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
