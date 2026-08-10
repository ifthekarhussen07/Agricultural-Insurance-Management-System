const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');
const { createClaim, getClaims, updateClaimStatus } = require('../controllers/claimController');

// POST /api/claims — Farmer only
router.post('/', authenticate, authorizeRoles('Farmer'), createClaim);

// GET  /api/claims — Farmer (own) & Admin (all)
router.get('/', authenticate, authorizeRoles('Admin', 'Farmer'), getClaims);

// PUT  /api/claims/:id/status — Admin only (approve/reject)
router.put('/:id/status', authenticate, authorizeRoles('Admin'), updateClaimStatus);

module.exports = router;

