/**
 * Role-based authorization middleware.
 *
 * Usage:
 *   authorizeRoles('Admin')
 *   authorizeRoles('Farmer')
 *   authorizeRoles('Admin', 'Farmer')
 *
 * Must be used AFTER the authenticate middleware so req.user is available.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
