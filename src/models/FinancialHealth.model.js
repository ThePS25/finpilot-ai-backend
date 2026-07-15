const mongoose = require('mongoose');

const financialHealthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    components: {
      savingsRate: { score: Number, value: Number, weight: Number },
      debtRatio: { score: Number, value: Number, weight: Number },
      emergencyFund: { score: Number, value: Number, weight: Number },
      investmentRatio: { score: Number, value: Number, weight: Number },
    },
    reasons: [String],
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

financialHealthSchema.index({ userId: 1, profileId: 1, calculatedAt: -1 });

module.exports = mongoose.model('FinancialHealth', financialHealthSchema);
