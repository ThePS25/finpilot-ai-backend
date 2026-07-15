const mongoose = require('mongoose');
const { SCENARIO_TYPES } = require('../constants');

const scenarioSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true,
    },
    scenarioType: {
      type: String,
      required: true,
      enum: SCENARIO_TYPES,
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    projections: {
      futureSavings: [{ month: Number, amount: Number }],
      goalTimelines: [{ goalId: String, goalName: String, projectedDate: Date }],
      netWorthGrowth: [{ month: Number, netWorth: Number }],
    },
    summary: {
      type: String,
    },
  },
  { timestamps: true }
);

scenarioSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Scenario', scenarioSchema);
