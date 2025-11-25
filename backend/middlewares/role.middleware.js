const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user = decoded;
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied, error at role.middleware.js" });
        }
        next();
    };
};
module.exports = checkRole;