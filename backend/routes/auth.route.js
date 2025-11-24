const {signup,login,logout} = require('../controllers/auth.controller');
const { verifyToken } = require('../utils/jwt');
const express = require('express');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Public /me endpoint that optionally returns the current user if a valid token is provided.
// This avoids returning 401 for unauthenticated public pages that call the endpoint.
router.get("/me", (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.json({ user: null });

    const decoded = verifyToken(token);
    if (!decoded) return res.json({ user: null });

    res.json({ user: decoded });
});

module.exports = router;