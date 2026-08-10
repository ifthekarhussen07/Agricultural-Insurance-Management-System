const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

/**
 * GET /api/admin/stats
 * Admin only. Returns dashboard statistics.
 */
const getStats = async (req, res) => {
  try {
    const [
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalPolicies,
      activePolicies,
    ] = await Promise.all([
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'Pending' }),
      Claim.countDocuments({ status: 'Approved' }),
      Claim.countDocuments({ status: 'Rejected' }),
      Policy.countDocuments(),
      Policy.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        totalPolicies,
        activePolicies,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
    });
  }
};

module.exports = { getStats };
