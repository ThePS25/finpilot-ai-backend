const mongoose = require('mongoose');
const { GOAL_TYPES } = require('../constants');

const goalSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    goalName: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [200, 'Goal name cannot exceed 200 characters'],
    },
    goalType: {
      type: String,
      enum: GOAL_TYPES,
      default: 'Other',
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    currentSavings: {
      type: Number,
      default: 0,
      min: [0, 'Current savings cannot be negative'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

goalSchema.virtual('remainingAmount').get(function getRemaining() {
  return Math.max(0, this.targetAmount - this.currentSavings);
});

goalSchema.virtual('completionPercentage').get(function getCompletion() {
  if (this.targetAmount === 0) return 100;
  return Math.min(100, (this.currentSavings / this.targetAmount) * 100);
});

goalSchema.virtual('monthsRemaining').get(function getMonthsRemaining() {
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
});

goalSchema.virtual('monthlyRequiredInvestment').get(function getMonthlyRequired() {
  const remaining = this.remainingAmount;
  const months = this.monthsRemaining;
  if (months <= 0) return remaining;
  return remaining / months;
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

goalSchema.index({ userId: 1, profileId: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
