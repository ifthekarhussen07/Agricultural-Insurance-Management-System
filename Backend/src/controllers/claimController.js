const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

/**
 * POST /api/claims
 * Farmer only. Farmer ID comes from req.user, never from body.
 */
const createClaim = async (req, res) => {
  try {
    const { policy, crop, damageType, incidentDate, location, description, documentUrl } = req.body;

    // --- Validate required fields ---
    if (!policy || !crop || !damageType || !incidentDate || !location) {
      return res.status(400).json({
        success: false,
        message: 'policy, crop, damageType, incidentDate, and location are required',
      });
    }

    // --- Validate policy ID format ---
    if (!mongoose.Types.ObjectId.isValid(policy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID',
      });
    }

    // --- Check policy exists and is active ---
    const existingPolicy = await Policy.findById(policy);

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    if (!existingPolicy.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot file a claim against an inactive policy',
      });
    }

    // --- Create claim (farmer from token, status forced to Pending) ---
    const claim = await Claim.create({
      farmer: req.user._id,
      policy,
      crop,
      damageType,
      incidentDate,
      location,
      description,
      documentUrl,
      status: 'Pending',
    });

    // Populate references before returning
    await claim.populate([
      { path: 'farmer', select: 'name email' },
      { path: 'policy', select: 'policyName coveredCrop premiumAmount coverageAmount' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: claim,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    console.error('Create claim error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting claim',
    });
  }
};

/**
 * GET /api/claims
 * Farmer sees own claims. Admin sees all.
 */
const getClaims = async (req, res) => {
  try {
    const filter = req.user.role === 'Farmer' ? { farmer: req.user._id } : {};

    const claims = await Claim.find(filter)
      .populate('farmer', 'name email')
      .populate('policy', 'policyName coveredCrop premiumAmount coverageAmount')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error('Get claims error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims',
    });
  }
};

module.exports = { createClaim, getClaims };
