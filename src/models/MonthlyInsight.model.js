const mongoose = require('mongoose');

const monthlyInsightSchema = new mongoose.Schema(
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
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    insights: [
      {
        category: {
          type: String,
          enum: ['spending', 'savings', 'investment', 'general'],
        },
        title: String,
        description: String,
        trend: {
          type: String,
          enum: ['up', 'down', 'stable'],
        },
        percentageChange: Number,
      },
    ],
    summary: {
      type: String,
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

monthlyInsightSchema.index({ userId: 1, year: -1, month: -1 }, { unique: true, sparse: true });
monthlyInsightSchema.index({ userId: 1, profileId: 1, year: -1, month: -1 });

module.exports = mongoose.model('MonthlyInsight', monthlyInsightSchema);
