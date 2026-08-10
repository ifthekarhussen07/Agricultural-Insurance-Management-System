const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');
const { getStats } = require('../controllers/adminController');

// GET /api/admin/stats — Admin only
router.get('/stats', authenticate, authorizeRoles('Admin'), getStats);

module.exports = router;
