const mongoose = require('mongoose');
const { INCOME_TYPES, INCOME_FREQUENCIES } = require('../constants');

const incomeSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      required: [true, 'Income type is required'],
      enum: INCOME_TYPES,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: INCOME_FREQUENCIES,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, profileId: 1, date: -1 });
incomeSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Income', incomeSchema);
