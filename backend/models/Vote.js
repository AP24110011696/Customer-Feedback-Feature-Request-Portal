const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Compound unique index ensures 1 user can vote for a request only once
voteSchema.index({ requestId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
