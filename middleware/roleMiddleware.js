module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    try {
      // Make sure authMiddleware ran first
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - user not authenticated" });
      }

      // Make sure user has a role
      if (!req.user.role) {
        return res.status(403).json({ message: "Access denied - no role assigned" });
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied - requires role: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (err) {
      console.error("Role authorization error:", err);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};