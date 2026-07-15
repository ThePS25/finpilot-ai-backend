const mongoose = require('mongoose');
const { PROFILE_RELATIONS } = require('../constants');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    relation: {
      type: String,
      required: [true, 'Relation is required'],
      enum: PROFILE_RELATIONS,
    },
    dateOfBirth: {
      type: Date,
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

profileSchema.index({ userId: 1, name: 1 });
profileSchema.index({ userId: 1, isPrimary: 1 });

module.exports = mongoose.model('Profile', profileSchema);
