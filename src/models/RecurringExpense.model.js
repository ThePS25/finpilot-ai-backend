const mongoose = require('mongoose');
const { RECURRING_FREQUENCIES } = require('../constants');

const recurringExpenseSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: RECURRING_FREQUENCIES,
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: { type: Date },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastGeneratedAt: { type: Date },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

recurringExpenseSchema.index({ userId: 1, isActive: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
