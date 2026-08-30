const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.route"));
router.use("/become-provider", require("./becomeProvider.route"));
router.use("/categories", require("./category.route"));
router.use("/providers", require("./provider.route"));
router.use("/services", require("./providerService.route"));
router.use("/bookings", require("./booking.route"));
router.use("/customers", require("./customer.route"));
router.use("/customers/addresses", require("./customerAddress.route"));
router.use("/admin", require("./admin.route"));
router.use("/count", require("./count.route"));
router.use("/feedback", require("./feedback.route"));
router.use("/notifications", require("./notification.route"));
router.use("/appliances", require("./appliance.route"));
router.use("/service-requests", require("./serviceRequest.route"));
module.exports = router;

