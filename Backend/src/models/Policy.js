const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      maxlength: [200, 'Policy name cannot exceed 200 characters'],
    },
    coveredCrop: {
      type: String,
      required: [true, 'Covered crop is required'],
      trim: true,
    },
    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [0, 'Premium amount cannot be negative'],
    },
    coverageAmount: {
      type: Number,
      required: [true, 'Coverage amount is required'],
      min: [0, 'Coverage amount cannot be negative'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Policy', policySchema);
