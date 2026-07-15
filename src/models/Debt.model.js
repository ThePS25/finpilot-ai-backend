const mongoose = require('mongoose');
const { DEBT_TYPES } = require('../constants');

const debtSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Debt name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    debtType: {
      type: String,
      required: true,
      enum: DEBT_TYPES,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: [0, 'Principal cannot be negative'],
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: [0, 'Outstanding cannot be negative'],
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    monthlyEmi: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

debtSchema.index({ userId: 1, profileId: 1, isActive: 1 });

module.exports = mongoose.model('Debt', debtSchema);
