const express = require("express");
const router = express.Router();
const { getAdminStats, getMonthlyStats } = require("../controllers/count.controller");

router.get("/admin-stats", getAdminStats);
router.get("/monthly-stats", getMonthlyStats);

module.exports = router;