const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.route"));
router.use("/become-provider", require("./becomeProvider.route"));
router.use("/categories", require("./category.route"));
router.use("/providers", require("./provider.route"));
router.use("/services", require("./providerService.route"));
router.use("/bookings", require("./booking.route"));
module.exports = router;
