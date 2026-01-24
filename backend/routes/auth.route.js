const { signup, login, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../utils/jwt');
const express = require('express');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

const prisma = require('../utils/db');

router.get("/me", async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.json({ user: null });

    const decoded = verifyToken(token);
    if (!decoded) return res.json({ user: null });

    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                providerProfile: { select: { applicationStatus: true } }
            }
        });

        if (!user) return res.json({ user: null });

        res.json({ user });
    } catch (err) {
        console.error("Error fetching me:", err);
        res.json({ user: null });
    }
});

module.exports = router;