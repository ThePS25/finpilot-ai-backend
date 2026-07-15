const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
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
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'png', 'jpg', 'jpeg'],
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
    },
    extractedData: {
      basicSalary: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 },
      grossSalary: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
      employerName: { type: String },
      employeeName: { type: String },
      employeeId: { type: String },
      designation: { type: String },
      panNumber: { type: String },
      payPeriod: { type: String },
    },
    extractionStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    extractionError: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isCorrected: {
      type: Boolean,
      default: false,
    },
    isSyncedToIncome: {
      type: Boolean,
      default: false,
    },
    linkedIncomeIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Income',
    }],
    rawExtraction: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

payslipSchema.index({ userId: 1, profileId: 1, year: -1, month: -1 });

module.exports = mongoose.model('Payslip', payslipSchema);
