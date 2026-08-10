const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');

// GET    /api/policies      — Farmer & Admin (Farmers see active only)
router.get('/', authenticate, authorizeRoles('Admin', 'Farmer'), getPolicies);

// POST   /api/policies      — Admin only
router.post('/', authenticate, authorizeRoles('Admin'), createPolicy);

// PUT    /api/policies/:id  — Admin only
router.put('/:id', authenticate, authorizeRoles('Admin'), updatePolicy);

// DELETE /api/policies/:id  — Admin only (soft-delete)
router.delete('/:id', authenticate, authorizeRoles('Admin'), deletePolicy);

module.exports = router;
