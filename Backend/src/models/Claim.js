const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required'],
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    damageType: {
      type: String,
      required: [true, 'Damage type is required'],
      trim: true,
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid claim status',
      },
      default: 'Pending',
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review notes cannot exceed 2000 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
