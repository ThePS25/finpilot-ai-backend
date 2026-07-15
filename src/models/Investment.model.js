const mongoose = require('mongoose');
const { INVESTMENT_TYPES } = require('../constants');

const investmentSchema = new mongoose.Schema(
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
    investmentType: {
      type: String,
      required: [true, 'Investment type is required'],
      enum: INVESTMENT_TYPES,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    amountInvested: {
      type: Number,
      required: [true, 'Amount invested is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value cannot be negative'],
    },
    startDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

investmentSchema.virtual('returns').get(function getReturns() {
  return this.currentValue - this.amountInvested;
});

investmentSchema.virtual('roiPercentage').get(function getRoi() {
  if (this.amountInvested === 0) return 0;
  return ((this.currentValue - this.amountInvested) / this.amountInvested) * 100;
});

investmentSchema.set('toJSON', { virtuals: true });
investmentSchema.set('toObject', { virtuals: true });

investmentSchema.index({ userId: 1, profileId: 1 });
investmentSchema.index({ userId: 1, investmentType: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
