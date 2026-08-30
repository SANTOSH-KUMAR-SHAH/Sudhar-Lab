const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/jwt");
const prisma = require("../utils/db");

async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);

    if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });

    // Check if user is blocked (with fallback for mock)
    try {
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { status: true, role: true } });
        if (user && user.status === "BLOCKED") {
            return res.status(403).json({ message: "Your account is BLOCKED by admin." });
        }
    } catch (e) { /* mock fallback ignore */ }

    req.user = decoded;

    next();
}
module.exports = authMiddleware;