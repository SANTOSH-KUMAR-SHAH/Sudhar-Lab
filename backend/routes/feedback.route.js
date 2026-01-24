const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");
const {
    createReview,
    getProviderReviews,
    createReport,
    getAdminReports,
    getAdminFeedbackStats
} = require("../controllers/feedback.controller");

// Reviews
router.post("/reviews", auth, createReview);
router.get("/reviews/provider", auth, checkRole("PROVIDER"), getProviderReviews);

// Reports
router.post("/reports", auth, createReport); // Usually customers
router.get("/reports/admin", auth, checkRole("ADMIN"), getAdminReports);

// Admin Stats
router.get("/admin/stats", auth, checkRole("ADMIN"), getAdminFeedbackStats);

module.exports = router;
