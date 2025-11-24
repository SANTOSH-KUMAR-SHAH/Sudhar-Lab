const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied, error at role.middleware.js" });
        }
        next();
    };
};
module.exports = checkRole;