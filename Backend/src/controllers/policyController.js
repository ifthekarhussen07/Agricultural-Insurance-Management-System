const mongoose = require('mongoose');
const Policy = require('../models/Policy');

/**
 * GET /api/policies
 * Farmers see only active policies. Admins see all.
 */
const getPolicies = async (req, res) => {
  try {
    const filter = req.user.role === 'Farmer' ? { isActive: true } : {};
    const policies = await Policy.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error('Get policies error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policies',
    });
  }
};

/**
 * POST /api/policies
 * Admin only.
 */
const createPolicy = async (req, res) => {
  try {
    const { policyName, coveredCrop, premiumAmount, coverageAmount, duration, description } = req.body;

    if (!policyName || !coveredCrop || premiumAmount == null || coverageAmount == null || !duration) {
      return res.status(400).json({
        success: false,
        message: 'policyName, coveredCrop, premiumAmount, coverageAmount, and duration are required',
      });
    }

    const policy = await Policy.create({
      policyName,
      coveredCrop,
      premiumAmount,
      coverageAmount,
      duration,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    console.error('Create policy error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating policy',
    });
  }
};

/**
 * PUT /api/policies/:id
 * Admin only.
 */
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID',
      });
    }

    const policy = await Policy.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: policy,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    console.error('Update policy error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating policy',
    });
  }
};

/**
 * DELETE /api/policies/:id
 * Admin only. Soft-delete: sets isActive = false.
 */
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID',
      });
    }

    const policy = await Policy.findById(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    if (!policy.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Policy is already deactivated',
      });
    }

    policy.isActive = false;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy deactivated successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Delete policy error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating policy',
    });
  }
};

module.exports = { getPolicies, createPolicy, updatePolicy, deletePolicy };
