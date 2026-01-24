const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const {
  getProviderProfile,
  getProviderServices,
  becomeProvider,
  getProviderEarnings,
  updateAvailability,
  updateSchedule,
  getMyProviderProfile,
  markAsComplete
} = require("../controllers/provider.controller");
const checkRole = require("../middlewares/role.middleware");
const { addService: addProviderService } = require("../controllers/providerService.controller");

router.post("/become", auth, becomeProvider);

// Dashboard routes
router.get("/me", auth, getMyProviderProfile);
router.patch("/availability", auth, updateAvailability);
router.patch("/schedule", auth, updateSchedule);
router.patch("/bookings/:bookingId/complete", auth, markAsComplete);

router.get("/earnings", auth, checkRole("PROVIDER"), getProviderEarnings);
router.get("/:id", getProviderProfile);
router.get("/:id/services", getProviderServices);
router.post("/services", auth, addProviderService);


module.exports = router;
